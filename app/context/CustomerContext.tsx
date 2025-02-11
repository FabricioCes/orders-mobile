import React, {
  createContext,
  useReducer,
  useContext,
  ReactNode,
  useEffect
} from "react";
import { useSettings } from "./SettingsContext";
import { Customer } from "@/types/customerTypes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CustomerService } from "@/core/services/customer.service";

interface CustomerState {
  customers: Customer[];
  selectedCustomer?: Customer;
  status: "loading" | "error" | "success";
}

type CustomerAction =
  | { type: "SET_CUSTOMERS"; payload: Customer[] }
  | { type: "SET_STATUS"; payload: "loading" | "error" | "success" }
  | { type: "SET_SELECTED_CUSTOMER"; payload: Customer }
  | { type: "CLEAR_SELECTED_CUSTOMER" };

const initialState: CustomerState = {
  customers: [],
  selectedCustomer: undefined,
  status: "loading",
};

const CustomerContext = createContext<{
  state: CustomerState;
  dispatch: React.Dispatch<CustomerAction>;
  clearCustomer: () => void;
  fetchCustomers: (signal?: AbortSignal) => void;
}>({
  state: initialState,
  dispatch: () => undefined,
  clearCustomer: ()=> {},
  fetchCustomers: ()=> {}
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
      return { ...state, selectedCustomer: action.payload };
    case "CLEAR_SELECTED_CUSTOMER":
      return { ...state, selectedCustomer: undefined };
    default:
      return state;
  }
};

export const CustomerProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(customerReducer, initialState);
  const { settings, token } = useSettings();


  const fetchCustomers = async (signal?: AbortSignal) => {
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
      console.error(error);
      dispatch({ type: "SET_STATUS", payload: "error" });
      dispatch({ type: "SET_CUSTOMERS", payload: [] });
    }
  };

  const clearCustomer = () => {
    dispatch({ type: "CLEAR_SELECTED_CUSTOMER" });
    AsyncStorage.removeItem("selectedCustomer").catch(() => {});
  };


  return (
    <CustomerContext.Provider value={{ state, dispatch, clearCustomer, fetchCustomers }}>
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
