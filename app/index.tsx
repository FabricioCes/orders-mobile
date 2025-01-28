import { useSettings } from "@/context/SettingsContext";
import { Redirect, router } from "expo-router";
import { useEffect } from "react";
import { Alert } from "react-native";

const StartPage = () => {
  const { settings, checkTokenExpiration } = useSettings();

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
          onPress: () => router.navigate("/(tabs)/settings"),
        },
      ],
      { cancelable: false }
    );
  return <Redirect href="/(tabs)/comedor" />;
};

export default StartPage;
