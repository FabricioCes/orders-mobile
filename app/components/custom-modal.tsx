import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Portal } from "@gorhom/portal";
import { FullWindowOverlay } from "react-native-screens";

interface CustomModalProps {
  visible: boolean;
  children: React.ReactNode;
  onClose: () => void;
}

const CustomModal = ({ visible, children, onClose }: CustomModalProps) => {
  const { height } = Dimensions.get("window");

  // Estilo animado para el modal
  const animation = useAnimatedStyle(() => ({
    opacity: withTiming(visible ? 1 : 0, {
      duration: 300,
      easing: Easing.inOut(Easing.ease),
    }),
    transform: [
      {
        translateY: withTiming(visible ? 0 : height, {
          duration: 300,
          easing: Easing.inOut(Easing.ease),
        }),
      },
    ],
  }));

  // Renderizamos solo si el modal es visible para evitar problemas de rendimiento
  if (!visible) return null;

  return (
    <Portal>
      <FullWindowOverlay style={styles.fullWindowOverlay}>
        <View style={styles.overlay}>
          <Animated.View style={[styles.modalContainer, animation]}>
            {children}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </FullWindowOverlay>
    </Portal>
  );
};

const styles = StyleSheet.create({
  fullWindowOverlay: {
    ...StyleSheet.absoluteFillObject, // Ocupa toda la pantalla
    backgroundColor: "rgba(0,0,0,0.4)", // Fondo semitransparente
    justifyContent: "flex-end", // Modal desde la parte inferior
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end", // Asegura que el modal salga desde abajo
  },
  modalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  closeButton: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default CustomModal;
