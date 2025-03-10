import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationState } from "react-native-tab-view";
import PillTabItem from "./pill-tab-item";

interface Route {
  key: string;
  title: string;
  icon: string;
}

interface CustomTabBarProps {
  navigationState: NavigationState<Route>;
  jumpTo: (key: string) => void;
  tablesByZone: { [key: string]: number };
  theme: {
    colors: {
      background: string;
      primary: string;
      textDark: string;
    };
  };
  getZoneColors: (zone: string) => { primary: string; text: string; badge: string };
}

const PillTabBar = ({
  navigationState,
  jumpTo,
  tablesByZone,
  theme,
  getZoneColors,
}: CustomTabBarProps) => {
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={[styles.tabBar, { backgroundColor: theme.colors.background }]}>
        {navigationState.routes.map((route, index) => {
          const isFocused = navigationState.index === index;
          const zoneColors = getZoneColors(route.title);
          // Si está enfocado, se utiliza el color primary de la zona; de lo contrario, gris.
          const iconColor = isFocused ? zoneColors.primary : "#9CA3AF";
          const badgeCount = tablesByZone[route.title.toLowerCase()] || 0;
          return (
            <PillTabItem
              key={route.key}
              route={route}
              isFocused={isFocused}
              jumpTo={jumpTo}
              color={iconColor}
              badgeCount={badgeCount}
              badgeColor={zoneColors.badge}
            />
          );
        })}
      </View>
    </SafeAreaView>
  );
};

export default PillTabBar;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    alignItems: "center",
  },
  tabBar: {
    flexDirection: "row",
    width: Dimensions.get("window").width * 0.9,
    borderRadius: 50,
    padding: 8,
    justifyContent: "space-around",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 16,
  },
});
