
import AsyncStorage from "@react-native-async-storage/async-storage";


const getHost = async () => await AsyncStorage.getItem("settings");

export async function getBaseUrl() {
    const settings = await getHost();
    if (!settings) {
        throw new Error("Settings not found");
    }
    const parsedSettings: { idComputadora: string } = JSON.parse(settings);
    return `http://${parsedSettings?.idComputadora}:5001`
  };