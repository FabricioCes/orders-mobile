import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native";
import "../global.css";
import Providers from "./providers";
import { useEffect, useState } from "react";
import SplashScreenAnimated from "./SplashScreen";

const SCREENS_CONFIG: ScreenConfig[] = [
  {
    name: "(tabs)",
    options: {
      type: "tabs",
      title: "Inicio",
      animation: "fade"
    }
  },
  {
    name: "Order",
    options: {
      title: "Orden",
      animation: "slide_from_right"
    }
  },
  {
    name: "login",
    options: {
      type: "modal",
      title: "Iniciar Sesión",
      animation: "slide_from_bottom"
    }
  },
  {
    name: "clients",
    options: {
      type: "modal",
      title: "Agregar Cliente",
      animation: "slide_from_bottom"
    }
  }
] as const;

const THEME = {
  colors: {
    primary: "#60A5FACC",
    background: "#F3F4F6",
    textLight: "#fff",
    textDark: "#60A5FA"
  },
  headers: {
    default: {
      headerStyle: { backgroundColor: "#60A5FACC" },
      headerTintColor: "#fff"
    },
    modal: {
      headerStyle: { backgroundColor: "#F3F4F6" },
      headerTintColor: "#60A5FA"
    }
  }
};

interface ScreenConfig {
  name: string;
  options: {
    type?: 'tabs' | 'modal' | 'default';
    title: string;
    animation?: 'fade' | 'slide_from_right' | 'slide_from_bottom';
  };
}

export default function RootLayout() {
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsAppReady(true);
    };
    initializeApp();
  }, []);

  if (!isAppReady) return <SplashScreenAnimated />;

  return (
    <Providers>
      <View style={styles.container}>
        <Stack screenOptions={THEME.headers.default}>
          {SCREENS_CONFIG.map(({ name, options }: ScreenConfig) => (
            <Stack.Screen
              key={name}
              name={name}
              options={{
                title: options.title,
                headerShown: options.type === 'tabs' ? false : undefined,
                presentation: options.type === 'modal' ? 'modal' : undefined,
                headerStyle: options.type === 'modal'
                  ? THEME.headers.modal.headerStyle
                  : THEME.headers.default.headerStyle,
                headerTintColor: options.type === 'modal'
                  ? THEME.headers.modal.headerTintColor
                  : THEME.headers.default.headerTintColor,
                animation: options.animation as any
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
    backgroundColor: THEME.colors.background
  }
});