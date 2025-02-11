export type Customer = {
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

export type CustomerContextType = {
  customers: Customer[]
  addCustomer: (Customer: Customer) => void
  selectedCustomer?: Customer
  clearCustomer: () => void
  status: 'loading' | 'error' | 'success'
}
