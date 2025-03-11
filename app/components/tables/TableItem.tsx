import React from "react";
import { Pressable, Text } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import Animated, { ZoomIn, ZoomOut } from "react-native-reanimated";
import { useActiveTables } from "@/core/context/ActiveTablesContext";

type TableItemProps = {
  tableNumber: number;
  isActive: boolean;
  onPress: (tableNumber: number) => void;
  testID?: string;
  place: string;
};

const TableItem = ({
  tableNumber,
  isActive,
  onPress,
  testID,
  place,
}: TableItemProps) => {
  const { state } = useActiveTables();

  const clientLoaded = state.activeTables.some((table) => {
    const backendZone = table.zona?.toLowerCase().replace(/\s/g, "");
    const currentPlace = place.toLowerCase().replace(/\s/g, "");

    return (
      backendZone === currentPlace &&
      table.numeroMesa === tableNumber &&
      table.nombreCliente
    );
  });

  const getStyles = () => {
    let backgroundColor = "#60A5FA";
    if (isActive) backgroundColor = "#34D399";
    if (clientLoaded) backgroundColor = "#BA68C8";

    return {
      container: {
        backgroundColor,
        borderRadius: 8,
        width: 96,
        height: 96,
        margin: 8,
        justifyContent: "center" as const,
        alignItems: "center" as const,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
      },
      text: {
        color: "white",
        marginTop: 4,
        fontWeight: "600",
        fontSize: 14,
      },
      clientText: {
        color: "white",
        fontSize: 12,
        marginTop: 2,
        fontStyle: "italic",
      },
    };
  };

  const clientName = state.activeTables.find(
    (table) =>
      table.zona?.trim().toLowerCase() === place.trim().toLowerCase() &&
      table.numeroMesa === tableNumber
  )?.nombreCliente;

  const styles = getStyles();

  return (
    <Animated.View
      entering={ZoomIn.duration(300)}
      exiting={ZoomOut.duration(200)}
    >
      <Pressable
        testID={testID}
        onPress={() => onPress(tableNumber)}
        style={styles.container}
        accessible
        accessibilityLabel={`Mesa ${tableNumber} (${place}) - ${
          clientLoaded
            ? `Cliente: ${clientName}`
            : isActive
            ? "Activa"
            : "Disponible"
        }`}
      >
        <FontAwesome5
          name={clientLoaded ? "user" : isActive ? "check-circle" : "chair"}
          color="white"
          size={24}
        />
        <Text style={styles.text}>Mesa {tableNumber}</Text>
        {clientLoaded && (
          <Text style={styles.clientText} numberOfLines={1}>
            {clientName}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
};

export default React.memo(TableItem);
