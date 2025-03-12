import { useState, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { OrderDetail } from "@/types/types";
import SwipeableListItem, { SwipeableListItemRef } from "./order-swipeable-list-item";
import CustomModal from "../custom-modal";
import ProductOptionsModal from "../products/product-option-modal";
import QuantityModal from "../products/quantity-modal";

interface OrderDetailsListProps {
  orderDetails: OrderDetail[];
  onProductPress: (product: OrderDetail) => void;
  onDeleteProduct: (idOrdenDetalle: number) => void;
  onUpdateQuantity: (variables: { detailId: number; quantity: number }) => void;
}

function OrderDetailsList({
  orderDetails,
  onProductPress,
  onDeleteProduct,
  onUpdateQuantity,
}: OrderDetailsListProps) {
  const [modalVisible, setModalVisible] = useState(false); // Modal for swipe actions
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [quantityModalVisible, setQuantityModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<OrderDetail | null>(null);
  const [actionType, setActionType] = useState<"add" | "remove" | null>(null);
  const swipeableRefs = useRef<Map<string, SwipeableListItemRef>>(new Map()).current;

  const handleOpenModal = (product: OrderDetail, type: "add" | "remove", itemId: string) => {
    setSelectedProduct(product);
    setActionType(type);
    setModalVisible(true);
    const swipeableRef = swipeableRefs.get(itemId);
    if (swipeableRef) {
      swipeableRef.close(); // Close the swipeable when modal opens
    }
  };

  const handleProductPress = (product: OrderDetail) => {
    setSelectedProduct(product);
    setOptionsModalVisible(true);
    onProductPress(product);
  };

  const handleSelectAdditional = (additional: any) => {
    if (selectedProduct && actionType) {
      console.log(`Acción: ${actionType} ingrediente`, additional);
      // Add logic here to handle adding/removing ingredients if needed
      setModalVisible(false);
    }
  };

  const handleDelete = () => {
    if (selectedProduct?.idOrdenDetalle) {
      onDeleteProduct(selectedProduct.idOrdenDetalle);
      setOptionsModalVisible(false);
    }
  };

  const handleUpdateQuantity = (newQuantity: number) => {
    if (selectedProduct?.idOrdenDetalle) {
      onUpdateQuantity({ detailId: selectedProduct.idOrdenDetalle, quantity: newQuantity });
      setQuantityModalVisible(false);
    }
  };

  if (orderDetails.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No hay productos seleccionados</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {orderDetails.map((item) => {
        const itemId = item.idOrdenDetalle?.toString() || Math.random().toString();
        return (
          <SwipeableListItem
            key={itemId}
            ref={(ref) => ref && swipeableRefs.set(itemId, ref)}
            item={item}
            onPress={() => handleProductPress(item)}
            onSwipeOpen={(direction) =>
              handleOpenModal(item, direction === "left" ? "add" : "remove", itemId)
            }
          />
        );
      })}

      {/* Modal for Swipe Actions */}
      <CustomModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {actionType === "add" ? "Agregar Ingrediente" : "Quitar Ingrediente"}
          </Text>
          <ScrollView style={styles.modalScroll}>
            {selectedProduct?.adicionales?.length ? (
              selectedProduct.adicionales.map((additional) => (
                <TouchableOpacity
                  key={additional.idAdicional}
                  style={styles.modalOption}
                  onPress={() => handleSelectAdditional(additional)}
                >
                  <Text style={styles.optionText}>{additional.nombre}</Text>
                  <Text style={styles.optionPrice}>
                    {actionType === "add" ? `+$${additional.precio.toFixed(2)}` : ""}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>
                No hay ingredientes {actionType === "add" ? "disponibles" : "para quitar"}
              </Text>
            )}
          </ScrollView>
        </View>
      </CustomModal>

      {/* Modal for Product Options */}
      <ProductOptionsModal
        visible={optionsModalVisible}
        product={selectedProduct}
        onCancel={() => setOptionsModalVisible(false)}
        onDelete={handleDelete}
        onModify={() => {
          setOptionsModalVisible(false);
          setQuantityModalVisible(true);
        }}
      />

      {/* Modal for Quantity */}
      <QuantityModal
        visible={quantityModalVisible}
        product={selectedProduct}
        onCancel={() => setQuantityModalVisible(false)}
        onConfirm={handleUpdateQuantity}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 8,
  },
  emptyContainer: {
    backgroundColor: "#f3f4f6",
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 8,
  },
  emptyText: {
    color: "#6b7280",
    textAlign: "center",
    fontSize: 16,
  },
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 20,
    textAlign: "center",
  },
  modalScroll: {
    maxHeight: 400,
    marginBottom: 20,
  },
  modalOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
  },
  optionText: {
    fontSize: 16,
    color: "#374151",
    flex: 2,
  },
  optionPrice: {
    fontSize: 16,
    color: "#10b981",
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
});

export default OrderDetailsList;