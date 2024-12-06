import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import '../global.css';
import Providers from "./providers";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const isDarkMode = colorScheme === "dark";

  return (
    <Providers>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#60A5FACC"
          },
          headerTintColor: isDarkMode ? "#fff" : "#000",
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: "Inicio" }} />
        <Stack.Screen name="Order" options={{ title: "Orden" }} />
      </Stack>
    </Providers>
  );
}