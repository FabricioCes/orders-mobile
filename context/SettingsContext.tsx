import React, { createContext, useContext, useState } from "react";

// Define la interfaz del contexto
interface SettingsContextType {
    saveSettings: (value: string) => void;
    settings: string;
}

// Crea el contexto
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Proveedor del contexto
export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<string>("");

    const saveSettings = (value: string) => {
        setSettings(value);
    };

    return (
        <SettingsContext.Provider value={{ settings, saveSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

// Hook personalizado para usar el contexto
export const useSettings = (): SettingsContextType => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error("useSettings debe usarse dentro de un SettingsProvider");
    }
    return context;
};