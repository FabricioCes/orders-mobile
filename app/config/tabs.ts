import { FontAwesome } from '@expo/vector-icons';
import { ComponentType } from 'react';
import Tables from '@/components/Tables';
import SettingsScreen from '@/components/SettingsScreen';

type TabConfig = {
  name: string;
  title: string;
  iconName: React.ComponentProps<typeof FontAwesome>['name'];
  component: ComponentType<any>;
  enabled: boolean;
};

export const tabsConfig: TabConfig[] = [
  {
    name: 'index',
    title: 'Comedor',
    iconName: 'home',
    component: Tables,
    enabled: true,
  },
  {
    name: 'barra',
    title: 'Barra',
    iconName: 'android',
    component: Tables,
    enabled: true,
  },
  {
    name: 'llevar',
    title: 'Llevar',
    iconName: 'hospital-o',
    component: Tables,
    enabled: true,
  },
  {
    name: 'settings',
    title: 'Configuraciones',
    iconName: 'cog',
    component: SettingsScreen,
    enabled: true,
  },
];