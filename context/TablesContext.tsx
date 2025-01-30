import { createContext, useContext, useEffect, useState } from "react";
import { useSettings } from "./SettingsContext";

interface TableContextType {
  activeTables: ActiveTable[];
  getActiveTables: () => Promise<void>;
}

interface ActiveTable {
  identificador: number;
  numeroMesa: number;
  zona: string;
  nombreCliente: string;
  identificadorCliente: number;
  estadoProduccion: string;
  cronometroOrden: string;
  ordenImpresa: boolean;
  tiempoLimiteCronometro: string;
  totalConDescuento: number;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

export const TableProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { token, settings, hasUser } = useSettings();
  const [activeTables, setActiveTables] = useState<ActiveTable[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getActiveTables = async () => {
    const url = `http://${settings?.idComputadora}:5001/orden/activa`;
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      if (!data) {
        console.warn("Respuesta vacía del servidor.");
        setActiveTables([]);
        return;
      }
      setActiveTables(data.resultado || []);
    } catch (error) {
      //console.error("Error fetching active tables:", error);
      setActiveTables([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      getActiveTables();
    }
  }, [token, hasUser]);

  return (
    <TableContext.Provider value={{ activeTables, getActiveTables }}>
      {children}
    </TableContext.Provider>
  );
};

export const useTable = (): TableContextType => {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error("useTable debe usarse dentro de un TableProvider");
  }
  return context;
};
