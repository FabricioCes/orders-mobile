import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, View, Text, TouchableOpacity, LayoutAnimation, Platform, UIManager,StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";

// Habilitar LayoutAnimation para Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type OrderSummaryItemProps = {
  total: number;
  subtotal: number;
  tax: number;
  service: number;
  taxIncluded: boolean;
  serviceIncluded: boolean;
  itemsCount: number;
  onSave: () => void;
  isActive: boolean;
  isSaving?: boolean;
  expanded: boolean;
  onToggle: () => void;
};
const OrderSummaryItem: React.FC<OrderSummaryItemProps> = ({
  total,
  subtotal,
  tax,
  service,
  taxIncluded,
  serviceIncluded,
  itemsCount,
  onSave,
  isActive,
  isSaving = false,
  expanded,
  onToggle,
}) => {
  const arrowRotation = useRef(new Animated.Value(expanded ? 1 : 0)).current;

  const toggleExpansion = () => {
    LayoutAnimation.configureNext({
      duration: 500, // Duración en ms
      update: {
        type: LayoutAnimation.Types.spring, // Tipo de animación
        property: LayoutAnimation.Properties.opacity, // Propiedad a animar
        springDamping: 0.7, // Elasticidad de la animación
      },
    });
    onToggle();
  };

  useEffect(() => {
    Animated.timing(arrowRotation, {
      toValue: expanded ? 1 : 0,
      duration: 300,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [expanded]);

  const rotateInterpolate = arrowRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <View
      style={{
        backgroundColor: "white",
        padding: 16,
        borderTopWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        marginBottom: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 18, fontWeight: "600" }}>Resumen de la Orden</Text>
        <TouchableOpacity onPress={toggleExpansion}>
          <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
            <AntDesign name="up" size={24} color="black" />
          </Animated.View>
        </TouchableOpacity>
      </View>
      <View style={styles.headerDetails}>
          <Text style={styles.itemsCount}>
            {itemsCount} artículo{itemsCount !== 1 ? 's' : ''}
          </Text>
          {!expanded && (
            <Text style={styles.headerTotal}>₡{total.toFixed(2)}</Text>
          )}
        </View>

      {/* Contenido que se expande/contrae */}
      {expanded && (
        <View style={{ marginTop: 16 }}>
          <View style={{ borderTopWidth: 1, borderColor: "#ccc", paddingTop: 16 }}>
            {/* Subtotal */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Subtotal:</Text>
              <Text style={styles.detailValue}>₡{subtotal.toFixed(2)}</Text>
            </View>

            {/* Impuesto */}
            {taxIncluded && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Impuesto:</Text>
                <Text style={styles.detailValue}>
                  ₡{(tax).toFixed(2)}
                </Text>
              </View>
            )}

            {/* Servicio */}
            {serviceIncluded && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Servicio:</Text>
                <Text style={styles.detailValue}>
                  ₡{(service).toFixed(2)}
                </Text>
              </View>
            )}

            {/* Total */}
            <View style={styles.detailRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>₡{total.toFixed(2)}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={{
              marginTop: 16,
              padding: 16,
              borderRadius: 8,
              backgroundColor: isSaving ? "#3b82f6" : "#2563eb",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={onSave}
            disabled={isSaving}
          >
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 18, marginRight: 8 }}>
              {isSaving ? "Guardando..." : isActive ? "Actualizar Orden" : "Confirmar Orden"}
            </Text>
            {!isSaving && <AntDesign name="checkcircle" size={20} color="white" />}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
const styles = StyleSheet.create({

  headerDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  itemsCount: {
    color: "#888",
    fontSize: 14,
  },
  headerTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007bff',
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8
  },
  detailLabel: {
    color: "#666",
    fontSize: 14
  },
  detailValue: {
    fontWeight: "500",
    fontSize: 14
  },
  totalLabel: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600"
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007bff"
  }

});
export default OrderSummaryItem;