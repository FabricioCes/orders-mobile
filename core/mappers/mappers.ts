import { GuardarOrdenRequest, Order } from "@/types/types";

const mapToGuardarOrdenRequest = (order: Order, otrosValores: {imprimir: boolean, autorizado: boolean, quitarIngrediente: boolean}): GuardarOrdenRequest => {
  return {
    numeroOrden: order.numeroOrden,
    numeroLugar: order.numeroMesa,
    ubicacion: order.ubicacion || '',
    observaciones: order.descripcion || '',
    nombreCliente: order.nombreCliente || '',
    idCliente: order.idCliente || 0,
    idUsuario: order.idUsuario || 'admin',
    autorizado: otrosValores.autorizado,
    totalSinDescuento: order.totalSinDescuento,
    imprimir: otrosValores.imprimir,
    detalles: order.detalles?.map((detalle) => ({
      idProducto: detalle.idProducto,
      nombreProducto: detalle.nombreProducto,
      cantidad: detalle.cantidad,
      precio: detalle.costoUnitario,
      porcentajeDescProducto: detalle.porcentajeDescuento || 0,
      ingrediente: detalle.ingrediente || false,
      quitarIngrediente: otrosValores.quitarIngrediente,
    })),
  };
}

export default mapToGuardarOrdenRequest