import { useState, useEffect } from 'react'
import { Subscription } from 'rxjs'
import { Order, OrderDetail } from '@/types/types'
import { orderService } from '@/services/order.service'
import { ActiveTable } from '@/types/tableTypes'

export const useOrderState = (
  orderId: number,
  userId: string,
  token: string,
  zona: string
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
        orderService.orders$.subscribe(orders => {
          const currentOrder =
            orders.find(o => o.numeroOrden === orderId) || null
          setState(prev => ({
            ...prev,
            order: currentOrder,
            orders: orders,
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

    subscriptions.push(
      orderService.activeTables$.subscribe(activeTables => {
        console.log('mesas activas en subcriptor', activeTables)
        setState(prev => ({
          ...prev,
          activeTables
        }))
      })
    )
    orderService.loadActiveOrders$().subscribe()
    return () => subscriptions.forEach(sub => sub.unsubscribe())
  }, [orderId, userId, token, zona])

  useEffect(() => {
    const subscriptions: Subscription[] = []
    if (userId || token || zona) {
      const subscriptions: Subscription[] = []
      console.log('urray!!')
      subscriptions.push(
        orderService.activeTables$.subscribe(activeTables => {
          console.log('mesas activas en subcriptor', activeTables)
          setState(prev => ({
            ...prev,
            activeTables
          }))
        })
      )
    }
    return () => subscriptions.forEach(sub => sub.unsubscribe())
  }, [userId, token, zona])

  return state
}
