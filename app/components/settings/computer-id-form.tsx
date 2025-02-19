import { useSettings } from "@/app/context/SettingsContext";
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, Modal, StyleSheet } from "react-native";
import QRScanner from "./qr-scanner";

const ComputerIdForm = () => {
  const { saveSettings, settings } = useSettings();
  const [pcId, setPcId] = useState(settings?.idComputadora || "");
  const [isScanning, setIsScanning] = useState(false);
  const [isLocked, setIsLocked] = useState(!!settings?.idComputadora);

  useEffect(() => {
    if (settings?.idComputadora) {
      setPcId(settings.idComputadora);
      setIsLocked(true);
    }
  }, [settings]);

  // Función para validar direcciones IPv4
  const isValidIPv4 = (ip: string) => {
    const regex = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;
    return regex.test(ip);
  };

  const handleSave = () => {
    if (!isValidIPv4(pcId.trim())) {
      Alert.alert("Error", "Por favor, ingresa un ID válido (IPv4)");
      return;
    }
    saveSettings({ idComputadora: pcId });
    Alert.alert("Éxito", "ID guardado exitosamente");
    setIsLocked(true);
  };

  const handleScan = (data: string) => {
    if (!isValidIPv4(data)) {
      Alert.alert("Error", "El código QR no contiene una dirección IPv4 válida");
      return;
    }
    setPcId(data);
    setIsScanning(false);
    Alert.alert("QR leído", `ID: ${data}`);
  };

  const handleUnlock = () => {
    Alert.alert(
      "Editar ID",
      "¿Estás seguro de que deseas editar el ID?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Editar", onPress: () => setIsLocked(false) },
      ]
    );
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.title}>ID Computadora</Text>
      <TextInput
        value={pcId}
        onChangeText={setPcId}
        placeholder="Escribe el ID de la computadora"
        editable={!isLocked}
        style={[styles.input, isLocked && styles.inputLocked]}
      />
      {!isLocked ? (
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.buttonText}>Guardar</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={handleUnlock} style={styles.editButton}>
          <Text style={styles.buttonText}>Editar</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={() => setIsScanning(true)} style={styles.scanButton}>
        <Text style={styles.buttonText}>Leer QR</Text>
      </TouchableOpacity>

      <Modal visible={isScanning} animationType="slide">
        <QRScanner onScan={handleScan} onCancel={() => setIsScanning(false)} />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    width: "100%",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 20,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 12,
    color: "#4B5563",
    backgroundColor: "#fff",
  },
  inputLocked: {
    backgroundColor: "#E5E7EB",
  },
  saveButton: {
    backgroundColor: "#3B82F6",
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  editButton: {
    backgroundColor: "#F59E0B",
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  scanButton: {
    backgroundColor: "#10B981",
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
  },
});

export default ComputerIdForm;
