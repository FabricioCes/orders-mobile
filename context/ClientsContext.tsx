import React, { createContext, useContext, useEffect, useState } from "react";
import { useSettings } from "./SettingsContext";

interface ClientsContextType {
    clients: any[];
}

const ClientsContext = createContext<ClientsContextType | undefined>(undefined);

export const ClientsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [clients, setClients] = useState([]);
    const { settings, token } = useSettings();

    const getClients = async () => {

        const url = `http://${settings}:5001/cliente?pagina=1&tamanoPagina=100`;
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                return;
            }

            const data = await response.json();
            setClients(data.resultado || []);
            console.log(JSON.stringify(data.resultado, null, 2));
        } catch (error) {
            console.error("Error al obtener clientes:", error);
        }
    };

    useEffect(() => {
        if (token && settings) {
            getClients();
        }
    }, [token, settings]);

    return (
        <ClientsContext.Provider value={{ clients }}>
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