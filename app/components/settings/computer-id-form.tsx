import { useSettings } from "@/app/context/SettingsContext";
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, Modal } from "react-native";
import QRScanner from "./qr-scanner";


const ComputerIdForm = () => {
  const { saveSettings, settings } = useSettings();
  const [pcId, setPcId] = useState(settings?.idComputadora || "");
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (settings?.idComputadora) {
      setPcId(settings.idComputadora);
    }
  }, [settings]);

  const handleSave = () => {
    if (pcId.trim() === "") {
      Alert.alert("Error", "Por favor, ingresa un ID válido");
      return;
    }
    saveSettings({ idComputadora: pcId });
    Alert.alert("Éxito", "ID guardado exitosamente");
  };

  const handleScan = (data: string) => {
    setPcId(data);
    setIsScanning(false);
    Alert.alert("QR leído", `ID: ${data}`);
  };

  const handleCancelScan = () => {
    setIsScanning(false);
  };

  return (
    <View className="w-full p-4 bg-white shadow-md rounded-lg mb-10">
      <Text className="text-lg font-semibold text-gray-700">ID Computadora</Text>
      <TextInput
        value={pcId}
        onChangeText={setPcId}
        placeholder="Escribe el ID de la computadora"
        className="border border-gray-300 rounded-lg h-12 mt-2 px-4 text-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-200"
      />
      <TouchableOpacity
        onPress={handleSave}
        className="bg-blue-500 mt-5 py-3 rounded-lg"
      >
        <Text className="text-white font-bold text-center">Guardar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setIsScanning(true)}
        className="bg-green-500 mt-5 py-3 rounded-lg"
      >
        <Text className="text-white font-bold text-center">Leer QR</Text>
      </TouchableOpacity>

      <Modal visible={isScanning} animationType="slide">
        <QRScanner onScan={handleScan} onCancel={handleCancelScan} />
      </Modal>
    </View>
  );
};

export default ComputerIdForm;
