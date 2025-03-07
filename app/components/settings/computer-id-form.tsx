import { useSettings } from "@/core/context/SettingsContext";
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
    padding: 32, // Más espacio interno
    backgroundColor: "#fff", // Fondo blanco
    borderRadius: 16, // Bordes más redondeados
    marginBottom: 20,
    elevation: 5, // Sombra más suave y pronunciada
  },
  title: {
    fontSize: 24, // Texto más grande
    fontWeight: "700", // Negrita
    color: "#1F2937", // Gris oscuro
    marginBottom: 16,
    textAlign: "center", // Centrado
  },
  input: {
    borderWidth: 2, // Borde más grueso
    borderColor: "#9CA3AF", // Gris claro
    borderRadius: 12, // Bordes redondeados
    height: 56, // Mayor altura
    paddingHorizontal: 16,
    color: "#4B5563",
    backgroundColor: "#fff",
  },
  inputLocked: {
    backgroundColor: "#E5E7EB", // Fondo gris claro cuando está bloqueado
  },
  saveButton: {
    backgroundColor: "#3B82F6", // Azul
    marginTop: 16,
    paddingVertical: 16, // Padding vertical consistente
    borderRadius: 12, // Bordes más redondeados
    elevation: 2, // Sombra suave
  },
  editButton: {
    backgroundColor: "#F59E0B", // Naranja
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 2,
  },
  scanButton: {
    backgroundColor: "#10B981", // Verde
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 2,
  },
  buttonText: {
    color: "#fff", // Texto blanco
    fontWeight: "700", // Negrita
    textAlign: "center",
    fontSize: 18, // Tamaño de texto más grande
  },
});

export default ComputerIdForm;