import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native";
import "../global.css";
import Providers from "./providers";
import { useEffect, useState } from "react";
import SplashScreenAnimated from "./screens/Splash-screen";

const SCREENS_CONFIG: ScreenConfig[] = [
  {
    name: "(tabs)",
    options: {
      type: "tabs",
      title: "Inicio",
      animation: "fade",
      headerShown: false,
    },
  },
  {
    name: "screens/order-screen",
    options: {
      title: "Detalle de Orden",
      animation: "slide_from_right",
      type: "default",
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
    name: "screens/clients-screen",
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
] as const;

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

interface ScreenConfig {
  name: string;
  options: {
    type?: "tabs" | "modal" | "default";
    title: string;
    animation?: "fade" | "slide_from_right" | "slide_from_bottom";
    headerShown?: boolean;
  };
}

export default function RootLayout() {
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsAppReady(true);
    };
    initializeApp();
  }, []);

  if (!isAppReady) return <SplashScreenAnimated />;

  return (
    <Providers>
      <View style={styles.container}>
        <Stack
          screenOptions={{
            ...THEME.headers.default,
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
          }}
        >
          {SCREENS_CONFIG.map(({ name, options }) => (
            <Stack.Screen
              key={name}
              name={name}
              options={{
                title: options.title,
                headerShown: options.type === "tabs" ? false : true,
                presentation: options.type === "modal" ? "modal" : "card",
                headerStyle:
                  options.type === "modal"
                    ? THEME.headers.modal.headerStyle
                    : THEME.headers.default.headerStyle,
                headerTitleStyle:
                  options.type === "modal"
                    ? THEME.headers.modal.headerTitleStyle
                    : THEME.headers.default.headerTitleStyle,
                headerTintColor:
                  options.type === "modal"
                    ? THEME.headers.modal.headerTintColor
                    : THEME.headers.default.headerTintColor,
                animation: options.animation,
                gestureDirection:
                  options.animation === "slide_from_bottom"
                    ? "vertical"
                    : "horizontal",
              }}
            />
          ))}
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
