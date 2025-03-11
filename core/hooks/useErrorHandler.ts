import { useOrder } from "../context/OrderContext"

const useErrorHandler = () => {
  const { dispatch } = useOrder()

  return (error: unknown, context: string) => {
    const message =
      error instanceof Error
        ? `${context}: ${error.message}`
        : `${context}: Error desconocido`

    dispatch({ type: 'SET_ERROR', payload: message })
    console.error(message, error)
  }
}

export default useErrorHandler
