import { TrendingUp, TrendingDown, Package, DollarSign, Wallet, Factory, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { formatMoney } from '@/lib/utils';
import { useDate } from '@/hooks/useDate';
import type { Producto, Venta, Gasto, Produccion } from '@/types';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
);

interface DashboardProps {
  mesActual: string;
  productos: Producto[];
  ventas: Venta[];
  gastos: Gasto[];
  producciones: Produccion[];
  efectivoTotal: number;
}

interface DatosMes {
  unidades: number;
  materiales: number;
  gastosFab: number;
  costoUnitario: number;
}

export function Dashboard({ mesActual, productos, ventas, gastos, producciones, efectivoTotal }: DashboardProps) {
  const { getUltimosMeses, getNombreMesCorto } = useDate();

  const calcularCostosMes = (mes: string): DatosMes => {
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

  const datosMes = calcularCostosMes(mesActual);
  const ventasMes = ventas.filter(v => v.mes === mesActual).reduce((sum, v) => sum + v.total, 0);
  const gastosPersMes = gastos.filter(g => g.mes === mesActual && g.tipo === 'personal').reduce((sum, g) => sum + g.monto, 0);

  // Datos para gráficos
  const ultimosMeses = getUltimosMeses(6);
  const mesesLabels = ultimosMeses.map(m => getNombreMesCorto(m));
  
  const costosData = ultimosMeses.map(m => calcularCostosMes(m).costoUnitario);
  const prodData = ultimosMeses.map(m => calcularCostosMes(m).unidades);
  const ventasData = ultimosMeses.map(m => {
    const v = ventas.filter(venta => venta.mes === m).reduce((sum, venta) => sum + venta.total, 0);
    return v / 1000;
  });

  const costoChartData = {
    labels: mesesLabels,
    datasets: [{
      label: 'Costo por Unidad',
      data: costosData,
      borderColor: '#f97316',
      backgroundColor: 'rgba(249, 115, 22, 0.15)',
      fill: true,
      tension: 0.4,
      pointRadius: 5,
      pointBackgroundColor: '#f97316',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
    }]
  };

  const prodVentasChartData = {
    labels: mesesLabels,
    datasets: [
      {
        label: 'Unidades',
        data: prodData,
        backgroundColor: '#3b82f6',
        borderRadius: 6,
        barPercentage: 0.6,
      },
      {
        label: 'Ventas (miles ₲)',
        data: ventasData,
        backgroundColor: '#10b981',
        borderRadius: 6,
        barPercentage: 0.6,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: false 
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 13 },
        bodyFont: { size: 12 },
        callbacks: {
          label: (context: any) => {
            if (context.dataset.label === 'Costo por Unidad') {
              return '₲ ' + formatMoney(context.raw);
            }
            return context.formattedValue;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { 
          color: '#6b7280',
          font: { size: 11 }
        }
      },
      y: {
        beginAtZero: true,
        grid: { 
          color: 'rgba(0,0,0,0.05)',
          drawBorder: false 
        },
        ticks: {
          color: '#6b7280',
          font: { size: 10 },
          callback: (value: any) => {
            if (value >= 1000) return '₲' + (value/1000).toFixed(0) + 'k';
            return value;
          }
        }
      }
    }
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom' as const,
        labels: { 
          boxWidth: 12,
          padding: 15,
          font: { size: 11 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { 
          color: '#6b7280',
          font: { size: 11 }
        }
      },
      y: {
        beginAtZero: true,
        grid: { 
          color: 'rgba(0,0,0,0.05)',
          drawBorder: false 
        },
        ticks: {
          color: '#6b7280',
          font: { size: 10 }
        }
      }
    }
  };

  const productosStockBajo = productos.filter(p => p.stock < 5);

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-emerald-500 to-emerald-400" />
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Efectivo en Caja</span>
            </div>
            <p className={`text-lg font-bold ${efectivoTotal >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              ₲ {formatMoney(efectivoTotal)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-400" />
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Ventas</span>
            </div>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
              ₲ {formatMoney(ventasMes)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-red-500 to-red-400" />
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <Factory className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">G. Fábrica</span>
            </div>
            <p className="text-lg font-bold text-red-600 dark:text-red-400">
              ₲ {formatMoney(datosMes.gastosFab)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-purple-500 to-purple-400" />
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">G. Personal</span>
            </div>
            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
              ₲ {formatMoney(gastosPersMes)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Production Summary */}
      <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg">
        <CardContent className="p-4">
          <h3 className="font-bold text-gray-800 dark:text-white mb-4">Resumen de Producción</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-center">
              <Package className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">{datosMes.unidades}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Unidades</p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl text-center">
              <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
              <p className="text-xl font-bold text-orange-800 dark:text-orange-300">₲ {formatMoney(datosMes.costoUnitario)}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Costo/Unidad</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg">
        <CardContent className="p-4">
          <h3 className="font-bold text-gray-800 dark:text-white mb-4">Costo por Unidad (Histórico)</h3>
          <div className="h-48">
            <Line data={costoChartData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg">
        <CardContent className="p-4">
          <h3 className="font-bold text-gray-800 dark:text-white mb-4">Producción vs Ventas</h3>
          <div className="h-48">
            <Bar data={prodVentasChartData} options={barChartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Stock Alerts */}
      <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg">
        <CardContent className="p-4">
          <h3 className="font-bold text-gray-800 dark:text-white mb-4">Alertas de Stock</h3>
          {productosStockBajo.length === 0 ? (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium">Todo el stock está bien</span>
            </div>
          ) : (
            <div className="space-y-2">
              {productosStockBajo.map(p => (
                <div 
                  key={p.id} 
                  className="flex items-center justify-between bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-3 rounded-xl"
                >
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" />
                    <span className="text-sm font-medium">{p.nombre}</span>
                  </div>
                  <span className="text-sm font-bold">{p.stock} unid.</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
