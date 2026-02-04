import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export function useDate() {
  const getMesActual = (): string => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const getNombreMes = (mesStr: string): string => {
    const [year, month] = mesStr.split('-');
    const fecha = new Date(parseInt(year), parseInt(month) - 1);
    return format(fecha, 'MMMM yyyy', { locale: es });
  };

  const formatFecha = (fecha: string | Date): string => {
    const date = typeof fecha === 'string' ? parseISO(fecha) : fecha;
    return format(date, 'dd/MM/yyyy', { locale: es });
  };

  const formatFechaInput = (fecha: Date): string => {
    return format(fecha, 'yyyy-MM-dd');
  };

  const getMesFromFecha = (fecha: string): string => {
    const date = parseISO(fecha);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const getUltimosMeses = (cantidad: number): string[] => {
    const meses: string[] = [];
    for (let i = cantidad - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mesKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      meses.push(mesKey);
    }
    return meses;
  };

  const getNombreMesCorto = (mesStr: string): string => {
    const [year, month] = mesStr.split('-');
    const fecha = new Date(parseInt(year), parseInt(month) - 1);
    return format(fecha, 'MMM', { locale: es });
  };

  return {
    getMesActual,
    getNombreMes,
    formatFecha,
    formatFechaInput,
    getMesFromFecha,
    getUltimosMeses,
    getNombreMesCorto,
  };
}
