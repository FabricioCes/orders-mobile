import { useState, useEffect } from 'react'
import { Subscription } from 'rxjs'
import { Order, OrderDetail } from '@/types/types'
import { orderService } from '@/services/order.service'
import { ActiveTable } from '@/types/tableTypes'

export const useOrderState = (
  orderId: number,
  userName: string,
  token: string,
  place: string
) => {
  const [state, setState] = useState<{
    order: Order | null
    activeTables: ActiveTable[] | null
    details: OrderDetail[]
    loading: boolean
    error: string | null
  }>({
    order: null,
    activeTables: null,
    details: [],
    loading: true,
    error: null
  })
  useEffect(() => {
    const subscriptions: Subscription[] = []

    if (orderId) {
      subscriptions.push(
        orderService.order$.subscribe(order => {
          setState(prev => ({
            ...prev,
            order: order,
            loading: false
          }))
        })
      )

      subscriptions.push(
        orderService.orderDetails$.subscribe(details => {
          setState(prev => ({
            ...prev,
            details,
            loading: false
          }))
        })
      )

      orderService.getOrder$(orderId).subscribe()
      orderService.getOrderDetails$(orderId).subscribe()
    }

    return () => subscriptions.forEach(sub => sub.unsubscribe())
  }, [orderId])

  useEffect(() => {
    const subscriptions: Subscription[] = []
    console.log('Actualizando mesas')
    if (userName || token || place) {
      const subscriptions: Subscription[] = []
      subscriptions.push(
        orderService.activeTables$.subscribe(activeTables => {
          setState(prev => ({
            ...prev,
            activeTables
          }))
        })
      )

    orderService.loadActiveOrders$().subscribe()
    }
    return () => subscriptions.forEach(sub => sub.unsubscribe())
  }, [userName, token, place])

  return state
}
