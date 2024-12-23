import { createContext, useContext, useEffect, useState } from "react";
import { useSettings } from "./SettingsContext";

interface TableContextType {
  activeTables: ActiveTable[]; // Estado para almacenar las mesas activas
  getActiveTables: () => Promise<void>; // Función para obtener mesas activas
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
}

const TableContext = createContext<TableContextType | undefined>(undefined);

export const TableProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, settings } = useSettings();
  const [activeTables, setActiveTables] = useState<ActiveTable[]>([]);

  // Función para obtener mesas activas
  const getActiveTables = async () => {
    const url = `http://${settings}:5001/orden/activa`
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return;
      }

      const text = await response.text(); // Obtener la respuesta como texto
      if (!text) {
        console.warn("Respuesta vacía del servidor.");
        setActiveTables([]); // Devolver un array vacío si no hay datos
        return;
      }
      const data = JSON.parse(text); // Parsear a JSON
      setActiveTables(data.resultado || []); // Establecer mesas activas
    } catch (error) {
      //console.error("Error al obtener mesas activas:", error);
      setActiveTables([]); // Fallback para evitar errores
    }
  };

  // Cargar mesas activas cuando el token cambia
  useEffect(() => {
    if (token) {
      getActiveTables();
    }
  }, [token]);

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