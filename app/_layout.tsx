import { Stack } from "expo-router";
import { View } from "react-native";
import '../global.css';
import Providers from "./providers";
import { useEffect, useState } from "react";
import SplashScreenAnimated from "./SplashScreen";

export default function RootLayout() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simula una carga inicial
    const timer = setTimeout(() => {
      setLoading(false); // Deja de mostrar el Splash
    }, 2000);

    return () => clearTimeout(timer); // Limpia el temporizador si se desmonta el componente
  }, []);

  return (
    <Providers>
      <View style={{ flex: 1 }}>
        {loading ? (
          <SplashScreenAnimated /> // Muestra el Splash personalizado
        ) : (
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: "#60A5FACC" },
              headerTintColor: "#fff",
            }}
          >
            <Stack.Screen
              name="(tabs)"
              options={{ headerShown: false, title: "Inicio" }}
            />
            <Stack.Screen name="Order" options={{ title: "Orden" }} />
            <Stack.Screen
              name="login"
              options={{
                presentation: "modal",
                title: "Iniciar Sesión",
                headerStyle: { backgroundColor: "#F3F4F6" },
                headerTintColor: "#60A5FA",
              }}
            />
            <Stack.Screen
              name="clients"
              options={{
                presentation: "modal",
                title: "Agregar Cliente",
                headerStyle: { backgroundColor: "#F3F4F6" },
                headerTintColor: "#60A5FA",
              }}
            />
          </Stack>
        )}
      </View>
    </Providers>
  );
}