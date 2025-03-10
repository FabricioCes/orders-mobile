import { useState, useCallback, useRef, useMemo, memo, useEffect } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { TabView, SceneMap } from "react-native-tab-view";
import { useNavigation } from "expo-router";

import { useActiveTables } from "@/core/context/ActiveTablesContext";
import { useSettings } from "@/core/context/SettingsContext";
import ZoneScreen from "./tab";
import { useFocusEffect } from "expo-router";
import PillTabBar from "../components/tabBar/pill-tab-bar";

const staticTabs = [
  { name: "comedor", title: "Comedor", icon: "home" },
  { name: "express", title: "Express", icon: "bolt" },
  { name: "llevar", title: "Llevar", icon: "shopping-bag" },
  { name: "barra", title: "Barra", icon: "glass-martini" },
  { name: "terraza", title: "Terraza", icon: "tree" },
];

// Función que retorna los colores para cada zona
const getZoneColors = (zone: string) => {
  switch (zone.toLowerCase()) {
    case "comedor":
      return { primary: "#4DB6AC", text: "#fff", badge: "#26A69A" };
    case "express":
      return { primary: "#E57373", text: "#fff", badge: "#F44336" };
    case "llevar":
      return { primary: "#64B5F6", text: "#fff", badge: "#42A5F5" };
    case "barra":
      return { primary: "#81C784", text: "#fff", badge: "#66BB6A" };
    case "terraza":
      return { primary: "#BA68C8", text: "#fff", badge: "#AB47BC" };
    default:
      return { primary: "#60A5FACC", text: "#fff", badge: "#34D399" };
  }
};

const THEME = {
  colors: {
    primary: "#60A5FACC",
    background: "#F3F4F6",
    textLight: "#fff",
    textDark: "#60A5FA",
  },
};

const TabLayout = memo(() => {
  const navigation = useNavigation();
  const { state, loadActiveTables } = useActiveTables();
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

  // Actualiza el header según la pestaña (zona) activa
  useEffect(() => {
    const activeZone = staticTabs[index].title;
    const zoneColors = getZoneColors(activeZone);
    navigation.setOptions({
      headerTitle: activeZone,
      headerStyle: {
        backgroundColor: zoneColors.primary,
        elevation: 4,
        shadowOpacity: 0.2,
      },
      headerTitleStyle: {
        fontWeight: "700",
        fontSize: 20,
        color: zoneColors.text,
      },
      headerTintColor: zoneColors.text,
    });
  }, [index, navigation]);

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
              <Text style={styles.errorText}>Error al cargar {tab.title}</Text>
            </View>
          );
        }
      };
      return acc;
    }, {} as Record<string, () => JSX.Element>);
  }, [tablesByZone]);

  const renderScene = SceneMap(scenes);

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: Dimensions.get("window").width }}
      renderTabBar={(props) => (
        <PillTabBar
          {...props}
          tablesByZone={tablesByZone}
          theme={THEME}
          getZoneColors={getZoneColors}
        />
      )}
      swipeEnabled={true}
      animationEnabled={true}
      lazy={true}
      lazyPreloadDistance={1}
      tabBarPosition="bottom"
    />
  );
});

const styles = StyleSheet.create({
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
