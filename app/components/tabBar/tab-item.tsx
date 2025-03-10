import React, { useEffect, useRef } from "react";
import { Animated, TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

interface TabItemProps {
  route: { key: string; icon: string };
  isFocused: boolean;
  jumpTo: (key: string) => void;
  theme: { colors: { primary: string; textDark: string } };
  badgeCount: number;
}

const TabItem: React.FC<TabItemProps> = ({ route, isFocused, jumpTo, theme, badgeCount }) => {
  // Animated value inicial: 1 si está enfocado, 0 si no
  const animValue = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false, // Elevation y shadowOpacity no soportan native driver
    }).start();
  }, [isFocused]);

  // Interpolamos para obtener una elevación y escala
  const animatedStyle = {
    elevation: animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 10],
    }),
    transform: [
      {
        scale: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.1],
        }),
      },
    ],
    shadowOpacity: animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.3],
    }),
  };

  const color = isFocused ? theme.colors.primary : theme.colors.textDark;

  return (
    <TouchableOpacity style={styles.tabItem} onPress={() => jumpTo(route.key)}>
      <Animated.View style={animatedStyle}>
        <FontAwesome5 name={route.icon} size={24} color={color} />
      </Animated.View>
      {badgeCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 5,
    right: 20,
    backgroundColor: "#34D399",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
});

export default TabItem;
