import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { jwtDecode } from "jwt-decode";
import { Alert } from "react-native";

type SettingsType = {
  idComputadora?: string;
};

type SettingsContextType = {
  saveSettings: (value: Partial<SettingsType>) => void;
  login: (username: string, password: string) => Promise<boolean>;
  logOut: () => void;
  settings: SettingsType | null;
  hasUser: boolean;
  userName: string;
  token: string;
  checkTokenExpiration: () => void;
  zonas: Record<string, number>;
  fetchZonasMesas: () => Promise<void>;
  loadingZonas: boolean;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [hasUser, setHasUser] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [zonas, setZonas] = useState<Record<string, number>>({});
  const [loadingZonas, setLoadingZonas] = useState(false);

  const saveSettings = async (value: Partial<SettingsType>) => {
    try {
      const updatedSettings: SettingsType = { ...settings, ...value };
      await AsyncStorage.setItem("settings", JSON.stringify(updatedSettings));
      setSettings(updatedSettings);
    } catch (error) {
      console.error("Error al guardar en AsyncStorage:", error);
    }
  };

  const loadSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem("settings");
      const userStatus = await AsyncStorage.getItem("hasUser");
      const savedToken = await AsyncStorage.getItem("token");
      const savedUserName = await AsyncStorage.getItem("userName");

      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }

      if (userStatus === "true") {
        setHasUser(true);
      }

      if (savedToken) {
        setToken(savedToken);
      }

      if (savedUserName) {
        setUserName(savedUserName);
      }

      checkTokenExpiration();
    } catch (error) {
      console.error("Error al cargar datos de AsyncStorage:", error);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `http://${settings?.idComputadora}:5001/autenticacion/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre: username, clave: password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(`No se pudo conectar con la base de datos: ${response.status}`);
        return false;
      }

      if (response.ok && data.resultado) {
        await AsyncStorage.setItem("token", data.resultado);
        await AsyncStorage.setItem("hasUser", "true");
        await AsyncStorage.setItem("userName", username);
        setToken(data.resultado);
        setHasUser(true);
        setUserName(username);
        return true; // Login exitoso
      } else {
        Alert.alert("Error iniciando sesión");
        return false; // Login fallido
      }
    } catch (error) {
      console.error("Error de red o servidor", error);
      return false; // Error de red o servidor
    }
  };

  // Función para cerrar sesión
  const logOut = async () => {
    try {
      await AsyncStorage.removeItem("hasUser");
      await AsyncStorage.removeItem("token");
      setHasUser(false);
      setUserName("");
      setToken("");
      router.navigate("/components/login"); // Redirige al login
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const checkTokenExpiration = async () => {
    if (!token) return;

    try {
      const decodedToken: { exp: number } = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      if (decodedToken.exp < currentTime) {
        await logOut();
      }
    } catch (error) {
      console.error("Error al decodificar el token:", error);
      await logOut();
    }
  };

  const fetchZonasMesas = async () => {
    if (!settings?.idComputadora || !token) {
      console.error(`No se han configurado las credenciales {${settings?.idComputadora}, ${token}}`);
      setLoadingZonas(false);
      return;
    }

    try {
      setLoadingZonas(true);
      const response = await fetch(
        `http://${settings.idComputadora}:5001/Parametro/cantidad/mesas`,
        {
          method: "GET",
          headers: { 
            Accept: "application/json",
            'Authorization': `Bearer ${token}`,
           },
        }
      );

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      setZonas(data.resultado || {});
    } catch (error) {
      console.error("Error obteniendo zonas:", error);
      Alert.alert("Error", "No se pudieron obtener las zonas y mesas");
      setZonas({});
    } finally {
      setLoadingZonas(false);
    }
  };
  const init = async () => {
    await loadSettings();
    if (settings?.idComputadora && token) {
      await fetchZonasMesas(); // Llamada solo cuando settings y token están disponibles
    }
  };

  useEffect(() => {
    init(); // Ejecutar la inicialización al montar el componente
  }, [settings?.idComputadora, token]); // Dependencias para ejecutar cuando estén disponibles settings.idComputadora y token


  return (
    <SettingsContext.Provider
      value={{
        settings,
        saveSettings,
        login,
        hasUser,
        userName,
        logOut,
        token,
        checkTokenExpiration,
        zonas,
        fetchZonasMesas,
        loadingZonas,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings debe usarse dentro de un SettingsProvider");
  }
  return context;
};
