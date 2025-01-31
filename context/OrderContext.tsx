import { Order, OrderDetail } from "@/types/types";
import { router } from "expo-router";
import { createContext, useCallback, useContext, useState } from "react";
import { Alert } from "react-native";
import { useSettings } from "./SettingsContext";
import { useTable } from "./TablesContext";

interface OrderContextType {
  currentOrder: Order | null;
  saveOrder: (order: Order, method: string) => void;
  getOrderDetails: (orderId: number) => void;
  apiOrderDetails: OrderDetail[];
  deleteOrderDetail: (idDetail: number) => Promise<boolean>;
  updateOrder: (order: Order) => void;
  resetOrder: () => void;
}

type APIOrderDetail = {
  identificadorOrdenDetalle: number;
  identificadorProducto: number;
  nombreProducto: string;
  cantidad: number;
  costoUnitario: number;
  porcentajeDescuento: number;
  ingrediente: boolean;
  impuestoProducto: number;
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: React.ReactNode }) => {
  const { settings, token } = useSettings();
  const { getActiveTables } = useTable();
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  async function saveOrder(order: Order, method: string) {
    const url = `http://${settings?.idComputadora}:5001/orden`;

    const showAlert = (title: string, message: string) => {
      Alert.alert(title, message, [{ text: "Aceptar", onPress: () => { } }], {
        cancelable: false,
      });
    };

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(order),
      });

      switch (res.status) {
        case 200:
          const savedOrder = await res.json();
          setCurrentOrder(savedOrder);
          getActiveTables();
          showOrder(true);
          break;

        case 409:
        case 400:
          const result = await res.json();
          const errorMessage =
            result.mensaje || result.message || "Error desconocido";
          showAlert("Error 🚨", errorMessage);
          break;

        default:
          showOrder(true);
          break;
      }
    } catch (error) {
      console.error("Error al guardar la orden:", error);
      showAlert(
        "Error 🚨",
        "Ocurrió un error inesperado. Por favor, inténtalo de nuevo."
      );
    }
  }

  const showOrder = (pass: boolean) => {
    if (pass) {
      Alert.alert(
        "Éxito 🎉",
        "Orden Guardada Correctamente! 🚀",
        [
          {
            text: "Aceptar",
            onPress: () => {
              router.replace("/(tabs)/comedor");
            },
          },
        ],
        { cancelable: false }
      );
    } else {
      Alert.alert(
        "Error 🚫",
        "No se logró guardar la orden 😔",
        [
          {
            text: "Aceptar",
            onPress: () => {
              // Reemplazar ruta después de aceptar
              return;
            },
          },
        ],
        { cancelable: false }
      );
    }
  };

  const [apiOrderDetails, setApiOrderDetails] = useState<OrderDetail[]>([]);

  const getOrderDetails = useCallback(async (orderId: number) => {
    if (!settings?.idComputadora || !token) {
      console.warn("settings.idComputadora o token no están disponibles aún.");
      return;
    }

    const url = `http://${settings.idComputadora}:5001/orden/${orderId}/detalle`;

    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error("Error fetching order details:", res.statusText);
        return;
      }

      const data = await res.json();

      if (data.resultado && Array.isArray(data.resultado)) {
        const details: OrderDetail[] = (data.resultado as APIOrderDetail[]).map(
          (item) => ({
            identificadorOrdenDetalle: item.identificadorOrdenDetalle,
            idProducto: item.identificadorProducto,
            nombreProducto: item.nombreProducto,
            cantidad: item.cantidad,
            precio: item.costoUnitario + item.impuestoProducto,
            porcentajeDescProducto: item.porcentajeDescuento,
            ingrediente: item.ingrediente,
            quitarIngrediente: false,
          })
        );

        setApiOrderDetails(details);
      } else {
        console.warn("Unexpected response format:", data);
        setApiOrderDetails([]);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      setApiOrderDetails([]);
    }
  }, [settings?.idComputadora, token]); // <-- Agregamos dependencias

  const deleteOrderDetail = async (idDetail: number): Promise<boolean> => {
    const url = `http://${settings?.idComputadora}:5001/orden/detalle/${idDetail}`;

    try {
      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error(`Error deleting order detail: ${res.statusText}`);
        return false;
      }

      return true;
    } catch (e) {
      console.error("Error deleting order detail:", e);
      return false;
    }
  };
  const updateOrder = (order: Order) => {
    setCurrentOrder(order); 
  };

  // Resetear la orden
  const resetOrder = () => {
    setCurrentOrder(null); 
  };

  return (
    <OrderContext.Provider
      value={{ currentOrder, updateOrder, resetOrder ,saveOrder, getOrderDetails, apiOrderDetails, deleteOrderDetail }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrder debe usarse dentro de un SettingsProvider");
  }
  return context;
};
