import React, { useState, useEffect, useRef } from "react";
import { View, Text, Button, StyleSheet, Animated, Alert } from "react-native";
import { Camera, CameraView } from "expo-camera";

interface QRScannerProps {
  onScan: (data: string) => void;
  onCancel: () => void;
  // Función opcional para validar el código escaneado (ej: formato IPv4)
  validateCode?: (data: string) => boolean;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onCancel, validateCode }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const lineAnim = useRef(new Animated.Value(0)).current;
  const scanningAreaHeight = 250;

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  useEffect(() => {
    if (!scanned) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(lineAnim, {
            toValue: scanningAreaHeight,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(lineAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Detiene la animación al haber escaneado
      lineAnim.stopAnimation();
    }
  }, [scanned, lineAnim]);

  const handleBarCodeScanned = ({ type: _type, data }: { type: string; data: string }) => {
    if (validateCode && !validateCode(data)) {
      // Si el código no es válido, se detiene el efecto y se muestra alerta
      setScanned(true);
      Alert.alert("Código inválido", "El código escaneado no es válido.");
      return;
    }
    setScanned(true);
    onScan(data);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.centered}>
        <Text>Solicitando permiso para la cámara...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.centered}>
        <Text>No hay acceso a la cámara.</Text>
        <Button title="Cancelar" onPress={onCancel} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />
      {scanned && (
        <Button
          title="Escanear de nuevo"
          onPress={() => {
            setScanned(false);
            lineAnim.setValue(0); // Reinicia la animación
          }}
        />
      )}
      <View style={styles.overlay}>
        <View style={styles.scanningArea}>
          <Animated.View
            style={[
              styles.scanningLine,
              { transform: [{ translateY: lineAnim }] },
            ]}
          />
        </View>
      </View>
      <Button title="Cancelar" onPress={onCancel} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  scanningArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
  },
  scanningLine: {
    width: "100%",
    height: 2,
    backgroundColor: "red",
  },
});

export default QRScanner;
