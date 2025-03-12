import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import ProductDetail from "../products/product-detail";
import { OrderDetail } from "@/types/types";

export interface SwipeableListItemRef {
  close: () => void;
}

interface SwipeableListItemProps {
  item: OrderDetail;
  onPress: () => void;
  onSwipeOpen: (direction: "left" | "right") => void;
}

const SwipeableListItem = forwardRef<
  SwipeableListItemRef,
  SwipeableListItemProps
>(({ item, onPress, onSwipeOpen }, ref) => {
  const swipeableRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    close: () => swipeableRef.current?.close(),
  }));

  return (
    <View style={styles.container}>
      <ReanimatedSwipeable
        ref={swipeableRef}
        friction={2}
        overshootFriction={8}
        leftThreshold={40}
        rightThreshold={40}
        renderLeftActions={() => (
          <View style={styles.leftAction}>
            <Text style={styles.actionText}>Agregar Ingrediente</Text>
          </View>
        )}
        renderRightActions={() => (
          <View style={styles.rightAction}>
            <Text style={styles.actionText}>Quitar Ingrediente</Text>
          </View>
        )}
        onSwipeableWillOpen={(direction) => onSwipeOpen(direction)}
        containerStyle={styles.swipeableContainer}
        childrenContainerStyle={styles.childrenContainer}
      >
        <TouchableOpacity
          onPress={onPress}
          style={styles.productContainer}
          activeOpacity={1}
        >
          <ProductDetail product={item} quantity={item.cantidad} />
        </TouchableOpacity>
      </ReanimatedSwipeable>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    backgroundColor: "transparent",
  },
  swipeableContainer: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    overflow: "hidden",
  },
  childrenContainer: {
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f9fafb",
  },
  leftAction: {
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 20,
    flex: 1,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  rightAction: {
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingLeft: 20,
    flex: 1,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  actionText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
  },
  productContainer: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    paddingHorizontal: 16,
  },
});

export default SwipeableListItem;
