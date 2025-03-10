import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, Alert } from "react-native";
import { Camera, CameraView } from "expo-camera";

interface QRScannerProps {
  onScan: (data: string) => void;
  onCancel: () => void;
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
      lineAnim.stopAnimation();
    }
  }, [scanned, lineAnim]);

  const handleBarCodeScanned = ({ type: _type, data }: { type: string; data: string }) => {
    if (validateCode && !validateCode(data)) {
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
        <Text style={styles.message}>Solicitando permiso para la cámara...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>No hay acceso a la cámara.</Text>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Escanear Código QR</Text>
      </View>

      {/* Cámara */}
      <CameraView
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />

      {/* Overlay con área de escaneo */}
      <View style={styles.overlay}>
        <View style={styles.scanningArea}>
          <Animated.View
            style={[
              styles.scanningLine,
              { transform: [{ translateY: lineAnim }] },
            ]}
          />
        </View>
        <Text style={styles.scanPrompt}>
          {scanned ? "Código escaneado" : "Alinea el código QR dentro del marco"}
        </Text>
      </View>

      {/* Botones */}
      <View style={styles.buttonContainer}>
        {scanned && (
          <TouchableOpacity
            style={styles.scanAgainButton}
            onPress={() => {
              setScanned(false);
              lineAnim.setValue(0);
            }}
          >
            <Text style={styles.buttonText}>Escanear de nuevo</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Colores y estilos consistentes con ComputerIdForm y QuantityModal
const COLORS = {
  primary: "#3B82F6", // Azul principal
  background: "#fff", // Fondo blanco
  text: "#1F2937", // Gris oscuro para texto
  secondaryText: "#4B5563", // Gris medio para texto secundario
  buttonText: "#fff", // Blanco para texto de botones
  scanLine: "#EF4444", // Rojo para la línea de escaneo
  border: "#fff", // Blanco para el marco de escaneo
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000", // Fondo negro para la cámara
  },
  header: {
    padding: 16,
    backgroundColor: COLORS.background,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    elevation: 5, // Sombra suave
    zIndex: 10, // Asegura que esté sobre la cámara
  },
  headerTitle: {
    fontSize: 24, // Tamaño grande como en ComputerIdForm
    fontWeight: "700", // Negrita
    color: COLORS.text, // Gris oscuro
    textAlign: "center",
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0, // Cámara detrás del encabezado y overlay
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
    borderColor: COLORS.border, // Blanco
    borderRadius: 12, // Bordes redondeados
    overflow: "hidden",
    backgroundColor: "rgba(0, 0, 0, 0.2)", // Fondo semitransparente para contraste
  },
  scanningLine: {
    width: "100%",
    height: 2,
    backgroundColor: COLORS.scanLine, // Rojo vibrante
  },
  scanPrompt: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.buttonText, // Blanco para visibilidad
    textAlign: "center",
    paddingHorizontal: 16,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 32,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 16,
  },
  scanAgainButton: {
    backgroundColor: COLORS.primary, // Azul como en QuantityModal
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    elevation: 2, // Sombra suave
  },
  cancelButton: {
    backgroundColor: "#F59E0B", // Naranja como el editButton en ComputerIdForm
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    elevation: 2,
  },
  buttonText: {
    color: COLORS.buttonText, // Blanco
    fontWeight: "700", // Negrita
    fontSize: 18, // Tamaño grande como en ComputerIdForm
    textAlign: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background, // Fondo blanco
  },
  message: {
    fontSize: 18,
    color: COLORS.text, // Gris oscuro
    marginBottom: 16,
    textAlign: "center",
  },
});

export default QRScanner;