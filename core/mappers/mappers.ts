import { Product } from "@/types/productTypes";
import { AdicionalType, GuardarOrdenRequest, Order, OrderDetail, SaveOptions } from "@/types/types";

export const mapToGuardarOrdenRequest = (order: Order, otrosValores: SaveOptions): GuardarOrdenRequest => {
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



export const mapProductToOrderDetail = (
  product: Product,
  options?: {
    quantity?: number;
    discounts?: number;
    modifiers?: AdicionalType[];
  }
): OrderDetail => {
  return {
    cantidad: options?.quantity || 1,
    idProducto: product.identificador,
    nombreProducto: product.nombre,
    precioVenta: product.precio,
    precioCompra: product.costo,
    impuestoProducto: product.impuesto || 0,
    porcentajeDescuento: options?.discounts || 0,
    unidad: product.unidad || 1,
    totalCostoUnitario: (options?.quantity || 1) * product.precio,
    totalDescProducto: ((options?.quantity || 1) * product.precio) * (options?.discounts || 0),
    adicionales: options?.modifiers || [],
    // Campos con valores por defecto
    productoMitad: false,
    ingrediente: false,
    productoImpreso: true,
    idOrden: 0, // Se actualizará al guardar
    idOrdenDetalle: 0 // Generado por el backend
  };
};