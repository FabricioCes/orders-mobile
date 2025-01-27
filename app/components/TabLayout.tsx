// app/components/TabLayout.tsx
import { useEffect } from 'react';
import { Alert, useColorScheme } from 'react-native';
import { router, Tabs } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { tabsConfig } from '@/config/tabs';
import { useSettings } from '../../context/SettingsContext';

const TabLayout = () => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const { checkTokenExpiration, settings } = useSettings();

  useEffect(() => {
    checkTokenExpiration();
    if (!settings.length) {
      showConfigurationAlert();
    }
  }, []);

  const showConfigurationAlert = () =>
    Alert.alert(
      'Oops! 🤚🏼',
      'No has configurado la ip del Servidor 🚫',
      [
        {
          text: 'Aceptar',
          onPress: () => router.navigate('/(tabs)/settings'),
        },
      ],
      { cancelable: false }
    );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#60A5FACC',
        headerStyle: {
          backgroundColor: '#60A5FACC',
        },
        headerTintColor: isDarkMode ? '#fff' : '#000',
      }}
    >
      {tabsConfig
        .filter((tab) => tab.enabled)
        .map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.title,
              tabBarIcon: ({ color }) => (
                <FontAwesome size={28} name={tab.iconName} color={color} />
              ),
            }}
          />
        ))}
    </Tabs>
  );
};

export default TabLayout;