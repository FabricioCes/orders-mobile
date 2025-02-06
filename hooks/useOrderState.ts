import { useState, useEffect } from 'react'
import { Subscription } from 'rxjs'
import { Order, OrderDetail } from '@/types/types'
import { orderService } from '@/services/order.service'

export const useOrderState = (orderId: number) => {
  const [state, setState] = useState<{
    order: Order | null
    details: OrderDetail[]
    loading: boolean
    error: string | null
  }>({
    order: null,
    details: [],
    loading: true,
    error: null
  })

  useEffect(() => {
    const subscriptions: Subscription[] = []

    if (orderId) {
      // Cargar datos iniciales
      subscriptions.push(
        orderService.getOrder$(orderId).subscribe({
          next: order => setState(prev => ({ ...prev, order })),
          error: error => setState(prev => ({ ...prev, error: error.message }))
        })
      )

      // Suscripción a los detalles en tiempo real
      subscriptions.push(
        orderService.orderDetails$.subscribe(details => {
          setState(prev => ({
            ...prev,
            details,
            loading: false
          }))
        })
      )

      // Cargar detalles iniciales
      orderService.getOrderDetails$(orderId).subscribe()
    }

    return () => subscriptions.forEach(sub => sub.unsubscribe())
  }, [orderId])

  return state
}
