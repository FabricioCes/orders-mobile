import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function TabLayout() {

  const colorScheme = useColorScheme();

  const isDarkMode = colorScheme === "dark";
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#60A5FACC',
      headerStyle: {
        backgroundColor: '#60A5FACC'
      },
      headerTintColor: isDarkMode ? "#fff" : "#000",
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Comedor',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="cog" color={color} />,
        }}
      />
    </Tabs>
  );
}
