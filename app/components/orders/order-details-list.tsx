import React, { useState, useRef } from "react";
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
  onUpdateQuantity: (idProducto: number, newQuantity: number) => void;
}

export default function OrderDetailsList({
  orderDetails,
  onProductPress,
  onDeleteProduct,
  onUpdateQuantity,
}: OrderDetailsListProps) {
  const [modalVisible, setModalVisible] = useState(false); // Modal de adicionales
  const [optionsModalVisible, setOptionsModalVisible] = useState(false); // Modal de opciones
  const [quantityModalVisible, setQuantityModalVisible] = useState(false); // Modal de cantidad
  const [selectedProduct, setSelectedProduct] = useState<OrderDetail | null>(null);
  const [actionType, setActionType] = useState<"add" | "remove" | null>(null);
  const swipeableRefs = useRef<Map<string, SwipeableListItemRef>>(new Map()).current;

  // Abrir modal de adicionales al deslizar
  const handleOpenModal = (
    product: OrderDetail,
    type: "add" | "remove",
    itemId: string
  ) => {
    setSelectedProduct(product);
    setActionType(type);
    setModalVisible(true);
    const swipeableRef = swipeableRefs.get(itemId);
    if (swipeableRef) {
      swipeableRef.close();
    }
  };

  // Abrir modal de opciones al presionar un producto
  const handleProductPress = (product: OrderDetail) => {
    setSelectedProduct(product);
    setOptionsModalVisible(true);
    onProductPress(product); // Llamamos al callback original si es necesario
  };

  // Manejar selección de adicionales
  const handleSelectAdditional = (additional: any) => {
    if (selectedProduct && actionType) {
      console.log(`Acción: ${actionType} adicional`, additional);
      setModalVisible(false);
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
    <>
      <View style={styles.flexContainer}>
        {orderDetails.map((item) => {
          const itemId =
            item.idOrdenDetalle?.toString() || Math.random().toString();
          return (
            <SwipeableListItem
              key={itemId}
              ref={(ref) => {
                if (ref) {
                  swipeableRefs.set(itemId, ref);
                } else {
                  swipeableRefs.delete(itemId);
                }
              }}
              item={item}
              onPress={() => handleProductPress(item)}
              onSwipeOpen={(direction) => {
                handleOpenModal(
                  item,
                  direction === "left" ? "add" : "remove",
                  itemId
                );
              }}
            />
          );
        })}
      </View>

      {/* Modal de Adicionales */}
      <CustomModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {actionType === "add" ? "Agregar adicional" : "Quitar adicional"}
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
                    +${additional.precio.toFixed(2)}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>
                No hay adicionales disponibles
              </Text>
            )}
          </ScrollView>
        </View>
      </CustomModal>

      {/* Modal de Opciones del Producto */}
      <ProductOptionsModal
        visible={optionsModalVisible}
        product={selectedProduct as OrderDetail}
        onCancel={() => setOptionsModalVisible(false)}
        onDelete={() => {
          if (selectedProduct && selectedProduct.idOrdenDetalle) {
            onDeleteProduct(selectedProduct.idOrdenDetalle);
            setOptionsModalVisible(false);
          }
        }}
        onModify={() => {
          setOptionsModalVisible(false);
          setQuantityModalVisible(true);
        }}
      />

      {/* Modal de Cantidad */}
      <QuantityModal
        visible={quantityModalVisible}
        product={selectedProduct as OrderDetail}
        onCancel={() => setQuantityModalVisible(false)}
        onConfirm={(newQuantity) => {
          if (selectedProduct) {
            onUpdateQuantity(selectedProduct.idProducto, newQuantity);
            setQuantityModalVisible(false);
          }
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
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