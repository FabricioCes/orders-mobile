import { GuardarOrdenRequest, Order, SaveOptions } from "@/types/types";

const mapToGuardarOrdenRequest = (order: Order, otrosValores: SaveOptions): GuardarOrdenRequest => {
  return {
    numeroOrden: order.numeroOrden,
    numeroLugar: order.numeroMesa,
    ubicacion: order.ubicacion || '',
    observaciones: order.descripcion || '',
    nombreCliente: otrosValores.nombreCliente || '',
    idCliente: otrosValores.idCliente || 0,
    idUsuario: otrosValores.idUsuario || '',
    autorizado: true,
    totalSinDescuento: order.totalSinDescuento,
    imprimir: otrosValores.imprimir,
    modoImpresion: otrosValores.modoImpresion,
    detalles: order.detalles?.map((detalle) => ({
      idProducto: detalle.idProducto,
      nombreProducto: detalle.nombreProducto,
      cantidad: detalle.cantidad,
      precio: detalle.costoUnitario,
      porcentajeDescProducto: detalle.porcentajeDescuento || 0,
      ingrediente: detalle.ingrediente || false,
      quitarIngrediente: false,
    })),
  };
}

export default mapToGuardarOrdenRequest