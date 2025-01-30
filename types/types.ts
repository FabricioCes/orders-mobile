export type Table = {
    qty: number;
    place: string;
};

export type OrderTable = {
    tableId: number;
    place: string;
}

export type Product = {
    id: number;
    name: string;
    price: number;
    idSubCategoria?: number;
    subCategoria?: string;
    idSubSubCategoria?: number;
    subSubCategoria?: string;
    quantity?: number;
  }


export type Order = {
    numeroOrden?: number;
    numeroLugar?: string;
    ubicacion: string;
    observaciones?: string;
    nombreCliente?: string;
    idCliente?: number;
    idUsuario: string;
    autorizado: boolean;
    totalSinDescuento?: number;
    detalles: OrderDetail[];
    imprimir: boolean;
}

export type OrderDetail = {
    identificadorOrdenDetalle: number;
    idProducto: number;
    nombreProducto: string;
    cantidad: number;
    precio: number;
    porcentajeDescProducto: number;
    ingrediente: boolean;
    quitarIngrediente: boolean;
}
