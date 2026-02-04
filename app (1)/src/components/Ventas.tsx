import { useState } from 'react';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { formatMoney } from '@/lib/utils';
import { showSuccess, showError } from '@/lib/notifications';
import { useDate } from '@/hooks/useDate';
import type { Producto, Venta } from '@/types';

interface VentasProps {
  mesActual: string;
  productos: Producto[];
  ventas: Venta[];
  onGuardarVenta: (venta: Omit<Venta, 'id' | 'fecha' | 'mes'>) => void;
  onEliminarVenta: (id: number) => void;
}

export function Ventas({ mesActual, productos, ventas, onGuardarVenta, onEliminarVenta }: VentasProps) {
  const { formatFecha } = useDate();
  const [productoId, setProductoId] = useState('');
  const [tipo, setTipo] = useState<'mayorista' | 'minorista'>('mayorista');
  const [cantidad, setCantidad] = useState('');
  const [descuento, setDescuento] = useState('');
  const [tipoDescuento, setTipoDescuento] = useState<'gs' | 'porc'>('gs');
  const [ventaAEliminar, setVentaAEliminar] = useState<Venta | null>(null);

  const productoSeleccionado = productos.find(p => p.id.toString() === productoId);
  
  const precioUnitario = productoSeleccionado 
    ? (tipo === 'mayorista' ? productoSeleccionado.precioMayorista : productoSeleccionado.precioMinorista)
    : 0;
  
  const subtotal = precioUnitario * (parseInt(cantidad) || 0);
  const descuentoMonto = tipoDescuento === 'porc' 
    ? subtotal * ((parseFloat(descuento) || 0) / 100)
    : (parseFloat(descuento) || 0);
  const total = Math.max(0, subtotal - descuentoMonto);

  const ventasMes = ventas.filter(v => v.mes === mesActual).sort((a, b) => b.id - a.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productoSeleccionado) {
      showError('Selecciona un producto');
      return;
    }

    const cant = parseInt(cantidad);
    if (cant > productoSeleccionado.stock) {
      showError(`Stock insuficiente. Solo hay ${productoSeleccionado.stock} unidades`);
      return;
    }

    onGuardarVenta({
      productoId: productoSeleccionado.id,
      productoNombre: productoSeleccionado.nombre,
      tipo,
      cantidad: cant,
      precioUnitario,
      descuento: descuentoMonto,
      total
    });

    showSuccess(`Venta registrada: ₲ ${formatMoney(total)}`);
    
    // Reset form
    setProductoId('');
    setCantidad('');
    setDescuento('');
    setTipo('mayorista');
  };

  const confirmarEliminar = () => {
    if (ventaAEliminar) {
      onEliminarVenta(ventaAEliminar.id);
      showSuccess('Venta eliminada correctamente');
      setVentaAEliminar(null);
    }
  };

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Form */}
      <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Nueva Venta</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-gray-700 dark:text-gray-300">Producto</Label>
              <Select value={productoId} onValueChange={setProductoId}>
                <SelectTrigger className="mt-1 bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600">
                  <SelectValue placeholder="Seleccionar producto..." />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800">
                  {productos.filter(p => p.stock > 0).map(p => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.nombre} (Stock: {p.stock})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-gray-700 dark:text-gray-300">Tipo</Label>
                <Select value={tipo} onValueChange={(v) => setTipo(v as 'mayorista' | 'minorista')}>
                  <SelectTrigger className="mt-1 bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800">
                    <SelectItem value="mayorista">Mayorista</SelectItem>
                    <SelectItem value="minorista">Minorista</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-700 dark:text-gray-300">Cantidad</Label>
                <Input
                  type="number"
                  min="1"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  className="mt-1 bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600"
                  placeholder="0"
                />
              </div>
            </div>

            {productoSeleccionado && (
              <div className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded-xl">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Precio unitario:</span>
                  <span className="font-bold text-gray-800 dark:text-white">₲ {formatMoney(precioUnitario)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600 dark:text-gray-400">Stock:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{productoSeleccionado.stock} unid.</span>
                </div>
              </div>
            )}

            <div>
              <Label className="text-gray-700 dark:text-gray-300">Descuento (opcional)</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="number"
                  min="0"
                  value={descuento}
                  onChange={(e) => setDescuento(e.target.value)}
                  className="bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600"
                  placeholder="0"
                />
                <Select value={tipoDescuento} onValueChange={(v) => setTipoDescuento(v as 'gs' | 'porc')}>
                  <SelectTrigger className="w-24 bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800">
                    <SelectItem value="gs">₲</SelectItem>
                    <SelectItem value="porc">%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-white/80 font-medium">TOTAL:</span>
                <span className="text-2xl font-bold text-white">₲ {formatMoney(total)}</span>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full py-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Confirmar Venta
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Sales List */}
      <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg">
        <CardContent className="p-4">
          <h3 className="font-bold text-gray-800 dark:text-white mb-4">Ventas del Mes</h3>
          {ventasMes.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Sin ventas este mes</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {ventasMes.map(venta => (
                <div 
                  key={venta.id} 
                  className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl flex justify-between items-start"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800 dark:text-white">{venta.productoNombre}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        venta.tipo === 'mayorista' 
                          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' 
                          : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                      }`}>
                        {venta.tipo === 'mayorista' ? 'May' : 'Min'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatFecha(venta.fecha)} • {venta.cantidad} unid.
                    </p>
                    {venta.descuento > 0 && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                        Desc: -₲ {formatMoney(venta.descuento)}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600 dark:text-blue-400">₲ {formatMoney(venta.total)}</p>
                    <button
                      onClick={() => setVentaAEliminar(venta)}
                      className="text-red-500 hover:text-red-600 p-1 mt-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!ventaAEliminar} onOpenChange={() => setVentaAEliminar(null)}>
        <DialogContent className="bg-white dark:bg-slate-900 border-0">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">¿Eliminar venta?</DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-400">
              Esta acción no se puede deshacer. El stock será restaurado.
            </DialogDescription>
          </DialogHeader>
          {ventaAEliminar && (
            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl my-4">
              <p className="font-medium text-gray-800 dark:text-white">{ventaAEliminar.productoNombre}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {ventaAEliminar.cantidad} unid. × ₲ {formatMoney(ventaAEliminar.precioUnitario)}
              </p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-2">
                Total: ₲ {formatMoney(ventaAEliminar.total)}
              </p>
            </div>
          )}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setVentaAEliminar(null)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmarEliminar}
              className="flex-1"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
