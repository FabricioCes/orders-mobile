import { router, Stack, useLocalSearchParams } from "expo-router";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import "../global.css";
import Providers from "./providers";
import { Ionicons } from "@expo/vector-icons";

interface ScreenConfig {
  name: string;
  options: {
    type?: "tabs" | "modal" | "default";
    title: string;
    animation?: "fade" | "slide_from_right" | "slide_from_bottom";
  };
}

const SCREENS_CONFIG: ScreenConfig[] = [
  {
    name: "(tabs)",
    options: {
      type: "tabs",
      title: "",
      animation: "fade",
    },
  },
  {
    name: "screens/order-screen",
    options: {
      type: "default",
      title: "Detalle de Orden",
      animation: "slide_from_right",
    },
  },
  {
    name: "screens/settings-screen",
    options: {
      type: "default",
      title: "Configuracion",
      animation: "slide_from_right",
    },
  },
  {
    name: "screens/products-screen",
    options: {
      type: "modal",
      title: "Seleccionar Productos",
      animation: "slide_from_bottom",
    },
  },
  {
    name: "screens/customers-screen",
    options: {
      type: "modal",
      title: "Gestión de Clientes",
      animation: "slide_from_bottom",
    },
  },
  {
    name: "components/login",
    options: {
      type: "modal",
      title: "Iniciar Sesión",
      animation: "slide_from_bottom",
    },
  },
];

const THEME = {
  colors: {
    primary: "#60A5FA", // Quitamos la opacidad para consistencia
    background: "#F3F4F6",
    textLight: "#fff",
    textDark: "#1E3A8A", // Azul oscuro para texto
  },
  headers: {
    default: {
      headerStyle: {
        backgroundColor: "#fff", // Fondo blanco
        elevation: 4, // Sombra más visible
        shadowOpacity: 0.2,
      },
      headerTitleStyle: {
        fontWeight: "700",
        fontSize: 20, // Texto más grande
        color: "#1E3A8A", // Texto azul oscuro
      },
      headerTintColor: "#1E3A8A", // Íconos en azul oscuro
    },
    modal: {
      headerStyle: {
        backgroundColor: "#F3F4F6", // Fondo gris claro
        elevation: 4, // Sombra más visible
        shadowOpacity: 0.2,
      },
      headerTitleStyle: {
        fontWeight: "700",
        fontSize: 20, // Texto más grande
        color: "#1E3A8A", // Texto azul oscuro
      },
      headerTintColor: "#60A5FA", // Íconos en azul claro
    },
  },
};
export default function RootLayout() {
  const { orderId } = useLocalSearchParams();

  return (
    <Providers orderId={String(orderId)}>
      <View style={styles.container}>
        <Stack
          screenOptions={{
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
            headerStyle: THEME.headers.default.headerStyle,
            headerTitleStyle: THEME.headers.default.headerTitleStyle,
            headerTintColor: THEME.headers.default.headerTintColor,
            headerTitleAlign: "center", // Centrar el título
          }}
        >
          {SCREENS_CONFIG.map(({ name, options }) => {
            const isModal = options.type === "modal";
            const headerShown = true;
            const presentation = isModal ? "modal" : "card";
            const gestureDirection =
              options.animation === "slide_from_bottom"
                ? "vertical"
                : "horizontal";

            return (
              <Stack.Screen
                key={name}
                name={name}
                options={{
                  title: options.title,
                  headerShown,
                  presentation,
                  headerStyle: isModal
                    ? THEME.headers.modal.headerStyle
                    : THEME.headers.default.headerStyle,
                  headerTitleStyle: isModal
                    ? THEME.headers.modal.headerTitleStyle
                    : THEME.headers.default.headerTitleStyle,
                  headerTintColor: isModal
                    ? THEME.headers.modal.headerTintColor
                    : THEME.headers.default.headerTintColor,
                  animation: options.animation,
                  gestureDirection,
                  headerLeft: isModal ? () => null : undefined,
                  headerRight: () => (
                    <View style={{ flexDirection: "row", marginRight: 10 }}>
                      <TouchableOpacity
                        onPress={() => alert("Mostrar notificaciones")}
                      >
                        <Ionicons
                          name="notifications"
                          size={24}
                          color="#1E3A8A"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => router.push("/screens/settings-screen")}
                        style={{ marginLeft: 15 }}
                      >
                        <Ionicons name="settings" size={24} color="#1E3A8A" />
                      </TouchableOpacity>
                    </View>
                  ),
                }}
              />
            );
          })}
        </Stack>
      </View>
    </Providers>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
});
