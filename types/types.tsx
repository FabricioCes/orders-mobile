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
    quantity: number; // Nueva propiedad para la cantidad
  };