import { Tabs, useFocusEffect } from "expo-router";
import { FontAwesome5 } from '@expo/vector-icons';
import { useColorScheme } from "react-native";
import { useMemo, memo, useCallback, useRef } from "react";
import { useActiveTables } from "@/core/context/ActiveTablesContext";
import { useSettings } from "@/core/context/SettingsContext";

const staticTabs = [
  { name: 'comedor', title: 'Comedor', icon: 'home' },
  { name: 'barra', title: 'Barra', icon: 'glass-martini' },
  { name: 'express', title: 'Express', icon: 'bolt' },
  { name: 'llevar', title: 'Llevar', icon: 'shopping-bag' },
  { name: 'terraza', title: 'Terraza', icon: 'tree' },
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

  let activeTables = state.activeTables;

  const tablesByZone = useMemo(() => {
    if (!isLogin) return {}; // Reiniciar cuando el usuario no está logueado

    return activeTables?.reduce((acc, table) => {
      const zona = table.zona?.trim().toLowerCase() || "sin-zona";
      acc[zona] = (acc[zona] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [activeTables, isLogin]);

  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      if (!lastLoaded.current || now - lastLoaded.current > 60000) {
        // Recargar cada 60 segundos
        loadActiveTables();
        lastLoaded.current = now;
      }
    }, [loadActiveTables])
  );

  const renderedTabs = useMemo(
    () =>
      staticTabs.map((tab) => {
        const zoneKey = tab.title.toLowerCase();
        const activeCount = tablesByZone?.[zoneKey] || 0;

        return (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            initialParams={{
              qty: activeCount,
              place: tab.title,
            }}
            options={{
              title: tab.title,
              tabBarIcon: ({ color }: { color: string }) => (
                <FontAwesome5 name={tab.icon} size={24} color={color} />
              ),
              tabBarBadge: activeCount > 0 ? activeCount : undefined,
              tabBarBadgeStyle: {
                backgroundColor: '#34D399',
                color: "white",
                fontSize: 10,
                fontWeight: "bold",
                marginLeft: 5,
              },
              headerStyle: THEME.headers.default.headerStyle,
              headerTitleStyle: THEME.headers.default.headerTitleStyle,
              headerTintColor: THEME.headers.default.headerTintColor,
            }}
          />
        );
      }),
    [tablesByZone, isLogin]
  );

  return (
    <Tabs
    screenOptions={{
      tabBarActiveTintColor: '#2563EB',
      tabBarInactiveTintColor: '#64748B',
      tabBarStyle: {
        backgroundColor: '#F8FAFC',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        height: 60,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontFamily: 'Inter-SemiBold',
        paddingBottom: 4,
      },
      headerShown: false,
    }}
  >
      {renderedTabs}
    </Tabs>
  );
});

export default TabLayout;
