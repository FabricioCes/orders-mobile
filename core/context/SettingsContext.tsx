import { createContext, useContext, useState, useEffect } from "react";
import { router } from "expo-router";
import { SettingsService } from "../services/settings.service";
import { TokenService } from "../services/token.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthService } from "../services/auth.service";
import { ZonaService } from "../services/zone.service";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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
  refetchZonas: () => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<any>(null);
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const queryClient = useQueryClient();

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
    if (userStatus === "true") setIsLogin(true);
    if (savedUserName) setUserName(savedUserName);
  };

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    const apiUrl = `http://${settings?.idComputadora}:5001`;
    const success = await AuthService.login(username, password, apiUrl);
    if (success) {
      setIsLogin(true);
      setUserName(username);
      const newToken = await TokenService.getToken();
      setToken(newToken ?? "");
      // Invalidar la caché de zonas para recargar los datos tras el login
      queryClient.invalidateQueries({ queryKey: ["zonas"] });
      queryClient.invalidateQueries({ queryKey: ["tablesByLocation"] });
    }
    return success;
  };

  const logOut = async () => {
    await AuthService.logout();
    setIsLogin(false);
    setUserName("");
    setToken("");
    router.navigate("/components/login");
  };

  const checkTokenExpiration = async (): Promise<boolean> => {
    const isValid = await TokenService.checkTokenExpiration();
    return isValid;
  };

  // Cargar zonas con useQuery
  const { data: zonas, refetch: refetchZonas } = useQuery({
    queryKey: ["zonas"],
    queryFn: async () => {
      if (!settings?.idComputadora || !token) return {};
      const apiUrl = `http://${settings.idComputadora}:5001`;
      return await ZonaService.fetchZonasMesas(apiUrl, token);
    },
    enabled: !!settings?.idComputadora && !!token, // Solo se ejecuta si hay idComputadora y token
  });

  useEffect(() => {
    loadSettings();
  }, []);

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
        zonas: zonas || {}, // Si zonas es undefined, devuelve un objeto vacío
        refetchZonas, // Función para recargar manualmente las zonas
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
