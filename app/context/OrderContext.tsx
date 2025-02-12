// OrderContext.tsx
import React, {
  createContext,
  useReducer,
  useContext,
  ReactNode
} from "react";
import { Order, OrderDetail } from "@/types/types";
import { orderService } from "@/core/services/order.service";


interface OrderState {
  order: Order | null;
  orderDetails: OrderDetail[];
}

type OrderAction =
  | { type: "SET_ORDER"; payload: Order }
  | { type: "RESET_ORDER" }
  | { type: "ADD_ORDER_DETAIL"; payload: OrderDetail }
  | { type: "UPDATE_ORDER_DETAIL"; payload: OrderDetail }
  | { type: "REMOVE_ORDER_DETAIL"; payload: number } // payload es el id del detalle
  | { type: "SET_ORDER_DETAILS"; payload: OrderDetail[] };

const initialState: OrderState = {
  order: null,
  orderDetails: [],
};

const OrderContext = createContext<{
  state: OrderState;
  dispatch: React.Dispatch<OrderAction>;
  fetchOrder: (orderId: string) => Promise<void>;
  orderId: string;
}>({
  state: initialState,
  dispatch: () => undefined,
  fetchOrder: async () => new Promise<void>((resolve) => resolve()),
  orderId: "",
});

const orderReducer = (state: OrderState, action: OrderAction): OrderState => {
  switch (action.type) {
    case "SET_ORDER":
      return { ...state, order: action.payload };
    case "SET_ORDER_DETAILS":
      return { ...state, orderDetails: action.payload };
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
          detail.identificadorOrdenDetalle ===
          action.payload.identificadorOrdenDetalle
            ? action.payload
            : detail
        ),
      };
    case "REMOVE_ORDER_DETAIL":
      return {
        ...state,
        orderDetails: state.orderDetails.filter(
          (detail) => detail.identificadorOrdenDetalle !== action.payload
        ),
      };
    default:
      return state;
  }
};

export const OrderProvider = ({
  children,
  orderId,
}: {
  children: ReactNode;
  orderId: string;
}) => {
  const [state, dispatch] = useReducer(orderReducer, initialState);

  const fetchOrder = async (orderId: string) => {
    try {
      const id = parseInt(orderId, 10);

      orderService.getOrder$(id).subscribe({
        next: (order) => {
          dispatch({ type: "SET_ORDER", payload: order as Order });
        },
        error: (err) => {
          console.log(err)
        },
      });

      orderService.getOrderDetails$(id).subscribe({
        next: (details) => {

          dispatch({ type: "SET_ORDER_DETAILS", payload: details as OrderDetail[] });
        },
        error: (err) => {
          console.log(err)
        },
      });


    } catch (error) {
      console.error("Error al obtener la orden:", error);
      dispatch({ type: "RESET_ORDER" });
    }
  };

  return (
    <OrderContext.Provider value={{ state, dispatch, fetchOrder, orderId }}>
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
