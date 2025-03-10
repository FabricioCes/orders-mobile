import { useCallback, useEffect, useState } from "react";
import {
  View,
  useWindowDimensions,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import TableGrid from "../components/tables/TableGrid";
import { useTableNavigation } from "@/core/hooks/useTableNavigation";
import { useSettings } from "@/core/context/SettingsContext";
import { router, useFocusEffect, useNavigation } from "expo-router";
import { useActiveTables } from "@/core/context/ActiveTablesContext";
import { ParamApiRepository } from "@/core/repositories/parametro.repository";
import { TableCount } from "@/types/tableTypes";
const variantStyles = {
  error: {
    bg: "bg-red-50",
    text: "text-red-600",
    iconColor: "#DC2626",
    iconName: "alert-circle-outline",
  },
  warning: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    iconColor: "#D97706",
    iconName: "warning-outline",
  },
  info: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    iconColor: "#2563EB",
    iconName: "information-circle-outline",
  },
};

type Variant = "error" | "warning" | "info";

const ErrorMessage = ({
  text,
  variant = "error",
  action,
}: {
  text: string;
  variant?: Variant;
  action?: { label: string; onPress: () => void };
}) => {
  const styles = variantStyles[variant];

  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      className={`p-5 rounded-2xl shadow-lg ${styles.bg}`}
    >
      <View className="items-center">
        <Ionicons
          name={styles.iconName as keyof typeof Ionicons.glyphMap}
          size={40}
          color={styles.iconColor}
        />
        <Text
          className={`mt-3 text-center text-lg font-semibold ${styles.text}`}
        >
          {text}
        </Text>
        {action && (
          <TouchableOpacity
            onPress={action.onPress}
            className="mt-4 px-6 py-3 bg-blue-500 rounded-full"
          >
            <Text className="text-white font-bold">{action.label}</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const LoadingState = () => (
  <Animated.View
    entering={FadeIn}
    className="flex-1 justify-center items-center"
  >
    <ActivityIndicator size="large" color="#2563EB" />
    <Text className="mt-4 text-gray-500">
      Cargando configuración de mesas...
    </Text>
  </Animated.View>
);

interface TablesProps {
  place: string;
  qty?: number;
}

export default function Tables({ place, qty: propQty }: TablesProps) {
  const { width } = useWindowDimensions();
  const { zonas, token } = useSettings();
  const { loadActiveTables, state } = useActiveTables();
  const isTablet = width >= 768;
  const columns = isTablet ? 9 : 3;
  const qty = propQty || zonas[place] || 0;
  const { handleTablePress, isTableActive } = useTableNavigation(place);
  const navigation = useNavigation();
  const [tables, setTables] = useState<TableCount | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTables = async () => {
      try {
        const fetchedTables = await ParamApiRepository.getTablesByLocation();
        console.log(fetchedTables)
        setTables(fetchedTables);
        setError(null);
      } catch (err) {
        setError("Error al cargar las mesas");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadTables();
  }, []);
  useFocusEffect(
    useCallback(() => {
      const formattedPlace =
        place.charAt(0).toUpperCase() + place.slice(1).toLowerCase();
      navigation.getParent()?.setOptions({ title: formattedPlace });

      if (!state.activeTables.length && !state.loading) {
        loadActiveTables();
      }
    }, [place, state.activeTables, state.loading, loadActiveTables])
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-gray-500 text-lg">Cargando mesas...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500 text-lg">{error}</Text>
      </View>
    );
  }

  if (!qty || !token) {
    return (
      <View className="flex-1 justify-center items-center p-5">
        {!token ? (
          <ErrorMessage
            text="Debe iniciar sesión para ver las mesas"
            action={{
              label: "Ir al Login",
              onPress: () => router.navigate("/components/login"),
            }}
          />
        ) : (
          <ErrorMessage
            text={`No hay mesas configuradas para ${place}`}
            variant="warning"
          />
        )}
      </View>
    );
  }

  return (
    <Animated.View
      entering={FadeIn}
      className="flex-1 p-5 bg-white"
      style={{ justifyContent: "center" }} // Centrado vertical
    >
      <TableGrid
        tables={tables || {} as TableCount}
        columns={columns}
        isActive={isTableActive}
        onTablePress={handleTablePress}
        place={place}
      />
    </Animated.View>
  );
}
