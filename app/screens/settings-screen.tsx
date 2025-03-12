import React from "react";
import { View } from "react-native";
import { useSettings } from "../../core/context/SettingsContext";
import ComputerIdForm from "../components/settings/computer-id-form";
import UserSection from "../components/settings/user-section";
import LoginPrompt from "../components/settings/login-prompt";

const SettingsScreen = () => {
  const { isLogin } = useSettings();

  return (
    <View className="flex-1 bg-gray-100 items-center p-5">
      <ComputerIdForm />
      {isLogin ? <UserSection /> : <LoginPrompt />}
    </View>
  );
};

export default SettingsScreen;