import React from "react";
import { Text, View, StyleSheet } from "react-native";
import Tables from "@/app/screens/tables-screen";
import { useSettings } from "@/core/context/SettingsContext";

interface ZoneScreenProps {
  place?: string;
  qty?: number;
}

export default function ZoneScreen({ place = "comedor", qty = 0 }: ZoneScreenProps) {
  const { zonas } = useSettings();

  // Validar place y qty
  const safePlace = place || "comedor";
  const safeQty = qty >= 0 ? qty : zonas[safePlace.toLowerCase()] || 0;

  try {
    return <Tables qty={safeQty} place={safePlace} />;
  } catch (error) {
    console.error(`Error in ZoneScreen for ${safePlace}:`, error);
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Error al cargar {safePlace}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  errorText: {
    color: "#dc2626",
    fontSize: 16,
  },
});