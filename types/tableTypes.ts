export type TableRowProps = {
  tables: number[]
  isActive: (tableId: number) => boolean
  onTablePress: (tableId: number) => void
  rowIndex: number
  totalColumns: number
  accessibilityLabel?: string
}

export interface ActiveTable {
  identificador: number;
  numeroMesa: number;
  zona: string;
  nombreCliente: string | null;
  identificadorCliente: number;
  estadoProduccion?: string;
  cronometroOrden?: string;
  ordenImpresa?: boolean;
  tiempoLimiteCronometro?: string;
  totalConDescuento?: number;
  porcDescuento?: number;
  totalExento?: number;
  totalGravado?: number;
  totalIVA?: number;
  totalPrecioCompra?: number;
  totalServicio?: number;
  totalSinDescuento?: number;
}
