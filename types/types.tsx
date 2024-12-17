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
    idSubCategoria: number;
    subCategoria: string;
    idSubSubCategoria: number;
    subSubCategoria: string;
    quantity: number;
  };