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


export type Client = {
    id: number;
    name: string;
    ced: string;
    priceType: string;
    tel: string;
    tel2: string;
    email: string;
    email2: string;
    address: string;
}