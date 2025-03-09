import { ModoImpresion } from "./enums"

export type Table = {
  qty: number
  place: string
}

export type OrderTable = {
  tableId: number
  place: string
}
export type Order = {
  codigoAleatorio?: string;
  creadoPor?: string;
  descripcion?: string | null;
  detalles?: OrderDetail[] | null;
  direccion?: string | null;
  encargado?: string;
  estado?: 'Pendiente' | 'Anulada' | 'Finalizada';
  fechaCreacion?: string;
  fechaEntrada?: string;
  fechaHoraOrdenProgramada?: string | null;
  fechaModificacion?: string;
  hora?: string;
  idCliente?: number | null;
  idUsuario?: string;
  imprimir?: boolean;
  modificadoPor?: string | null;
  nombreCliente?: string;
  nombreCompletoCliente?: string;
  numeroMesa?: string;
  numeroOrden?: number;
  porcDescuento?: number;
  prioridad?: string;
  prioridadNumerica?: number;
  regimenTributacion?: string | null;
  telefonoCliente1?: string | null;
  telefonoCliente2?: string | null;
  telefonoNotificar?: string | null;
  tipoOrden?: string;
  totalConDescuento?: number;
  totalExento?: number;
  totalGravado?: number;
  totalIVA?: number;
  totalPrecioCompra?: number;
  totalServicio?: number;
  totalSinDescuento?: number;
  ubicacion?: string;
  vendedor?: string;
  versionSistema?: string;
  esTemporal?: boolean;
};

export type OrderDetail = {
  cantidad: number;
  codigoMitad?: number;
  consecutivo?: number;
  costoUnitario: number;
  creadoPor?: string;
  encargadoComisionEspecifico?: string;
  idOrden: number;
  idOrdenDetalle: number;
  idProducto: number;
  idRegistroUnico?: number;
  idUnicoGrupo?: number;
  impuestoProducto: number;
  ingrediente?: boolean;
  mitad?: boolean;
  mitadNumeroPlato?: number;
  modificadoPor?: string;
  nombreProducto: string;
  porcentajeDescuento?: number;
  precioCompra?: number;
  productoImpreso?: boolean;
  productoMitad?: boolean;
  productoPadre?: number;
  tipoIngrediente?: string;
  totalCostoUnitario?: number;
  totalDescProducto?: number;
  unidad?: number,
  adicionales?: AdicionalType[];
};
export type AdicionalType = {
  idAdicional: number;
  nombre: string;
  precio: number;
};
export interface GuardarOrdenRequest {
  numeroOrden?: number;
  numeroLugar?: string;
  ubicacion: string;
  observaciones?: string;
  nombreCliente?: string;
  idCliente?: number;
  idUsuario: string;
  autorizado: boolean;
  totalSinDescuento?: number
  imprimir: boolean;
  modoImpresion?: ModoImpresion;
  detalles?: DetalleRequest[]
}

export interface DetalleRequest {
  idProducto: number;
  nombreProducto?: string;
  cantidad: number;
  precio?: number;
  porcentajeDescProducto?: number;
  ingrediente?: boolean;
  quitarIngrediente?: boolean;
}


export interface MesasOcupadasDTO {
  zona: string
  mesa: string
  numeroOrden: number
}


export interface Paginacion {
  offset: number;
  paginas: number;
  totalRegistros: number;
  primeraPagina: number;
  ultimaPagina: number;
}

export interface ApiResponse<T> {
  codigoRespuesta: number;
  resultado: T;
  mensaje?: string;
  error?: boolean;
  tipoError?: string;
  paginacion?: Paginacion;
}

export interface SaveOptions {
  idUsuario: string
  nombreCliente: string
  idCliente: number
  imprimir: boolean
  modoImpresion?: ModoImpresion
}