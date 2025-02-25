import React, { createContext, useReducer, useContext, ReactNode, useEffect, useCallback } from "react";
import { ActiveTable } from "@/types/tableTypes";
import { orderService } from "@/core/services/order.service";
import { useSettings } from "@/core/context/SettingsContext"; // Ajusta la ruta

interface ActiveTablesState {
  activeTables: ActiveTable[];
  loading: boolean;
  error: string | null;
}

type ActiveTablesAction =
  | { type: "SET_ACTIVE_TABLES"; payload: ActiveTable[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

const initialState: ActiveTablesState = {
  activeTables: [],
  loading: false,
  error: null,
};

const ActiveTablesContext = createContext<{
  state: ActiveTablesState;
  dispatch: React.Dispatch<ActiveTablesAction>;
  loadActiveTables: () => Promise<void>;
}>({
  state: initialState,
  dispatch: () => undefined,
  loadActiveTables: async () => {},
});

const activeTablesReducer = (
  state: ActiveTablesState,
  action: ActiveTablesAction
): ActiveTablesState => {
  switch (action.type) {
    case "SET_ACTIVE_TABLES":
      return { ...state, activeTables: action.payload, loading: false };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

export const ActiveTablesProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(activeTablesReducer, initialState);
  const { isLogin, checkTokenExpiration } = useSettings();

  const loadActiveTables = useCallback(async () => {
    if (!isLogin) return;
    const isValidToken = await checkTokenExpiration();
    if (!isValidToken) return;

    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const activeTables = await orderService.loadActiveOrders();
      dispatch({ type: "SET_ACTIVE_TABLES", payload: activeTables });
    } catch  {
      dispatch({ type: "SET_ERROR", payload: "Error al cargar mesas activas" });
    }
  }, [isLogin]);

  useEffect(() => {
    loadActiveTables();
  }, [isLogin]);

  return (
    <ActiveTablesContext.Provider value={{ state, dispatch, loadActiveTables }}>
      {children}
    </ActiveTablesContext.Provider>
  );
};

export const useActiveTables = () => {
  const context = useContext(ActiveTablesContext);
  if (!context) {
    throw new Error("useActiveTables debe usarse dentro de un ActiveTablesProvider");
  }
  return context;
};