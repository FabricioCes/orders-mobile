import { useState, useCallback, useRef, useMemo, memo } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { FontAwesome5 } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useColorScheme } from "react-native";
import { useActiveTables } from "@/core/context/ActiveTablesContext";
import { useSettings } from "@/core/context/SettingsContext";
import ZoneScreen from "./tab";

const staticTabs = [
  { name: "comedor", title: "Comedor", icon: "home" },
  { name: "express", title: "Express", icon: "bolt" },
  { name: "llevar", title: "Llevar", icon: "shopping-bag" },
  { name: "barra", title: "Barra", icon: "glass-martini" },
  { name: "terraza", title: "Terraza", icon: "tree" },
];

const THEME = {
  colors: {
    primary: "#60A5FACC",
    background: "#F3F4F6",
    textLight: "#fff",
    textDark: "#60A5FA",
  },
  headers: {
    default: {
      headerStyle: {
        backgroundColor: "#60A5FACC",
        elevation: 2,
        shadowOpacity: 0.1,
      },
      headerTitleStyle: {
        fontWeight: "700",
        fontSize: 18,
      },
      headerTintColor: "#fff",
    },
  },
};

const TabLayout = memo(() => {
  const { state, loadActiveTables } = useActiveTables();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const lastLoaded = useRef<number | null>(null);
  const { isLogin } = useSettings();
  const [index, setIndex] = useState(0);
  const [routes] = useState(
    staticTabs.map((tab) => ({
      key: tab.name,
      title: tab.title,
      icon: tab.icon,
    }))
  );

  const activeTables = state.activeTables || [];

  const tablesByZone = useMemo(() => {
    if (!isLogin || !activeTables.length) return {};

    return activeTables.reduce((acc, table) => {
      const zona = table.zona?.trim().toLowerCase() || "sin-zona";
      acc[zona] = (acc[zona] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [activeTables, isLogin]);

  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      if (!lastLoaded.current || now - lastLoaded.current > 60000) {
        loadActiveTables();
        lastLoaded.current = now;
      }
    }, [loadActiveTables])
  );

  const scenes = useMemo(() => {
    return staticTabs.reduce((acc, tab) => {
      acc[tab.name] = () => {
        try {
          return (
            <ZoneScreen
              place={tab.title}
              qty={tablesByZone[tab.title.toLowerCase()] || 0}
            />
          );
        } catch (error) {
          console.error(`Error rendering ${tab.title}:`, error);
          return (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                Error al cargar {tab.title}
              </Text>
            </View>
          );
        }
      };
      return acc;
    }, {} as Record<string, () => JSX.Element>);
  }, [tablesByZone]);

  const renderScene = SceneMap(scenes);

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: THEME.colors.primary }}
      style={{
        backgroundColor: THEME.colors.background,
        borderTopWidth: 1,
        borderTopColor: "#E2E8F0",
        height: 60,
      }}
      labelStyle={{
        fontSize: 12,
        fontFamily: "Inter-SemiBold",
        paddingBottom: 4,
        color: THEME.colors.textDark,
      }}
      activeColor={THEME.colors.primary}
      inactiveColor={THEME.colors.textDark}
      renderIcon={({ route, _focused, color }: { route: any; _focused: boolean; color: string }) => (
        <FontAwesome5 name={route.icon} size={24} color={color} />
      )}
      renderBadge={({ route }: { route: { title: string } }) => {
        const activeCount = tablesByZone[route.title.toLowerCase()] || 0;
        return activeCount > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{activeCount}</Text>
          </View>
        ) : null;
      }}
    />
  );

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: Dimensions.get("window").width }}
      renderTabBar={renderTabBar}
      swipeEnabled={true}
      animationEnabled={true}
      lazy={true}
      lazyPreloadDistance={1}
    />
  );
});

const styles = StyleSheet.create({
  badge: {
    backgroundColor: "#34D399",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  errorText: {
    color: "#dc2626",
    fontSize: 16,
  },
});

export default TabLayout;