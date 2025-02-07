import React, { createContext, useContext, useEffect, useState } from "react";
import { useSettings } from "./SettingsContext";
import { Client, ClientsContextType } from "@/types/clientTypes";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ClientsContext = createContext<ClientsContextType | null>(null);

export const ClientsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client>();
  const [status, setStatus] = useState<"loading" | "error" | "success">(
    "loading"
  );
  const { settings, token } = useSettings();

  const fetchClients = async (signal?: AbortSignal) => {
    try {
      if (!settings || !token) {
        setStatus("error");
        return;
      }

      const response = await fetch(
        `http://${settings.idComputadora}:5001/cliente?pagina=1&tamanoPagina=100`,
        {
          signal,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      const mappedClients = data.resultado?.map(createClientFromApi) || [];
      setClients(mappedClients);
      setStatus("success");
    } catch (error) {
      if (!(error instanceof DOMException)) {
        // Ignora abort errors
        setStatus("error");
        setClients([]);
      }
    }
  };

  const clearClient = () => {
    setSelectedClient(undefined);
    AsyncStorage.removeItem("selectedClient").catch(() => {});
  };

  useEffect(() => {
    const controller = new AbortController();
    if (token && settings) fetchClients(controller.signal);
    return () => controller.abort();
  }, [token, settings]);

  return (
    <ClientsContext.Provider
      value={{
        clients,
        status,
        selectedClient,
        addClient: (client) => setSelectedClient(client),
        clearClient,
      }}
    >
      {children}
    </ClientsContext.Provider>
  );
};

const createClientFromApi = (apiClient: any): Client => ({
  identificacion: apiClient.identificador,
  nombre: apiClient.nombre,
  cedula: apiClient.cedula || "",
  tipoPrecio: apiClient.tipoPrecio,
  telefono: apiClient.telefono || undefined,
  telefono2: apiClient.telefono2 || undefined,
  correo: apiClient.correo || undefined,
  correo2: apiClient.correo2 || undefined,
  direccion: apiClient.direccion?.trim() || undefined,
});

export const useClients = () => {
  const context = useContext(ClientsContext);
  if (!context)
    throw new Error("useClients must be used within ClientsProvider");
  return context;
};
