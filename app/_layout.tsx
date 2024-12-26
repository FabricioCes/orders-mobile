import { Stack } from "expo-router";
import { useColorScheme, View } from "react-native";
import '../global.css';
import Providers from "./providers";
import { useCallback, useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";

// Prevenir la ocultación automática del Splash Screen
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Simular carga de recursos iniciales (ajusta según tus necesidades)
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        // Ocultar el Splash Screen
        SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return null; // Mientras tanto, mantener la pantalla Splash activa
  }

  return (
    <Providers>
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: "#60A5FACC",
            },
            headerTintColor: isDarkMode ? "#fff" : "#000",
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false, title: "Inicio" }} />
          <Stack.Screen name="Order" options={{ title: "Orden" }} />
          <Stack.Screen name="login" options={{
            presentation: 'modal',
            title: "Iniciar Sesión",
            headerStyle: { backgroundColor: "#F3F4F6" },
            headerTintColor: "#60A5FA",
          }}
          />
          <Stack.Screen name="clients" options={{
            presentation: 'modal',
            title: "Agregar Cliente",
            headerStyle: { backgroundColor: "#F3F4F6" },
            headerTintColor: "#60A5FA",
          }}
          />
        </Stack>
      </View>
    </Providers>
  );
}