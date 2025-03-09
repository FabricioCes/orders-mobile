import React, {
  createContext,
  useReducer,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { ActiveTable } from "@/types/tableTypes";
import { orderService } from "@/core/services/order.service";
import { useSettings } from "@/core/context/SettingsContext";

interface ActiveTablesState {
  activeTables: ActiveTable[];
  loading: boolean;
  error: string | null;
}

type ActiveTablesAction =
  | { type: "SET_ACTIVE_TABLES"; payload: ActiveTable[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "UPDATE_TABLE"; payload: ActiveTable } // Nueva acción
  | { type: "REMOVE_TABLE"; payload: number }; // Nueva acción

const initialState: ActiveTablesState = {
  activeTables: [],
  loading: false,
  error: null,
};

const ActiveTablesContext = createContext<{
  state: ActiveTablesState;
  dispatch: React.Dispatch<ActiveTablesAction>;
  loadActiveTables: () => Promise<void>;
  updateTable: (table: ActiveTable) => void; // Nueva función
  removeTable: (tableId: number) => void; // Nueva función
}>({
  state: initialState,
  dispatch: () => undefined,
  loadActiveTables: async () => {},
  updateTable: () => {},
  removeTable: () => {},
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
    case "UPDATE_TABLE":
      return {
        ...state,
        activeTables: state.activeTables.map((table) =>
          table.identificador === action.payload.identificador? action.payload : table
        ),
      };
    case "REMOVE_TABLE":
      return {
        ...state,
        activeTables: state.activeTables.filter(
          (table) => table.identificador !== action.payload
        ),
      };
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
    } catch {
      dispatch({ type: "SET_ERROR", payload: "Error al cargar mesas activas" });
    }
  }, [isLogin, checkTokenExpiration]);

  const updateTable = useCallback((table: ActiveTable) => {
    dispatch({ type: "UPDATE_TABLE", payload: table });
  }, []);

  const removeTable = useCallback((tableId: number) => {
    dispatch({ type: "REMOVE_TABLE", payload: tableId });
  }, []);

  useEffect(() => {
    loadActiveTables();
  }, [loadActiveTables]);

  return (
    <ActiveTablesContext.Provider
      value={{
        state,
        dispatch,
        loadActiveTables,
        updateTable,
        removeTable,
      }}
    >
      {children}
    </ActiveTablesContext.Provider>
  );
};

export const useActiveTables = () => {
  const context = useContext(ActiveTablesContext);
  if (!context) {
    throw new Error(
      "useActiveTables debe usarse dentro de un ActiveTablesProvider"
    );
  }
  return context;
};
