import { Tabs } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSettings } from "../../context/SettingsContext";
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

const TabLayout = memo(() => {

  const { activeTables } = useTable();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const tablesByZone = useMemo(() => {
    return activeTables.reduce((acc, table) => {
      const zona = table.zona?.toLowerCase() || 'sin-zona';
      acc[zona] = (acc[zona] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [activeTables]); // Solo recalcula cuando activeTables cambie

  const renderedTabs = useMemo(() => staticTabs.map((tab) => {
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
            backgroundColor: "#3b82f6",
            color: "white",
            fontSize: 8,
            fontWeight: "bold",
            marginLeft: 5,
          },
        }}
      />
    );
  }), [tablesByZone]); // Solo re-renderiza tabs cuando tablesByZone cambie

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#60A5FACC",
        headerStyle: {
          backgroundColor: "#60A5FACC",
        },
        headerTintColor: !isDarkMode ? "#fff" : "#000",
        lazy: true, // Activa carga perezosa de tabs
      }}
    >
      {renderedTabs}

      {/* Fixed settings tab */}
      <Tabs.Screen
        name="settings"
        options={{
          title: "Conf",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="cog" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
});

export default TabLayout;