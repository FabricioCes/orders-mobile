// ProductDetail.tsx
import React from "react";
import { View, Text } from "react-native";
import type { OrderDetail } from "@/types/types";

type ProductDetailProps = {
  product: OrderDetail;
  showDetails?: boolean;
  quantity: number;
  addToOrder: () => void;
  onQuantityChange: (newQty: number) => void;
};

const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  quantity,
  showDetails,
  onQuantityChange,
  addToOrder,
}) => (
  <View style={{ padding: 12, backgroundColor: "#f9fafb", borderRadius: 8, marginBottom: 8 }}>
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
      <View style={{ flex: 1, marginRight: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: "500", color: "#1f2937" }}>
          {product.nombreProducto}
        </Text>
        <Text style={{ color: "#6b7280", marginTop: 4 }}>
          ₡{product.costoUnitario.toFixed(2)}
        </Text>
      </View>
      <View>
        <Text style={{ fontSize: 16, fontWeight: "500", color: "#374151", minWidth: 24, textAlign: "center" }}>
          {quantity}
        </Text>
      </View>
    </View>
  </View>
);

export default ProductDetail;
