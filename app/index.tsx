import { useActiveTables } from "@/core/context/ActiveTablesContext";
import { useSettings } from "@/core/context/SettingsContext";
import { signalRService } from "@/core/services/real-time.service";
import { Redirect, router } from "expo-router";
import { useEffect } from "react";
import { Alert } from "react-native";

const StartPage = () => {
  const { settings, checkTokenExpiration, fetchZonasMesas } = useSettings();
  const { loadActiveTables } = useActiveTables();

  useEffect(() => {
    signalRService.start();
  }, [fetchZonasMesas, loadActiveTables]);

  useEffect(() => {
    checkTokenExpiration();

    if (settings?.idComputadora?.trim().length === 0)  {
      showConfigurationAlert();
    }
  }, [settings]);

  const showConfigurationAlert = () =>
    Alert.alert(
      "Oops! 🤚🏼",
      "No has configurado la ip del Servidor 🚫",
      [
        {
          text: "Aceptar",
          onPress: () => router.navigate("/screens/settings-screen"),
        },
      ],
      { cancelable: false }
    );
  return <Redirect href="/(tabs)/comedor" />;
};

export default StartPage;
