import { useSettings } from '@/context/SettingsContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router, Tabs } from 'expo-router';
import { useEffect } from 'react';
import { Alert, useColorScheme } from 'react-native';

export default function TabLayout() {

  const colorScheme = useColorScheme();

  const isDarkMode = colorScheme === "dark";

  const {checkTokenExpiration, settings} = useSettings()

  useEffect(() => {
    
    checkTokenExpiration();
    if(settings.length < 0){
       Alert.alert(
              "Oops! 🤚🏼",
              "No has configurado la ip del Servidor 🚫",
              [
                {
                  text: "Aceptar",
                  onPress: () => {
                    router.navigate("/(tabs)/settings");
                  },
                },
              ],
              { cancelable: false }
            );
    }
  },[])

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
          title: 'Configuraciones',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="cog" color={color} />,
        }}
      />
    </Tabs>
  );
}
