// context/SettingsContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { router } from "expo-router";
import { SettingsService } from "../services/settings.service";
import { TokenService } from "../services/token.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthService } from "../services/auth.service";
import { ZonaService } from "../services/zone.service";

type SettingsContextType = {
  saveSettings: (value: any) => void;
  login: (username: string, password: string) => Promise<boolean>;
  logOut: () => void;
  settings: any;
  isLogin: boolean;
  userName: string;
  token: string;
  checkTokenExpiration: () => Promise<boolean>;
  zonas: Record<string, number>;
  fetchZonasMesas: () => Promise<void>;
  loadingZonas: boolean;
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<any>(null);
  const [isLogin, setisLogin] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [zonas, setZonas] = useState<Record<string, number>>({});
  const [loadingZonas, setLoadingZonas] = useState(false);

  const saveSettings = async (value: any) => {
    await SettingsService.saveSettings(value);
    setSettings(value);
  };

  const loadSettings = async () => {
    const storedSettings = await SettingsService.loadSettings();
    const savedToken = await TokenService.getToken();
    const userStatus = await AsyncStorage.getItem("isLogin");
    const savedUserName = await AsyncStorage.getItem("userName");

    if (storedSettings) setSettings(storedSettings);
    if (savedToken) setToken(savedToken);
    if (userStatus === "true") setisLogin(true);
    if (savedUserName) setUserName(savedUserName);

    checkTokenExpiration();
  };

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    const apiUrl = `http://${settings?.idComputadora}:5001`;
    const success = await AuthService.login(username, password, apiUrl);
    console.log("login", success);
    if (success) {
      setisLogin(true);
      setUserName(username);
      const token = await TokenService.getToken();
      setToken(token ?? "");
      fetchZonasMesas();
    }
    return success;
  };

  const logOut = async () => {
    await AuthService.logout();
    setisLogin(false);
    setUserName("");
    setToken("");
    router.navigate("/components/login");
  };

  const checkTokenExpiration = async (): Promise<boolean> => {
    const isValid = await TokenService.checkTokenExpiration();
    console.log("Token valido", isValid);
    return isValid;
  };

  const fetchZonasMesas = useCallback(async () => {
    if (!settings?.idComputadora || !token) return;

    setLoadingZonas(true);
    const apiUrl = `http://${settings.idComputadora}:5001`;
    const zonasData = await ZonaService.fetchZonasMesas(apiUrl, token);
    setZonas(zonasData);
    setLoadingZonas(false);
  }, [settings?.idComputadora, token]);

  useEffect(() => {
    loadSettings();
  }, []);


  useEffect(() => {
    const fetchZonas = async () => {
      const isValidToken = await checkTokenExpiration();
      if (isValidToken) {
        await fetchZonasMesas();
      } else {
          
      }
    };
    fetchZonas();
  }, [token, isLogin, fetchZonasMesas]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        saveSettings,
        login,
        isLogin,
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
