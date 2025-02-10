// ProductDetail.tsx
import React from "react";
import { View, Text } from "react-native";
import type { OrderDetail } from "@/types/types";
import { Product } from "@/types/productTypes";

interface ProductDetailProps {
  product: OrderDetail | Product;
  quantity?: number;
  showActions?: boolean;
  addToOrder?: () => void;
  onQuantityChange?: (quantity: number) => void;
}

export default function ProductDetail({
  product,
  quantity = 1,
  showActions = true,
  addToOrder,
  onQuantityChange,
}: ProductDetailProps) { return (
  <View style={{ padding: 12, backgroundColor: "#f9fafb", borderRadius: 8, marginBottom: 8 }}>
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
      <View style={{ flex: 1, marginRight: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: "500", color: "#1f2937" }}>
          {"nombre" in product ? product.nombre : product.nombreProducto}
        </Text>
        <Text style={{ color: "#6b7280", marginTop: 4 }}>
          {"costoUnitario" in product ? `₡${product.costoUnitario.toFixed(2)}` : `₡${product.costo.toFixed(2)}`}
        </Text>
      </View>
      <View>
        <Text style={{ fontSize: 16, fontWeight: "500", color: "#374151", minWidth: 24, textAlign: "center" }}>
          {quantity}
        </Text>
      </View>
    </View>
  </View>
)};