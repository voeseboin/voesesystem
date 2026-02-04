export interface Producto {
  id: number;
  nombre: string;
  stock: number;
  unidadesProducidasTotal: number;
  precioMayorista: number;
  precioMinorista: number;
  fechaCreacion: string;
}

export interface Produccion {
  id: number;
  productoId: number;
  productoNombre: string;
  cantidad: number;
  costoMateriales: number;
  fecha: string;
  mes: string;
}

export interface Venta {
  id: number;
  productoId: number;
  productoNombre: string;
  tipo: 'mayorista' | 'minorista';
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  total: number;
  fecha: string;
  mes: string;
}

export interface Gasto {
  id: number;
  tipo: 'fabricacion' | 'personal';
  descripcion: string;
  monto: number;
  fecha: string;
  mes: string;
}

export interface DatosMes {
  unidades: number;
  materiales: number;
  gastosFab: number;
  costoUnitario: number;
}

export type TipoVenta = 'mayorista' | 'minorista';
export type TipoGasto = 'fabricacion' | 'personal';
