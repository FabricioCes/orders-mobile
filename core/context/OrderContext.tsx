// OrderContext.tsx
import React, { createContext, useReducer, ReactNode, useContext } from "react";
import { Order, OrderDetail } from "@/types/types";
import { uuidEntero } from '@/utils/uuidUtils';

interface OrderState {
  order: Order | null;           // Orden actual (temporal o permanente)
  orderDetails: OrderDetail[];   // Detalles de la orden
  loading: boolean;              // Estado de carga
  error: string | null;          // Errores
  hasUnsavedChanges: boolean;    // Indicador de cambios no guardados
}

type OrderAction =
  | { type: "SET_ORDER"; payload: Order }
  | { type: "SET_ORDER_DETAILS"; payload: OrderDetail[] }
  | { type: "RESET_ORDER" }
  | { type: "CREATE_TEMPORARY_ORDER"; payload: { numeroMesa: string; zona: string } }
  | { type: "ADD_ORDER_DETAIL"; payload: Omit<OrderDetail, 'idOrden' | 'idOrdenDetalle'> }
  | { type: "UPDATE_ORDER_DETAIL"; payload: { detailId: number; updatedDetail: Partial<OrderDetail> } }
  | { type: "REMOVE_ORDER_DETAIL"; payload: number }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_UNSAVED_CHANGES"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

const initialState: OrderState = {
  order: null,
  orderDetails: [],
  loading: false,
  error: null,
  hasUnsavedChanges: false,
};

const OrderContext = createContext<{
  state: OrderState;
  dispatch: React.Dispatch<OrderAction>;
}>({
  state: initialState,
  dispatch: () => undefined,
});

// Función para calcular el total de la orden
const calculateTotal = (details: OrderDetail[]): number => {
  return details.reduce((total, detail) => total + detail.costoUnitario * detail.cantidad, 0);
};

const orderReducer = (state: OrderState, action: OrderAction): OrderState => {
  switch (action.type) {
    case "SET_ORDER":
      return { ...state, order: action.payload, loading: false };
    case "SET_ORDER_DETAILS":
      return { ...state, orderDetails: action.payload, loading: false };
    case "RESET_ORDER":
      return initialState;
    case "CREATE_TEMPORARY_ORDER": {
      const { numeroMesa, zona } = action.payload;
      const temporaryOrderId = uuidEntero();
      const newOrder: Order = {
        numeroOrden: temporaryOrderId,
        idCliente: 0,
        totalSinDescuento: 0,
        numeroMesa,
        ubicacion: zona,
        esTemporal: true,
        detalles: [],
      };
      return { ...state, order: newOrder, orderDetails: [], hasUnsavedChanges: true };
    }
    case "ADD_ORDER_DETAIL": {
      if (!state.order || !state.order.esTemporal) return state;
      const newDetail: OrderDetail = {
        ...action.payload,
        idOrden: state.order?.numeroOrden ?? 0,
        idOrdenDetalle: uuidEntero(),
      };
      const currentDetails = state.orderDetails || [];
      const existingIndex = currentDetails.findIndex(d => d.idProducto === newDetail.idProducto);
      let updatedDetails: OrderDetail[];
      if (existingIndex !== -1) {
        updatedDetails = [...currentDetails];
        updatedDetails[existingIndex] = {
          ...updatedDetails[existingIndex],
          cantidad: updatedDetails[existingIndex].cantidad + newDetail.cantidad,
        };
      } else {
        updatedDetails = [...currentDetails, newDetail];
      }
      const updatedOrder = {
        ...state.order,
        detalles: updatedDetails,
        totalSinDescuento: calculateTotal(updatedDetails),
      };
      return {
        ...state,
        order: updatedOrder,
        orderDetails: updatedDetails,
        hasUnsavedChanges: true,
      };
    }
    case "UPDATE_ORDER_DETAIL": {
      if (!state.order || !state.order.esTemporal) return state;
      const { detailId, updatedDetail } = action.payload;
      const updatedDetails = state.orderDetails.map((detail) =>
        detail.idOrdenDetalle === detailId ? { ...detail, ...updatedDetail } : detail
      );
      const updatedOrder = {
        ...state.order,
        detalles: updatedDetails,
        totalSinDescuento: calculateTotal(updatedDetails),
      };
      return {
        ...state,
        order: updatedOrder,
        orderDetails: updatedDetails,
        hasUnsavedChanges: true,
      };
    }
    case "REMOVE_ORDER_DETAIL": {
      console.log("remove")
      if (!state.order || !state.order.esTemporal) return state;
      const updatedDetails = state.orderDetails.filter((detail) => detail.idOrdenDetalle !== action.payload);
      const updatedOrder = {
        ...state.order,
        detalles: updatedDetails,
        totalSinDescuento: calculateTotal(updatedDetails),
      };
      console.log(updatedOrder)
      return {
        ...state,
        order: updatedOrder,
        orderDetails: updatedDetails,
        hasUnsavedChanges: true,
      };
    }
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_UNSAVED_CHANGES":
      return { ...state, hasUnsavedChanges: action.payload };
    default:
      return state;
  }
};

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(orderReducer, initialState);
  return (
    <OrderContext.Provider value={{ state, dispatch }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrder debe usarse dentro de un OrderProvider");
  }
  return context;
};