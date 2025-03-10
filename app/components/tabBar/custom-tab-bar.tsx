
import { View, StyleSheet } from "react-native";
import TabItem from "./tab-item";
import { NavigationState } from "react-native-tab-view";
interface Route {
  key: string;
  title: string;
  icon: string;
}
interface CustomTabBarProps {
navigationState: NavigationState<Route>;
jumpTo: (key: string) => void;
tablesByZone: { [key: string]: number };
theme: { colors: { background: string; primary: string; textDark: string } };
}

const CustomTabBar = ({ navigationState, jumpTo, tablesByZone, theme }: CustomTabBarProps) => {
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {navigationState.routes.map((route, index) => {
        const isFocused = navigationState.index === index;
        const badgeCount = tablesByZone[route.title.toLowerCase()] || 0;
        return (
          <TabItem
            key={route.key}
            route={route}
            isFocused={isFocused}
            jumpTo={jumpTo}
            theme={theme}
            badgeCount={badgeCount}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    height: 60,
  },
});

export default CustomTabBar;
