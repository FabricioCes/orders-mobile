export type Client = {
  identificacion: number
  nombre: string
  cedula: string
  tipoPrecio: number
  telefono?: string
  telefono2?: string
  correo?: string
  correo2?: string
  direccion?: string
}

export type ClientsContextType = {
  clients: Client[]
  addClient: (client: Client) => void
  selectedClient?: Client
  clearClient: () => void
  status: 'loading' | 'error' | 'success'
}
