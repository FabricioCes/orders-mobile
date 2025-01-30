import { Tabs } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useColorScheme } from "react-native";
import { useTable } from "@/context/TablesContext";
import { useMemo, memo } from "react";

const staticTabs = [
  { name: "comedor", title: "Comedor", iconName: "home" },
  { name: "barra", title: "Barra", iconName: "glass" },
  { name: "express", title: "Express", iconName: "bolt" },
  { name: "llevar", title: "Llevar", iconName: "shopping-bag" },
  { name: "terraza", title: "Terraza", iconName: "tree" },
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
  const { activeTables } = useTable();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const tablesByZone = useMemo(() => {
    return activeTables.reduce((acc, table) => {
      const zona = table.zona?.toLowerCase() || "sin-zona";
      acc[zona] = (acc[zona] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [activeTables]);

  const renderedTabs = useMemo(
    () =>
      staticTabs.map((tab) => {
        const zoneKey = tab.title.toLowerCase();
        const activeCount = tablesByZone[zoneKey] || 0;

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
                <FontAwesome
                  size={28}
                  name={tab.iconName as keyof typeof FontAwesome.glyphMap}
                  color={color}
                />
              ),
              tabBarBadge: activeCount > 0 ? activeCount : undefined,
              tabBarBadgeStyle: {
                backgroundColor: "#34D399CC",
                color: "white",
                fontSize: 8,
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
    [tablesByZone]
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: THEME.colors.primary,
        tabBarInactiveTintColor: isDarkMode ? "#888" : "#333",
        headerStyle: THEME.headers.default.headerStyle,
        headerTintColor: !isDarkMode ? "#fff" : "#0s00",
        lazy: true,
      }}
    >
      {renderedTabs}

      <Tabs.Screen
        name="settings"
        options={{
          title: "Conf",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="cog" size={24} color="#888" />
          ),
          tabBarLabelStyle: {
            fontSize: 10,
            color: "#888",
          },
          headerStyle: THEME.headers.default.headerStyle,
          headerTitleStyle: THEME.headers.default.headerTitleStyle,
          headerTintColor: THEME.headers.default.headerTintColor,
        }}
      />
    </Tabs>
  );
});

export default TabLayout;
