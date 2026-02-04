import { useState } from 'react';
import { Package, Plus, Trash2, Factory, TrendingUp, Box } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatMoney } from '@/lib/utils';
import { showSuccess, showError } from '@/lib/notifications';
import { useDate } from '@/hooks/useDate';
import type { Producto, Produccion } from '@/types';

interface ProductosProps {
  mesActual: string;
  productos: Producto[];
  producciones: Produccion[];
  onGuardarProducto: (producto: Omit<Producto, 'id' | 'stock' | 'unidadesProducidasTotal' | 'fechaCreacion'>) => void;
  onGuardarProduccion: (produccion: Omit<Produccion, 'id' | 'fecha' | 'mes' | 'productoNombre'>) => void;
  onEliminarProducto: (id: number) => void;
}

export function Productos({ 
  mesActual, 
  productos, 
  producciones, 
  onGuardarProducto, 
  onGuardarProduccion,
  onEliminarProducto 
}: ProductosProps) {
  const { formatFecha } = useDate();
  const [modalProducto, setModalProducto] = useState(false);
  const [modalProduccion, setModalProduccion] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState<Producto | null>(null);
  
  // Form states
  const [nombre, setNombre] = useState('');
  const [precioMay, setPrecioMay] = useState('');
  const [precioMin, setPrecioMin] = useState('');
  const [prodProductoId, setProdProductoId] = useState('');
  const [prodCantidad, setProdCantidad] = useState('');
  const [prodCostoMateriales, setProdCostoMateriales] = useState('');

  const handleGuardarProducto = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nombre.trim()) {
      showError('Ingresa el nombre del producto');
      return;
    }

    onGuardarProducto({
      nombre: nombre.trim(),
      precioMayorista: parseFloat(precioMay) || 0,
      precioMinorista: parseFloat(precioMin) || 0,
    });

    showSuccess('Producto creado correctamente');
    setNombre('');
    setPrecioMay('');
    setPrecioMin('');
    setModalProducto(false);
  };

  const handleGuardarProduccion = (e: React.FormEvent) => {
    e.preventDefault();
    
    const producto = productos.find(p => p.id.toString() === prodProductoId);
    if (!producto) {
      showError('Selecciona un producto');
      return;
    }

    onGuardarProduccion({
      productoId: producto.id,
      cantidad: parseInt(prodCantidad) || 0,
      costoMateriales: parseFloat(prodCostoMateriales) || 0,
    });

    showSuccess(`Producción registrada: ${prodCantidad} unidades de ${producto.nombre}`);
    setProdProductoId('');
    setProdCantidad('');
    setProdCostoMateriales('');
    setModalProduccion(false);
  };

  const confirmarEliminar = () => {
    if (productoAEliminar) {
      onEliminarProducto(productoAEliminar.id);
      showSuccess('Producto y su historial eliminados');
      setProductoAEliminar(null);
    }
  };

  const produccionesMes = producciones.filter(p => p.mes === mesActual).sort((a, b) => b.id - a.id);

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button 
          onClick={() => setModalProducto(true)}
          className="py-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold rounded-xl shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Producto
        </Button>
        <Button 
          onClick={() => setModalProduccion(true)}
          className="py-6 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold rounded-xl shadow-lg"
        >
          <Factory className="w-5 h-5 mr-2" />
          Producción
        </Button>
      </div>

      {/* Products List */}
      <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg">
        <CardContent className="p-4">
          <h3 className="font-bold text-gray-800 dark:text-white mb-4">Productos</h3>
          {productos.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No hay productos</p>
              <p className="text-sm">Crea uno primero</p>
            </div>
          ) : (
            <div className="space-y-3">
              {productos.map(producto => {
                const prodMes = producciones.filter(p => p.productoId === producto.id && p.mes === mesActual);
                const unidadesMes = prodMes.reduce((sum, p) => sum + p.cantidad, 0);
                
                return (
                  <div 
                    key={producto.id} 
                    className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 dark:text-white">{producto.nombre}</h4>
                        <div className="flex gap-2 mt-2">
                          <span className="text-xs px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full">
                            Stock: {producto.stock}
                          </span>
                          {unidadesMes > 0 && (
                            <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                              +{unidadesMes} este mes
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setProductoAEliminar(producto)}
                        className="text-red-500 hover:text-red-600 p-2"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-200 dark:border-slate-600">
                      <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Mayorista:</span>
                        <p className="font-bold text-gray-800 dark:text-white">₲ {formatMoney(producto.precioMayorista)}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Minorista:</span>
                        <p className="font-bold text-gray-800 dark:text-white">₲ {formatMoney(producto.precioMinorista)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Production History */}
      <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg">
        <CardContent className="p-4">
          <h3 className="font-bold text-gray-800 dark:text-white mb-4">Historial de Producción</h3>
          {produccionesMes.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Factory className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Sin producción este mes</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {produccionesMes.map(p => (
                <div 
                  key={p.id} 
                  className="flex justify-between items-center bg-gray-50 dark:bg-slate-700/50 p-3 rounded-xl border-l-4 border-emerald-500"
                >
                  <div>
                    <p className="font-bold text-gray-800 dark:text-white">{p.productoNombre}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatFecha(p.fecha)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800 dark:text-white">{p.cantidad} unid.</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Mat: ₲ {formatMoney(p.costoMateriales)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Product Modal */}
      <Dialog open={modalProducto} onOpenChange={setModalProducto}>
        <DialogContent className="bg-white dark:bg-slate-900 border-0 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <Box className="w-5 h-5 text-blue-500" />
              Nuevo Producto
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleGuardarProducto} className="space-y-4 mt-4">
            <div>
              <Label className="text-gray-700 dark:text-gray-300">Nombre</Label>
              <Input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Matero de Algarrobo"
                className="mt-1 bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-gray-700 dark:text-gray-300">Precio Mayorista</Label>
                <Input
                  type="number"
                  min="0"
                  value={precioMay}
                  onChange={(e) => setPrecioMay(e.target.value)}
                  placeholder="0"
                  className="mt-1 bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600"
                />
              </div>
              <div>
                <Label className="text-gray-700 dark:text-gray-300">Precio Minorista</Label>
                <Input
                  type="number"
                  min="0"
                  value={precioMin}
                  onChange={(e) => setPrecioMin(e.target.value)}
                  placeholder="0"
                  className="mt-1 bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600"
                />
              </div>
            </div>
            <Button type="submit" className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl">
              Crear Producto
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Production Modal */}
      <Dialog open={modalProduccion} onOpenChange={setModalProduccion}>
        <DialogContent className="bg-white dark:bg-slate-900 border-0 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <Factory className="w-5 h-5 text-emerald-500" />
              Nueva Producción
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleGuardarProduccion} className="space-y-4 mt-4">
            <div>
              <Label className="text-gray-700 dark:text-gray-300">Producto</Label>
              <select
                value={prodProductoId}
                onChange={(e) => setProdProductoId(e.target.value)}
                className="w-full mt-1 p-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-800 dark:text-white"
              >
                <option value="">Seleccionar...</option>
                {productos.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-gray-700 dark:text-gray-300">Cantidad Producida</Label>
              <Input
                type="number"
                min="1"
                value={prodCantidad}
                onChange={(e) => setProdCantidad(e.target.value)}
                placeholder="0"
                className="mt-1 bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600"
              />
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl">
              <Label className="text-orange-800 dark:text-orange-300">Costo de Materiales (₲)</Label>
              <Input
                type="number"
                min="0"
                value={prodCostoMateriales}
                onChange={(e) => setProdCostoMateriales(e.target.value)}
                placeholder="0"
                className="mt-1 bg-white dark:bg-slate-700 border-orange-200 dark:border-orange-800"
              />
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                Solo materiales utilizados en esta producción
              </p>
            </div>
            <Button type="submit" className="w-full py-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl">
              <TrendingUp className="w-5 h-5 mr-2" />
              Registrar Producción
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!productoAEliminar} onOpenChange={() => setProductoAEliminar(null)}>
        <DialogContent className="bg-white dark:bg-slate-900 border-0">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">¿Eliminar producto?</DialogTitle>
          </DialogHeader>
          <p className="text-gray-500 dark:text-gray-400">
            Se eliminará <strong className="text-gray-800 dark:text-white">{productoAEliminar?.nombre}</strong> y todo su historial.
          </p>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setProductoAEliminar(null)} className="flex-1">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmarEliminar} className="flex-1">
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
