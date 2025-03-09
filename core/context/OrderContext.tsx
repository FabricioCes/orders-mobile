import React, { createContext, useReducer, ReactNode, useContext } from "react";
import { Order, OrderDetail } from "@/types/types";

interface OrderState {
  order: Order | null;
  orderDetails: OrderDetail[];
  loading: boolean;
  error: string | null;
}

type OrderAction =
  | { type: "SET_ORDER"; payload: Order }
  | { type: "SET_ORDER_DETAILS"; payload: OrderDetail[] }
  | { type: "RESET_ORDER" }
  | { type: "ADD_ORDER_DETAIL"; payload: OrderDetail }
  | { type: "UPDATE_ORDER_DETAIL"; payload: OrderDetail }
  | { type: "REMOVE_ORDER_DETAIL"; payload: number }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

const initialState: OrderState = {
  order: null,
  orderDetails: [],
  loading: false,
  error: null,
};

const OrderContext = createContext<{
  state: OrderState;
  dispatch: React.Dispatch<OrderAction>;
}>({
  state: initialState,
  dispatch: () => undefined,
});

const orderReducer = (state: OrderState, action: OrderAction): OrderState => {
  switch (action.type) {
    case "SET_ORDER":
      const updteOrder = { ...state, order: action.payload, loading: false };
      return updteOrder;
    case "SET_ORDER_DETAILS":
      return { ...state, orderDetails: action.payload, loading: false };
    case "RESET_ORDER":
      return initialState;
    case "ADD_ORDER_DETAIL":
      return {
        ...state,
        orderDetails: [...state.orderDetails, action.payload],
      };
    case "UPDATE_ORDER_DETAIL":
      return {
        ...state,
        orderDetails: state.orderDetails.map((detail) =>
          detail.idOrdenDetalle === action.payload.idOrdenDetalle
            ? action.payload
            : detail
        ),
      };
    case "REMOVE_ORDER_DETAIL":
      return {
        ...state,
        orderDetails: state.orderDetails.filter(
          (detail) => detail.idOrdenDetalle !== action.payload
        ),
      };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

export const OrderProvider = ({ children }: { children: ReactNode }) => {
  const [orderState, dispatch] = useReducer(orderReducer, initialState);

  return (
    <OrderContext.Provider value={{ state: orderState, dispatch }}>
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