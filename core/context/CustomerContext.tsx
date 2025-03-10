// CustomerContext.tsx
import React, {
  createContext,
  useReducer,
  useContext,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import { useSettings } from "./SettingsContext";
import { Customer } from "@/types/customerTypes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CustomerService } from "@/core/services/customer.service";
import { Observable } from "rxjs";

interface CustomerState {
  customers: Customer[];
  selectedCustomer?: Customer;
  status: "loading" | "error" | "success";
  hasCustomerChanged: boolean; // Nuevo estado para rastrear cambios en el cliente
}

type CustomerAction =
  | { type: "SET_CUSTOMERS"; payload: Customer[] }
  | { type: "SET_STATUS"; payload: "loading" | "error" | "success" }
  | { type: "SET_SELECTED_CUSTOMER"; payload: Customer }
  | { type: "CLEAR_SELECTED_CUSTOMER" }
  | { type: "SET_CUSTOMER_CHANGED"; payload: boolean }; // Nueva acción para hasCustomerChanged

const initialState: CustomerState = {
  customers: [],
  selectedCustomer: undefined,
  status: "loading",
  hasCustomerChanged: false, // Inicialmente no hay cambios
};

interface CustomerContextValue {
  state: CustomerState;
  dispatch: React.Dispatch<CustomerAction>;
  clearCustomer: () => void;
  fetchCustomers: (signal?: AbortSignal) => void;
  loadCustomersForLetter: (letter: string) => Observable<Customer[]>;
}

const CustomerContext = createContext<CustomerContextValue>({
  state: initialState,
  dispatch: () => undefined,
  clearCustomer: () => {},
  fetchCustomers: () => {},
  loadCustomersForLetter: () => new Observable<Customer[]>(),
});

const customerReducer = (
  state: CustomerState,
  action: CustomerAction
): CustomerState => {
  switch (action.type) {
    case "SET_CUSTOMERS":
      return { ...state, customers: action.payload };
    case "SET_STATUS":
      return { ...state, status: action.payload };
    case "SET_SELECTED_CUSTOMER":
      return {
        ...state,
        selectedCustomer: action.payload,
        hasCustomerChanged: state.selectedCustomer !== action.payload, // Cambia solo si el cliente es diferente
      };
    case "CLEAR_SELECTED_CUSTOMER":
      return { ...state, selectedCustomer: undefined, hasCustomerChanged: false };
    case "SET_CUSTOMER_CHANGED":
      return { ...state, hasCustomerChanged: action.payload };
    default:
      return state;
  }
};

export const CustomerProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(customerReducer, initialState);
  const { settings, token } = useSettings();

  const fetchCustomers = useCallback(
    async (signal?: AbortSignal) => {
      try {
        if (!settings || !token) {
          dispatch({ type: "SET_STATUS", payload: "error" });
          return;
        }
        dispatch({ type: "SET_STATUS", payload: "loading" });
        const fetchedCustomers = await CustomerService.fetchCustomers(signal);
        dispatch({ type: "SET_CUSTOMERS", payload: fetchedCustomers });
        dispatch({ type: "SET_STATUS", payload: "success" });
      } catch (error) {
        console.log(error);
        dispatch({ type: "SET_STATUS", payload: "error" });
        dispatch({ type: "SET_CUSTOMERS", payload: [] });
      }
    },
    [settings, token, dispatch]
  );

  const loadCustomersForLetter = useCallback(
    (letter: string) => {
      return CustomerService.loadCustomersForLetter(letter);
    },
    []
  );

  const clearCustomer = () => {
    dispatch({ type: "CLEAR_SELECTED_CUSTOMER" });
    AsyncStorage.removeItem("selectedCustomer").catch(() => {});
  };

  return (
    <CustomerContext.Provider
      value={{
        state,
        dispatch,
        clearCustomer,
        fetchCustomers,
        loadCustomersForLetter,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error("useCustomer must be used within a CustomerProvider");
  }
  return context;
};