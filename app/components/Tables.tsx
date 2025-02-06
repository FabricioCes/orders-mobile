import React from "react";
import {
  View,
  useWindowDimensions,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import TableGrid from "./tables/TableGrid";
import { useTableNavigation } from "@/hooks/useTableNavigation";
import { useSettings } from "@/context/SettingsContext";
import { router } from "expo-router";

type TablesProps = {
  place: string;
  qty?: number;
};

type MessageVariant = "error" | "warning" | "info";

const variantStyles = {
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-600",
    iconColor: "#DC2626",
    iconName: "alert-circle-outline" as const,
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-600",
    iconColor: "#D97706",
    iconName: "warning-outline" as const,
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-600",
    iconColor: "#2563EB",
    iconName: "information-circle-outline" as const,
  },
};

const ErrorMessage = ({
  text,
  variant = "error",
  action,
}: {
  text: string;
  variant?: MessageVariant;
  action?: { label: string; onPress: () => void };
}) => {
  const styles = variantStyles[variant];

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      className={`${styles.bg} p-4 rounded-lg border ${styles.border} items-center w-4/5 shadow-sm`}
    >
      <View className="flex-col items-center gap-2">
        <View className="flex-row items-center gap-2">
          <Ionicons
            name={styles.iconName}
            size={24}
            color={styles.iconColor}
            className="animate-pulse"
          />
          <Text className={`${styles.text} text-base font-medium text-center`}>
            {text}
          </Text>
        </View>

        {action && (
          <TouchableOpacity
            onPress={action.onPress}
            className={`mt-3 px-4 py-2 rounded-full ${
              variant === "error"
                ? "bg-red-100"
                : variant === "warning"
                ? "bg-amber-100"
                : "bg-blue-100"
            }`}
          >
            <Text
              className={`${
                variant === "error"
                  ? "text-red-700"
                  : variant === "warning"
                  ? "text-amber-700"
                  : "text-blue-700"
              } font-medium`}
            >
              {action.label}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const LoadingState = () => (
  <Animated.View
    entering={FadeIn}
    exiting={FadeOut}
    className="flex-1 justify-center items-center space-y-3"
  >
    <ActivityIndicator size="large" color="#2563EB" />
    <Text className="text-gray-600 text-sm font-light tracking-wide">
      Cargando configuración de mesas...
    </Text>
  </Animated.View>
);

export default function Tables({ place, qty: propQty }: TablesProps) {
  const { width } = useWindowDimensions();
  const { zonas, loadingZonas, token } = useSettings();

  const isTablet = width >= 768;
  const columns = isTablet ? 9 : 3;
  const qty = propQty || zonas[place] || 0;
  const tables = Array.from({ length: qty }, (_, i) => i + 1);
  const { handleTablePress, isTableActive } = useTableNavigation(place);

  if (loadingZonas) return <LoadingState />;

  if (!qty || !token) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50/70 p-4">
        {!token ? (
          <ErrorMessage
            variant="error"
            text="Debe iniciar sesión para ver las mesas"
            action={{
              label: "Ir al Login",
              onPress: () => router.navigate("/components/login")
            }}
          />
        ) : (
          <ErrorMessage
            variant="warning"
            text={`No hay mesas configuradas para ${place}`}
          />
        )}

        {!token && (
          <Text className="text-gray-500 text-sm mt-4 text-center">
            Contacte al administrador si necesita acceso
          </Text>
        )}
      </View>
    );
  }

  return (
    <Animated.View
      entering={FadeIn.delay(200)}
      className="p-5 flex-1 justify-center bg-white"
    >
      <TableGrid
        tables={tables}
        columns={columns}
        isActive={isTableActive}
        onTablePress={handleTablePress}
        place={place}
      />
    </Animated.View>
  );
}