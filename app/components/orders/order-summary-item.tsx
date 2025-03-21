import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  View,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  StyleSheet,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type OrderSummaryItemProps = {
  total: number;
  itemsCount: number;
  onSave: () => void;
  isActive: boolean;
  isSaving?: boolean;
  expanded: boolean;
  onToggle: () => void;
  hasChanges: boolean;
};

const OrderSummaryItem: React.FC<OrderSummaryItemProps> = ({
  total,
  itemsCount,
  onSave,
  isActive,
  isSaving = false,
  expanded,
  onToggle,
  hasChanges,
}) => {
  const arrowRotation = useRef(new Animated.Value(expanded ? 1 : 0)).current;
  const contentHeight = useRef(new Animated.Value(expanded ? 60 : 0)).current; // Ajustado desde el inicio
  const contentOpacity = useRef(new Animated.Value(expanded ? 1 : 0)).current;
  const buttonPosition = useRef(new Animated.Value(expanded ? 0 : -48)).current; // Ajustado desde el inicio

  useEffect(() => {
    Animated.parallel([
      Animated.timing(arrowRotation, {
        toValue: expanded ? 1 : 0,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.timing(contentHeight, {
        toValue: expanded ? 60 : 0, // Altura ajustada al contenido real
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(contentOpacity, {
        toValue: expanded ? 1 : 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(buttonPosition, {
        toValue: expanded ? 0 : -48, // Posición ajustada para el botón
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start();
  }, [expanded]);

  const rotateInterpolate = arrowRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const handleToggle = () => {
    LayoutAnimation.configureNext({
      duration: 300,
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
    });
    onToggle();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Resumen de la Orden</Text>
        <TouchableOpacity onPress={handleToggle}>
          <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
            <FontAwesome name="chevron-up" size={24} color="#1e293b" />
          </Animated.View>
        </TouchableOpacity>
      </View>
      <View style={styles.headerDetails}>
        <Text style={styles.itemsCount}>
          {itemsCount} artículo{itemsCount !== 1 ? "s" : ""}
        </Text>
        {!expanded && (
          <Text style={styles.headerTotal}>₡{total.toFixed(2)}</Text>
        )}
      </View>

      <Animated.View
        style={[
          styles.expandedContent,
          {
            height: contentHeight,
            opacity: contentOpacity,
            overflow: "hidden",
          },
        ]}
      >
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>₡{total.toFixed(2)}</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.saveButtonWrapper,
          {
            transform: [{ translateY: buttonPosition }],
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!hasChanges || isSaving) && styles.saveButtonDisabled,
            !expanded && styles.saveButtonMinimized,
          ]}
          onPress={onSave}
          disabled={!hasChanges || isSaving}
        >
          {expanded && (
            <Text style={styles.buttonText}>
              {isSaving
                ? "Guardando..."
                : isActive
                ? "Actualizar Orden"
                : "Confirmar Orden"}
            </Text>
          )}
          <FontAwesome name="save" size={expanded ? 20 : 24} color="white" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    margin: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    position: "relative",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  headerDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  itemsCount: {
    color: "#64748b",
    fontSize: 14,
  },
  headerTotal: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563eb",
  },
  expandedContent: {
    marginTop: 16,
  },
  detailsContainer: {
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
    paddingTop: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 0,
  },
  totalLabel: {
    color: "#475569",
    fontSize: 16,
    fontWeight: "600",
  },
  totalValue: {
    color: "#2563eb",
    fontSize: 18,
    fontWeight: "700",
  },
  saveButtonWrapper: {
    marginTop: 16,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  saveButtonDisabled: {
    backgroundColor: "#93c5fd",
  },
  saveButtonMinimized: {
    position: "absolute",
    top: -90,
    right: 60,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 50,
    marginTop: 0,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
});

export default OrderSummaryItem;