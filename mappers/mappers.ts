import { ActiveTable } from "@/types/tableTypes";
import { Order } from "@/types/types";

export const mapOrdersToTables = (orders: Order[]): ActiveTable[] => {
    return orders.map((order) => ({
      identificador: order.numeroOrden,
      numeroMesa: Number(order.numeroMesa),
      zona: order.ubicacion,
      nombreCliente: order.nombreCompletoCliente,
      identificadorCliente: order.idCliente ?? 0,
      totalConDescuento: order.totalConDescuento,
    }));
  };