export type Table = {
  qty: number
  place: string
}

export type OrderTable = {
  tableId: number
  place: string
}

export type Order = {
  numeroOrden?: number
  numeroLugar?: string
  ubicacion: string
  observaciones?: string
  nombreCliente?: string
  idCliente?: number
  idUsuario: string
  autorizado: boolean
  totalSinDescuento?: number
  detalles: OrderDetail[]
  imprimir: boolean
  estado?: 'Pendiente' | 'Anulada' | 'Finalizada'
}

export type OrderDetail = {
  identificadorOrdenDetalle: number
  idProducto: number
  nombreProducto: string
  cantidad: number
  precio: number
  porcentajeDescProducto: number
  ingrediente: boolean
  quitarIngrediente: boolean
}

export interface GuardarOrdenRequest {
  idUsuario: string
  zona: string
  mesa: string
  detalles: OrderDetail[]
  numeroOrden?: number
}

export interface MesasOcupadasDTO {
  zona: string
  mesa: string
  numeroOrden: number
}


export interface Paginacion {
  PaginaActual: number;
  TotalPaginas: number;
  TotalRegistros: number;
  RegistrosPorPagina: number;
}


export interface ApiResponse<T> {
   CodigoRespuesta: number;
  Resultado: T;
  Mensaje?: string;
  Error?: boolean;
  Paginacion?: Paginacion;
}