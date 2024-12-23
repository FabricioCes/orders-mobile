import React, { createContext, useContext, useEffect, useState } from "react";
import { useSettings } from "./SettingsContext";
import { Client } from "@/types/types";

interface ClientsContextType {
    clients: Client[]; // Cambiado a un array de `Client`
    addClient: (client: Client) => void;
    selectedClient: Client | undefined;
    clearClient: () => void;
}

const ClientsContext = createContext<ClientsContextType | undefined>(undefined);

export const ClientsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [clients, setClients] = useState<Client[]>([]); // Inicialización con el tipo correcto
    const { settings, token } = useSettings();
    const [selectedClient, setSelectedClient] = useState<Client | undefined>(undefined);

    const getClients = async () => {
        const url = `http://${settings}:5001/cliente?pagina=1&tamanoPagina=100`;

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                console.error(`Error: ${response.status} - ${response.statusText}`);
                return;
            }

            const data = await response.json();

            if (data.resultado) {
                const mappedClients = data.resultado.map((client: any): Client => ({
                    id: client.identificador,
                    name: client.nombre,
                    ced: client.cedula || "",
                    priceType: client.tipoPrecio,
                    tel: client.telefono || "",
                    tel2: client.telefono2 || "",
                    email: client.correo || "",
                    email2: client.correo2 || "",
                    address: client.direccion.trim() || "",
                }));
                setClients(mappedClients);
            } else {
                setClients([]); // Fallback a un array vacío si no hay resultados
            }
        } catch (error) {
            console.error("Error al obtener clientes:", error);
            setClients([]); // Fallback a un array vacío en caso de error
        }
    };

    const addClient = (client: Client) =>{
        setSelectedClient(client);
    }

    const clearClient = () =>{
        setSelectedClient(undefined);
    }

    useEffect(() => {
        if (token && settings) {
            getClients();
        }
    }, [token, settings]);

    return (
        <ClientsContext.Provider value={{ clients, addClient, selectedClient, clearClient }}>
            {children}
        </ClientsContext.Provider>
    );
};

export const useClients = (): ClientsContextType => {
    const context = useContext(ClientsContext);
    if (!context) {
        throw new Error("useClients debe usarse dentro de un ClientsProvider");
    }
    return context;
};