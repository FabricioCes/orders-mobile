import { Tabs } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSettings } from "../../context/SettingsContext";
import { useColorScheme } from "react-native";

const TabLayout = () => {
  const { zonas } = useSettings();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";


  // Define static tabs
  const staticTabs = [
    { name: "comedor", title: "Comedor", iconName: "home" },
    { name: "barra", title: "Barra", iconName: "glass" },
    { name: "express", title: "Express", iconName: "bolt" },
    { name: "llevar", title: "Para Llevar", iconName: "shopping-bag" },
    { name: "terraza", title: "Terraza", iconName: "tree" },
  ];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#60A5FACC",
        headerStyle: {
          backgroundColor: "#60A5FACC",
        },
        headerTintColor: isDarkMode ? "#fff" : "#000",
      }}
    >
      {staticTabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          initialParams={{
            qty: zonas[tab.name] || 0, // Use dynamic data for table quantities
            place: tab.title,
          }}
          options={{
            title: tab.title,
            tabBarIcon: ({ color }) => (
              <FontAwesome size={28} name={tab.iconName as keyof typeof FontAwesome.glyphMap} color={color} />
            ),
          }}
        />
      ))}

      {/* Fixed settings tab */}
      <Tabs.Screen
        name="settings"
        options={{
          title: "Configuración",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="cog" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
