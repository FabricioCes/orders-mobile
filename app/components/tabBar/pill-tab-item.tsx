import React from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

interface Route {
  key: string;
  title: string;
  icon: string;
}

interface PillTabItemProps {
  route: Route;
  isFocused: boolean;
  jumpTo: (key: string) => void;
  color: string;
  badgeCount: number;
  badgeColor: string;
}

const PillTabItem = ({
  route,
  isFocused,
  jumpTo,
  color,
  badgeCount,
  badgeColor,
}: PillTabItemProps) => {
  return (
    <TouchableOpacity
      style={styles.tabItem}
      onPress={() => jumpTo(route.key)}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <FontAwesome5 name={route.icon} size={24} color={color} />
        {badgeCount > 0 && (
          <View style={[styles.badge, { backgroundColor: badgeColor }]}>
            <Text style={styles.badgeText}>{badgeCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default PillTabItem;

const styles = StyleSheet.create({
  tabItem: {
    padding: 10,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: -10,
    right: -10,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
    paddingHorizontal: 3,
  },
});
