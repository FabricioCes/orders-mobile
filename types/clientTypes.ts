export type Client = {
    id: number;
    name: string;
    ced: string;
    priceType: number;
    tel?: string;
    tel2?: string;
    email?: string;
    email2?: string;
    address?: string;
  };
  
  export type ClientsContextType = {
    clients: Client[];
    addClient: (client: Client) => void;
    selectedClient?: Client;
    clearClient: () => void;
    status: 'loading' | 'error' | 'success';
  };