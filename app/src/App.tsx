import { useState, useMemo, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import { Header } from '@/components/Header';
import { Dashboard } from '@/components/Dashboard';
import { Ventas } from '@/components/Ventas';
import { Productos } from '@/components/Productos';
import { Gastos } from '@/components/Gastos';
import { BottomNav } from '@/components/BottomNav';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useTheme } from '@/hooks/useTheme';
import { useDate } from '@/hooks/useDate';
import { generatePDF, generateYearlyPDF } from '@/lib/pdfGenerator';
import { showSuccess, showError } from '@/lib/notifications';
import type { Producto, Venta, Gasto, Produccion } from '@/types';

type Section = 'dashboard' | 'ventas' | 'productos' | 'gastos';

function App() {
  const { isDark, toggleTheme } = useTheme();
  const { getMesActual, getMesFromFecha } = useDate();
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [mesActual, setMesActual] = useState(getMesActual());

  // Data storage
  const [productos, setProductos] = useLocalStorage<Producto[]>('vs_productos', []);
  const [producciones, setProducciones] = useLocalStorage<Produccion[]>('vs_producciones', []);
  const [ventas, setVentas] = useLocalStorage<Venta[]>('vs_ventas', []);
  const [gastos, setGastos] = useLocalStorage<Gasto[]>('vs_gastos', []);

  // Get all available months
  const mesesDisponibles = useMemo(() => {
    const meses = new Set<string>();
    
    [...producciones, ...ventas, ...gastos].forEach(item => {
      const mes = getMesFromFecha(item.fecha);
      meses.add(mes);
    });
    
    meses.add(getMesActual());
    
    return Array.from(meses).sort().reverse();
  }, [producciones, ventas, gastos]);

  // Calcular efectivo total en caja (acumulativo de todos los meses)
  const efectivoTotal = useMemo(() => {
    const totalVentas = ventas.reduce((sum, v) => sum + v.total, 0);
    const totalGastosFab = gastos.filter(g => g.tipo === 'fabricacion').reduce((sum, g) => sum + g.monto, 0);
    const totalGastosPers = gastos.filter(g => g.tipo === 'personal').reduce((sum, g) => sum + g.monto, 0);
    return totalVentas - totalGastosFab - totalGastosPers;
  }, [ventas, gastos]);

  // Handlers
  const handleGuardarProducto = useCallback((productoData: Omit<Producto, 'id' | 'stock' | 'unidadesProducidasTotal' | 'fechaCreacion'>) => {
    const nuevoProducto: Producto = {
      ...productoData,
      id: Date.now(),
      stock: 0,
      unidadesProducidasTotal: 0,
      fechaCreacion: new Date().toISOString(),
    };
    setProductos(prev => [...prev, nuevoProducto]);
  }, [setProductos]);

  const handleGuardarProduccion = useCallback((prodData: Omit<Produccion, 'id' | 'fecha' | 'mes' | 'productoNombre'>) => {
    const producto = productos.find(p => p.id === prodData.productoId);
    if (!producto) return;

    const nuevaProduccion: Produccion = {
      ...prodData,
      id: Date.now(),
      productoNombre: producto.nombre,
      fecha: new Date().toISOString(),
      mes: mesActual,
    };

    setProducciones(prev => [...prev, nuevaProduccion]);
    
    // Update product stock
    setProductos(prev => prev.map(p => 
      p.id === prodData.productoId 
        ? { ...p, stock: p.stock + prodData.cantidad, unidadesProducidasTotal: p.unidadesProducidasTotal + prodData.cantidad }
        : p
    ));
  }, [productos, mesActual, setProducciones, setProductos]);

  const handleGuardarVenta = useCallback((ventaData: Omit<Venta, 'id' | 'fecha' | 'mes'>) => {
    const nuevaVenta: Venta = {
      ...ventaData,
      id: Date.now(),
      fecha: new Date().toISOString(),
      mes: mesActual,
    };

    setVentas(prev => [...prev, nuevaVenta]);
    
    // Update product stock
    setProductos(prev => prev.map(p => 
      p.id === ventaData.productoId 
        ? { ...p, stock: p.stock - ventaData.cantidad }
        : p
    ));
  }, [mesActual, setVentas, setProductos]);

  const handleEliminarVenta = useCallback((id: number) => {
    const venta = ventas.find(v => v.id === id);
    if (!venta) return;

    // Restore stock
    setProductos(prev => prev.map(p => 
      p.id === venta.productoId 
        ? { ...p, stock: p.stock + venta.cantidad }
        : p
    ));

    setVentas(prev => prev.filter(v => v.id !== id));
  }, [ventas, setVentas, setProductos]);

  const handleGuardarGasto = useCallback((gastoData: Omit<Gasto, 'id' | 'mes'>) => {
    const mesGasto = getMesFromFecha(gastoData.fecha);
    
    const nuevoGasto: Gasto = {
      ...gastoData,
      id: Date.now(),
      mes: mesGasto,
    };

    setGastos(prev => [...prev, nuevoGasto]);
  }, [setGastos, getMesFromFecha]);

  const handleEliminarGasto = useCallback((id: number) => {
    setGastos(prev => prev.filter(g => g.id !== id));
  }, [setGastos]);

  const handleEliminarProducto = useCallback((id: number) => {
    setProductos(prev => prev.filter(p => p.id !== id));
    setProducciones(prev => prev.filter(p => p.productoId !== id));
    setVentas(prev => prev.filter(v => v.productoId !== id));
  }, [setProductos, setProducciones, setVentas]);

  const handleGenerarPDF = useCallback(async (tipo: 'mes' | 'anio') => {
    try {
      if (tipo === 'mes') {
        const datosMes = calcularCostosMes(mesActual);
        const ventasMes = ventas.filter(v => v.mes === mesActual).reduce((sum, v) => sum + v.total, 0);
        const gastosPersMes = gastos.filter(g => g.mes === mesActual && g.tipo === 'personal').reduce((sum, g) => sum + g.monto, 0);

        await generatePDF({
          mes: mesActual,
          productos,
          ventas: ventas.filter(v => v.mes === mesActual),
          gastos: gastos.filter(g => g.mes === mesActual),
          producciones: producciones.filter(p => p.mes === mesActual),
          datosMes,
          totalVentas: ventasMes,
          totalGastosPersonales: gastosPersMes,
          efectivoTotal,
        });
        showSuccess('PDF generado correctamente');
      } else {
        const year = mesActual.split('-')[0];
        const allData = [];
        
        for (let i = 1; i <= 12; i++) {
          const mesKey = `${year}-${String(i).padStart(2, '0')}`;
          const datos = calcularCostosMes(mesKey);
          const ventasMes = ventas.filter(v => v.mes === mesKey).reduce((sum, v) => sum + v.total, 0);
          const gastosPersMes = gastos.filter(g => g.mes === mesKey && g.tipo === 'personal').reduce((sum, g) => sum + g.monto, 0);
          
          allData.push({
            mes: mesKey,
            ventas: ventasMes,
            gastosFab: datos.gastosFab,
            gastosPers: gastosPersMes,
            unidades: datos.unidades,
          });
        }

        await generateYearlyPDF(year, allData, efectivoTotal);
        showSuccess('PDF anual generado correctamente');
      }
    } catch (error) {
      showError('Error al generar el PDF');
      console.error(error);
    }
  }, [mesActual, productos, ventas, gastos, producciones, efectivoTotal]);

  const calcularCostosMes = (mes: string) => {
    const produccionesMes = producciones.filter(p => p.mes === mes);
    const totalUnidadesMes = produccionesMes.reduce((sum, p) => sum + p.cantidad, 0);
    const totalMaterialesMes = produccionesMes.reduce((sum, p) => sum + p.costoMateriales, 0);
    
    const gastosFabMes = gastos.filter(g => {
      const fecha = new Date(g.fecha);
      const mesGasto = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      return g.tipo === 'fabricacion' && mesGasto === mes;
    }).reduce((sum, g) => sum + g.monto, 0);

    let costoUnitarioMes = 0;
    if (totalUnidadesMes > 0) {
      costoUnitarioMes = (totalMaterialesMes + gastosFabMes) / totalUnidadesMes;
    }

    return {
      unidades: totalUnidadesMes,
      materiales: totalMaterialesMes,
      gastosFab: gastosFabMes,
      costoUnitario: costoUnitarioMes
    };
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-950 transition-colors">
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            padding: '12px 20px',
          },
        }}
      />
      
      <Header 
        isDark={isDark}
        toggleTheme={toggleTheme}
        mesActual={mesActual}
        mesesDisponibles={mesesDisponibles}
        onCambiarMes={setMesActual}
        onGenerarPDF={handleGenerarPDF}
      />

      <main className="pt-0">
        {activeSection === 'dashboard' && (
          <Dashboard 
            mesActual={mesActual}
            productos={productos}
            ventas={ventas}
            gastos={gastos}
            producciones={producciones}
            efectivoTotal={efectivoTotal}
          />
        )}
        
        {activeSection === 'ventas' && (
          <Ventas 
            mesActual={mesActual}
            productos={productos}
            ventas={ventas}
            onGuardarVenta={handleGuardarVenta}
            onEliminarVenta={handleEliminarVenta}
          />
        )}
        
        {activeSection === 'productos' && (
          <Productos 
            mesActual={mesActual}
            productos={productos}
            producciones={producciones}
            onGuardarProducto={handleGuardarProducto}
            onGuardarProduccion={handleGuardarProduccion}
            onEliminarProducto={handleEliminarProducto}
          />
        )}
        
        {activeSection === 'gastos' && (
          <Gastos 
            mesActual={mesActual}
            gastos={gastos}
            onGuardarGasto={handleGuardarGasto}
            onEliminarGasto={handleEliminarGasto}
          />
        )}
      </main>

      <BottomNav 
        activeSection={activeSection}
        onNavigate={setActiveSection}
      />
    </div>
  );
}

export default App;
