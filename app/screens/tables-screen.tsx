import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { View, Text, TouchableOpacity, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import TableGrid from "../components/tables/TableGrid";
import { useTableNavigation } from "@/core/hooks/useTableNavigation";
import { useSettings } from "@/core/context/SettingsContext";
import { router, useFocusEffect, useNavigation } from "expo-router";
import { useActiveTables } from "@/core/context/ActiveTablesContext";
import { ParamApiRepository } from "@/core/repositories/parametro.repository";
import { capitalizeFirstLetter } from "@/utils/stringUtil";
import { useSafeAreaInsets } from "react-native-safe-area-context";
const variantStyles = {
  error: { bg: "bg-red-50", text: "text-red-600", iconColor: "#DC2626", iconName: "alert-circle-outline" },
  warning: { bg: "bg-amber-50", text: "text-amber-600", iconColor: "#D97706", iconName: "warning-outline" },
  info: { bg: "bg-blue-50", text: "text-blue-600", iconColor: "#2563EB", iconName: "information-circle-outline" },
} as const;

type Variant = keyof typeof variantStyles;

const ErrorMessage = ({ text, variant = "error", action }: { text: string; variant?: Variant; action?: { label: string; onPress: () => void } }) => {
  const styles = variantStyles[variant];
  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} className={`p-5 rounded-2xl shadow-lg ${styles.bg}`}>
      <View className="items-center">
        <Ionicons name={styles.iconName} size={40} color={styles.iconColor} />
        <Text className={`mt-3 text-center text-lg font-semibold ${styles.text}`}>{text}</Text>
        {action && (
          <TouchableOpacity onPress={action.onPress} className="mt-4 px-6 py-3 bg-blue-500 rounded-full">
            <Text className="text-white font-bold">{action.label}</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

interface TablesProps {
  place: string;
  qty?: number;
}

export default function Tables({ place, qty: propQty }: TablesProps) {
  const { width } = useWindowDimensions();
  const { zonas, token, isLogin } = useSettings();
  const { activeTables } = useActiveTables();
  const navigation = useNavigation();
  const isTablet = width >= 768;
  const columns = isTablet ? 9 : 3;
  const qty = propQty !== undefined ? propQty : zonas[place] ?? 0;
  const insets = useSafeAreaInsets();
  const { data: tables, isLoading, error} = useQuery({
    queryKey: ["tablesByLocation", isLogin],
    queryFn: () => ParamApiRepository.getTablesByLocation(),
    enabled: isLogin,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const { handleTablePress, isTableActive } = useTableNavigation(place);

  useFocusEffect(
    useCallback(() => {
      const formattedPlace = capitalizeFirstLetter(place)
      navigation.getParent()?.setOptions({ title: formattedPlace });
    }, [place, activeTables, navigation])
  );

  // Primero verifica si no hay token
  if (!token) {
    return (
      <View className="flex-1 justify-center items-center p-5">
        <ErrorMessage
          text="Debe iniciar sesión para ver las mesas"
          action={{ label: "Ir al Login", onPress: () => router.navigate("/components/login") }}
        />
      </View>
    );
  }

  // Luego verifica si está cargando
  if (!tables || Object.keys(tables).length === 0) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-gray-500 text-lg">Cargando mesas...</Text>
      </View>
    );
  }

  // Después el error
  if (error) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500 text-lg">{errorMessage}</Text>
      </View>
    );
  }

  // Luego verifica si no hay mesas configuradas
  if (!qty) {
    return (
      <View className="flex-1 justify-center items-center p-5">
        <ErrorMessage text={`No hay mesas configuradas para ${place}`} variant="warning" />
      </View>
    );
  }

  // Finalmente renderiza el contenido principal
  return (
    <Animated.View entering={FadeIn} className="flex-1 p-5 bg-white" style={{ justifyContent: "center",  paddingBottom: insets.bottom + 70 }}>
      <TableGrid
        tables={tables || { comedor: 0, barra: 0, express: 0, llevar: 0, terraza: 0 }}
        columns={columns}
        isActive={isTableActive}
        onTablePress={handleTablePress}
        place={place}
      />
    </Animated.View>
  );
}