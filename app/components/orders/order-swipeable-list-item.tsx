import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import ReanimatedSwipeable, {
  SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import ProductDetail from '../products/product-detail';
import { OrderDetail } from '@/types/types';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

export interface SwipeableListItemRef {
  close: () => void;
}

interface SwipeableListItemProps {
  item: OrderDetail;
  onPress: () => void;
  onSwipeOpen: (direction: 'left' | 'right') => void;
}

const SwipeableListItem = forwardRef<SwipeableListItemRef, SwipeableListItemProps>(
  ({ item, onPress, onSwipeOpen }, ref) => {
    const swipeableRef = useRef<SwipeableMethods>(null);
    const isPressed = useSharedValue(false);

    // Exponemos el método close para que el padre pueda llamarlo
    useImperativeHandle(ref, () => ({
      close: () => {
        swipeableRef.current?.close();
      },
    }));

    const animatedStyle = useAnimatedStyle(() => {
      return {
        opacity: isPressed.value ? 0.7 : 1, // Ejemplo de animación al presionar
      };
    }, [isPressed]);

    return (
      <Animated.View style={[styles.container, animatedStyle]}>
        <ReanimatedSwipeable
          ref={swipeableRef}
          friction={2}
          overshootFriction={8}
          shouldCancelWhenOutside={true}
          simultaneousHandlers={[]}
          containerStyle={styles.swipeableContainer}
          leftThreshold={40}
          rightThreshold={40}
          renderLeftActions={() => (
            <View style={styles.leftAction}>
              <Text style={styles.actionText}>Agregar adicional</Text>
            </View>
          )}
          renderRightActions={() => (
            <View style={styles.rightAction}>
              <Text style={styles.actionText}>Quitar adicional</Text>
            </View>
          )}
          onSwipeableWillOpen={(direction) => {
            onSwipeOpen(direction);
          }}
          onSwipeableClose={() => {
            isPressed.value = false;
          }}
        >
          <TouchableOpacity
            onPress={onPress}
            style={styles.productContainer}
            activeOpacity={0.9}
          >
            <ProductDetail product={item} quantity={item.cantidad} />
          </TouchableOpacity>
        </ReanimatedSwipeable>
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  swipeableContainer: {
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
  leftAction: {
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 20,
    height: '90%',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  rightAction: {
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 20,
    height: '90%',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  actionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  productContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
});

export default SwipeableListItem;