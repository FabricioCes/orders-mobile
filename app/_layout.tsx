// RootLayout.tsx
import { Stack, useLocalSearchParams } from "expo-router";
import { View, StyleSheet, AppState } from "react-native";
import "../global.css";
import Providers from "./providers";
import { signalRService } from "@/core/services/real-time.service";
import { useEffect } from "react";
import { orderService } from "@/core/services/order.service";
import { TokenService } from "@/core/services/token.service";
import { AuthService } from "@/core/services/auth.service";

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
      title: "Inicio",
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
    primary: "#60A5FACC",
    background: "#F3F4F6",
    textLight: "#fff",
    textDark: "#60A5FA",
  },
  headers: {
    default: {
      headerStyle: {
        backgroundColor: "#60A5FACC",
        elevation: 2,
        shadowOpacity: 0.1,
      },
      headerTitleStyle: {
        fontWeight: "bold",
        fontSize: 18,
      },
      headerTintColor: "#fff",
    },
    modal: {
      headerStyle: {
        backgroundColor: "#F3F4F6",
        elevation: 4,
        shadowOpacity: 0.15,
      },
      headerTitleStyle: {
        fontWeight: "bold",
        color: "#1E3A8A",
        fontSize: 18,
      },
      headerTintColor: "#60A5FA",
    },
  },
};

/**
 * Hook que se encarga de cargar las órdenes activas tanto al montar
 * el componente como al cambiar el estado de la app a "active".
 */
function useActiveOrders() {
  useEffect(() => {
    const loadActiveOrders = async () => {
      const token = await TokenService.getToken();
      const isLogin = await AuthService.isLogin();
      if (await TokenService.checkTokenExpiration(String(token)) && isLogin) {
        // Se suscribe a las órdenes activas
        await orderService.loadActiveOrders()
      }
    };

    // Cargar órdenes activas al montar
    loadActiveOrders();

    // Escuchar cambios en el estado de la aplicación
    const subscription = AppState.addEventListener("change", async (state) => {
      if (state === "active") {
        loadActiveOrders();
      }
    });

    return () => subscription.remove();
  }, []);
}

export default function RootLayout() {
  const { orderId } = useLocalSearchParams();

  useEffect(() => {
    signalRService.start();
    return () => {
      // Si es necesario, se puede detener la conexión aquí
    };
  }, []);

  // Uso del hook para cargar órdenes activas
  useActiveOrders();

  return (
    <Providers orderId={String(orderId)}>
      <View style={styles.container}>
        <Stack
          screenOptions={{
            ...THEME.headers.default,
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
          }}
        >
          {SCREENS_CONFIG.map(({ name, options }) => {
            const isModal = options.type === "modal";
            const headerShown = options.type === "tabs" ? false : true;
            const presentation = isModal ? "modal" : "card";
            const headerStyle = isModal
              ? THEME.headers.modal.headerStyle
              : THEME.headers.default.headerStyle;
            const headerTitleStyle = isModal
              ? THEME.headers.modal.headerTitleStyle
              : THEME.headers.default.headerTitleStyle;
            const headerTintColor = isModal
              ? THEME.headers.modal.headerTintColor
              : THEME.headers.default.headerTintColor;
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
                  headerStyle,
                  headerTitleStyle,
                  headerTintColor,
                  animation: options.animation,
                  gestureDirection,
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
