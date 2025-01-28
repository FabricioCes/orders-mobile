import React from "react";
import {
  View,
  useWindowDimensions,
  ActivityIndicator,
  Text,
} from "react-native";
import TableGrid from "./tables/TableGrid";
import { useTableNavigation } from "@/hooks/useTableNavigation";
import { useSettings } from "@/context/SettingsContext";

type TablesProps = {
  place: string;
  qty?: number;
};

export default function Tables({ place, qty: propQty }: TablesProps) {
  const { width } = useWindowDimensions();
  const { zonas, loadingZonas } = useSettings();

  // Obtener la cantidad dinámicamente del contexto
  const qty = propQty || zonas[place] || 0;
  const isTablet = width >= 768;
  const columns = isTablet ? 9 : 3;
  const tables = Array.from({ length: qty }, (_, i) => i + 1);

  const { handleTablePress, isTableActive } = useTableNavigation(place);

  if (loadingZonas) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#60A5FA" />
        <Text className="mt-2 text-gray-600">Cargando mesas...</Text>
      </View>
    );
  }

  if (!qty) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg text-red-500">
          No hay mesas configuradas para {place}
        </Text>
      </View>
    );
  }

  return (
    <View className="container p-5 flex-row items-center justify-center">
      <TableGrid
        tables={tables}
        columns={columns}
        isActive={isTableActive}
        onTablePress={handleTablePress}
        place={place}
      />
    </View>
  );
}
