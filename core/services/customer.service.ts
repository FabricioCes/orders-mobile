// src/core/services/CustomerService.ts
import { Customer } from '@/types/customerTypes'
import { CustomerApiRepository } from '../repositories/customer.repository'


const createClientFromApi = (apiClient: any): Customer => ({
  identificacion: apiClient.identificador,
  nombre: apiClient.nombre,
  cedula: apiClient.cedula || '',
  tipoPrecio: apiClient.tipoPrecio,
  telefono: apiClient.telefono || undefined,
  telefono2: apiClient.telefono2 || undefined,
  correo: apiClient.correo || undefined,
  correo2: apiClient.correo2 || undefined,
  direccion: apiClient.direccion?.trim() || undefined
})

export class CustomerService {
  static async fetchCustomers (signal?: AbortSignal): Promise<Customer[]> {
    const rawCustomers = await CustomerApiRepository.getCustomers(
      1,
      100,
      signal
    )
    const customers = rawCustomers.map(createClientFromApi)
    return customers
  }

  static async fetchCustomer (customerId: number): Promise<Customer> {
    const rawCustomer = await CustomerApiRepository.getCustomer(customerId)
    return createClientFromApi(rawCustomer)
  }
}
