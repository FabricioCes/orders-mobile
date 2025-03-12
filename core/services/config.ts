
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";


const getHost = async () => await AsyncStorage.getItem("settings");

export async function getBaseUrl() {
    const settings = await getHost();
    if (!settings) {
        throw new Error("Settings not found");
    }
    const parsedSettings: { idComputadora: string } = JSON.parse(settings);
    return `http://${parsedSettings?.idComputadora}:5001`
  };

  export const handleUnauthorized = () => {
    // Limpiar token y redirigir
    AsyncStorage.removeItem('authToken');
    router.navigate('/components/login');
  };