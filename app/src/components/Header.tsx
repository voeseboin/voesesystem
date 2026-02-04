import { Moon, Sun, FileText, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useDate } from '@/hooks/useDate';

interface HeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
  mesActual: string;
  mesesDisponibles: string[];
  onCambiarMes: (mes: string) => void;
  onGenerarPDF: (tipo: 'mes' | 'anio') => void;
}

export function Header({ 
  isDark, 
  toggleTheme, 
  mesActual, 
  mesesDisponibles, 
  onCambiarMes,
  onGenerarPDF 
}: HeaderProps) {
  const { getNombreMes } = useDate();

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-700 to-blue-600 dark:from-slate-900 dark:to-slate-800 text-white shadow-lg">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-xl font-bold">V</span>
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">VoeseSystem</h1>
            <p className="text-xs text-blue-200 dark:text-slate-400">Gestión de Negocio</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* PDF Generator */}
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="text-white hover:bg-white/20"
              >
                <FileText className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-slate-900 border-0">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-white">Generar PDF</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 mt-4">
                <button
                  onClick={() => onGenerarPDF('mes')}
                  className="w-full p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center gap-3 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 dark:text-white">Reporte del Mes</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{getNombreMes(mesActual)}</p>
                  </div>
                </button>
                <button
                  onClick={() => onGenerarPDF('anio')}
                  className="w-full p-4 bg-green-50 dark:bg-green-900/30 rounded-xl flex items-center gap-3 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                >
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 dark:text-white">Resumen Anual</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{mesActual.split('-')[0]}</p>
                  </div>
                </button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Theme Toggle */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleTheme}
            className="text-white hover:bg-white/20"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Month Selector */}
      <div className="px-4 pb-3">
        <Select value={mesActual} onValueChange={onCambiarMes}>
          <SelectTrigger className="w-full bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Seleccionar mes" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
            {mesesDisponibles.map((mes) => (
              <SelectItem 
                key={mes} 
                value={mes}
                className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                {getNombreMes(mes)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </header>
  );
}
