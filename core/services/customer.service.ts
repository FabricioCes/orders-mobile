import { Customer } from '@/types/customerTypes';
import { CustomerApiRepository } from '../repositories/customer.repository';
import { Observable } from 'rxjs';

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
});

export class CustomerService {
  static async fetchCustomers(signal?: AbortSignal): Promise<Customer[]> {
    const rawCustomers = await CustomerApiRepository.getCustomers(1, 1000, signal);
    const customers = rawCustomers.map(createClientFromApi);
    return customers;
  }

  static async fetchCustomer(customerId: number): Promise<Customer> {
    const rawCustomer = await CustomerApiRepository.getCustomer(customerId);
    return createClientFromApi(rawCustomer);
  }

  static loadCustomersForLetter(letter: string): Observable<Customer[]> {
    return new Observable<Customer[]>((subscriber) => {
      CustomerApiRepository.getCustomersByLetter(letter)
        .then((rawCustomers) => {
          const customers = rawCustomers.map(createClientFromApi);
          subscriber.next(customers);
          subscriber.complete();
        })
        .catch((error) => {
          subscriber.error(error);
        });
    });
  }
}
