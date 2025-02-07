// import { CustomerApiRepository } from '@/repositories/customer.repository'
// import { Client } from '@/types/clientTypes'
// import { BehaviorSubject, Observable, from } from 'rxjs'
// import { tap } from 'rxjs/operators'

// class CustomerService {
//   private clientSubject = new BehaviorSubject<Client|null>(null)
//    getCustomer$ (customerId: number): Observable<Client | null> {
//       return from(CustomerApiRepository.getCustomers(customerId))
//     }
// }

// export const customerService = new CustomerService;