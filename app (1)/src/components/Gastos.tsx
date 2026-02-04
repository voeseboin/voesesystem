import { useState } from 'react';
import { DollarSign, Factory, User, Trash2, Calendar, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatMoney } from '@/lib/utils';
import { showSuccess } from '@/lib/notifications';
import { useDate } from '@/hooks/useDate';
import type { Gasto } from '@/types';

interface GastosProps {
  mesActual: string;
  gastos: Gasto[];
  onGuardarGasto: (gasto: Omit<Gasto, 'id' | 'mes'>) => void;
  onEliminarGasto: (id: number) => void;
}

export function Gastos({ mesActual, gastos, onGuardarGasto, onEliminarGasto }: GastosProps) {
  const { formatFecha, formatFechaInput } = useDate();
  const [tipo, setTipo] = useState<'fabricacion' | 'personal'>('fabricacion');
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState(formatFechaInput(new Date()));
  const [gastoAEliminar, setGastoAEliminar] = useState<Gasto | null>(null);

  const gastosMes = gastos.filter(g => g.mes === mesActual).sort((a, b) => b.id - a.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onGuardarGasto({
      tipo,
      descripcion: descripcion.trim(),
      monto: parseFloat(monto) || 0,
      fecha: new Date(fecha).toISOString(),
    });

    const msg = tipo === 'fabricacion' 
      ? `Gasto de fabricación registrado para ${formatFecha(fecha)}`
      : 'Gasto personal registrado';
    showSuccess(msg);

    setDescripcion('');
    setMonto('');
    setFecha(formatFechaInput(new Date()));
  };

  const confirmarEliminar = () => {
    if (gastoAEliminar) {
      onEliminarGasto(gastoAEliminar.id);
      showSuccess('Gasto eliminado correctamente');
      setGastoAEliminar(null);
    }
  };

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Form */}
      <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Registrar Gasto</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tipo de Gasto */}
            <div>
              <Label className="text-gray-700 dark:text-gray-300 mb-2 block">Tipo de Gasto</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTipo('fabricacion')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    tipo === 'fabricacion'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700'
                  }`}
                >
                  <Factory className={`w-6 h-6 mx-auto mb-2 ${
                    tipo === 'fabricacion' ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                  <p className={`text-sm font-bold ${
                    tipo === 'fabricacion' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                  }`}>Fabricación</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Afecta costos</p>
                </button>

                <button
                  type="button"
                  onClick={() => setTipo('personal')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    tipo === 'personal'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                      : 'border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700'
                  }`}
                >
                  <User className={`w-6 h-6 mx-auto mb-2 ${
                    tipo === 'personal' ? 'text-purple-500' : 'text-gray-400'
                  }`} />
                  <p className={`text-sm font-bold ${
                    tipo === 'personal' ? 'text-purple-700 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'
                  }`}>Personal</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">No afecta costos</p>
                </button>
              </div>
            </div>

            {/* Fecha */}
            <div>
              <Label className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Fecha
              </Label>
              <Input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="mt-1 bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600"
              />
            </div>

            {/* Descripción */}
            <div>
              <Label className="text-gray-700 dark:text-gray-300">Descripción</Label>
              <Input
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Ej: Materia prima, Luz, etc."
                className="mt-1 bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600"
              />
            </div>

            {/* Monto */}
            <div>
              <Label className="text-gray-700 dark:text-gray-300">Monto (₲)</Label>
              <Input
                type="number"
                min="0"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="0"
                className="mt-1 bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-lg"
              />
            </div>

            {/* Info */}
            {tipo === 'fabricacion' && (
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  <strong>💡 Info:</strong> Este gasto se sumará al total del mes y se distribuirá entre todas las unidades producidas para calcular el costo unitario.
                </p>
              </div>
            )}

            <Button 
              type="submit" 
              className={`w-full py-6 font-bold rounded-xl shadow-lg active:scale-95 transition-transform ${
                tipo === 'fabricacion'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600'
                  : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600'
              } text-white`}
            >
              <TrendingDown className="w-5 h-5 mr-2" />
              Guardar Gasto
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg">
        <CardContent className="p-4">
          <h3 className="font-bold text-gray-800 dark:text-white mb-4">Gastos del Mes</h3>
          {gastosMes.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Sin gastos este mes</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {gastosMes.map(gasto => (
                <div 
                  key={gasto.id} 
                  className={`p-4 rounded-xl flex justify-between items-start border-l-4 ${
                    gasto.tipo === 'fabricacion'
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                      : 'bg-purple-50 dark:bg-purple-900/20 border-purple-500'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {gasto.tipo === 'fabricacion' ? (
                        <Factory className="w-4 h-4 text-blue-500" />
                      ) : (
                        <User className="w-4 h-4 text-purple-500" />
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        gasto.tipo === 'fabricacion'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                          : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                      }`}>
                        {gasto.tipo === 'fabricacion' ? 'Fábrica' : 'Personal'}
                      </span>
                    </div>
                    <p className="font-bold text-gray-800 dark:text-white mt-1">{gasto.descripcion}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatFecha(gasto.fecha)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800 dark:text-white">₲ {formatMoney(gasto.monto)}</p>
                    <button
                      onClick={() => setGastoAEliminar(gasto)}
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

      {/* Delete Confirmation */}
      <Dialog open={!!gastoAEliminar} onOpenChange={() => setGastoAEliminar(null)}>
        <DialogContent className="bg-white dark:bg-slate-900 border-0">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">¿Eliminar gasto?</DialogTitle>
          </DialogHeader>
          {gastoAEliminar && (
            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl my-4">
              <div className="flex items-center gap-2 mb-2">
                {gastoAEliminar.tipo === 'fabricacion' ? (
                  <Factory className="w-4 h-4 text-blue-500" />
                ) : (
                  <User className="w-4 h-4 text-purple-500" />
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  gastoAEliminar.tipo === 'fabricacion'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                }`}>
                  {gastoAEliminar.tipo === 'fabricacion' ? 'Fábrica' : 'Personal'}
                </span>
              </div>
              <p className="font-medium text-gray-800 dark:text-white">{gastoAEliminar.descripcion}</p>
              <p className="text-lg font-bold text-gray-800 dark:text-white mt-2">
                ₲ {formatMoney(gastoAEliminar.monto)}
              </p>
            </div>
          )}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setGastoAEliminar(null)} className="flex-1">
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
