import { View, Text, Image } from "react-native";
import React from "react";

export default function SplashScreenAnimated() {
  return (
    <View className="h-screen items-center justify-center bg-white">
      <Image
        source={require("@/assets/images/icon.gif")}
        style={{ width: 200, height: 200 }}
      />
      <Text>Cargando ...</Text>
    </View>
  );
}
