import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import {jwtDecode} from "jwt-decode";

// Define la interfaz del contexto
interface SettingsContextType {
  saveSettings: (value: string) => void;
  login: (username: string, password: string) => Promise<boolean>;
  logOut: () => void;
  settings: string;
  hasUser: boolean;
  userName: string;
  token: string;
}

// Crea el contexto
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Proveedor del contexto
export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<string>("");
  const [hasUser, setHasUser] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");
  const [token, setToken] = useState<string>("");
  // Función para guardar configuraciones
  const saveSettings = async (value: string) => {
    try {
      await AsyncStorage.setItem("idComputadora", value); // Guardar en AsyncStorage
      setSettings(value); // Actualizar el estado
    } catch (error) {
      console.error("Error al guardar en AsyncStorage:", error);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`http://${settings}:5001/autenticacion/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: username,
          clave: password,
        }),
      });
  
      const data = await response.json();
  
      if (response.ok && data.resultado) {
        await AsyncStorage.setItem("token", data.resultado);
        await AsyncStorage.setItem("hasUser", "true");
        await AsyncStorage.setItem("userName", username);
        setToken(data.resultado);
        setHasUser(true);
        setUserName(username);
        return true; // Login exitoso
      } else {
        return false; // Login fallido
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      return false; // Error de red o servidor
    }
  };

  const logOut = async () => {
    try {
      await AsyncStorage.removeItem("hasUser");
      setHasUser(false);
      setUserName("");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
    }
  }

  // Cargar el valor inicial desde AsyncStorage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedValue = await AsyncStorage.getItem("idComputadora");
        const userStatus = await AsyncStorage.getItem("hasUser");
        const savedToken = await AsyncStorage.getItem("token");
        const savedUserName = await AsyncStorage.getItem("userName");
  
        if (savedUserName) setUserName(savedUserName);
        if (storedValue) setSettings(storedValue);
        if (userStatus === "true") setHasUser(true);
        checkTokenExpiration();
        if (savedToken) {
          setToken(savedToken);
        }
      } catch (error) {
        console.error("Error al cargar datos de AsyncStorage:", error);
      }
    };
  
    loadSettings();
  }, []);

  const checkTokenExpiration = async () => {
    if (!token) return; // Si no hay token, salir de la función
    
    try {
      const decodedToken: { exp: number } = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
  
      if (decodedToken.exp < currentTime) {
        console.log("El token ha expirado.");
        await logOut(); // Hacer logout
        router.replace("/login"); // Redirigir al login
      }else{
        console.log("Token alive.")
      }
    } catch (error) {
      console.error("Error al decodificar el token:", error);
      await logOut();
      router.replace("/login");
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, saveSettings, login, hasUser, userName, logOut, token }}>
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