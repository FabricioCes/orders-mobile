import React from "react";
import { Pressable, Text } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import Animated, { ZoomIn, ZoomOut } from "react-native-reanimated";

type TableItemProps = {
  tableNumber: number;
  isActive: boolean;
  onPress: (tableNumber: number) => void;
  testID?: string;
};

const TableItem = ({
  tableNumber,
  isActive,
  onPress,
  testID,
}: TableItemProps) => {
  // Asegurar colores hexadecimales explícitos
  const getStyles = () => {
    const backgroundColor = isActive ? "#34D399" : "#60A5FA"; // Verde y azul sólidos
    return {
      container: {
        backgroundColor,
        borderRadius: 8,
        width: 96, // 24 * 4 = 96
        height: 96,
        margin: 8,
        justifyContent: "center" as "center",
        alignItems: "center" as const,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
      },
      text: {
        color: "white",
        marginTop: 8,
        fontWeight: "600",
        fontSize: 16,
      },
    };
  };

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
        accessibilityLabel={`Mesa ${tableNumber} ${
          isActive ? "Activa" : "Disponible"
        }`}
      >
        <FontAwesome5
          name={isActive ? "check-circle" : "chair"}
          color="white"
          size={24}
        />
        <Text style={styles.text}>Mesa {tableNumber}</Text>
      </Pressable>
    </Animated.View>
  );
};

export default React.memo(TableItem);
