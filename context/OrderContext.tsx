import { Product } from "@/types/types";
import { router } from "expo-router";
import { createContext, useContext } from "react";
import { Alert } from "react-native";

interface OrderContextType {
    saveOrder: (order: Product[]) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: React.ReactNode }) => {

    async function saveOrder(order: Product[]) {
        console.log("Orden Guardada: \n", order)

        Alert.alert(
            "Éxito 🎉",
            "Orden Guardada Correctamente! 🚀",
            [
                {
                    text: "Aceptar",
                    onPress: () => {
                        // Reemplazar ruta después de aceptar
                        router.replace("/(tabs)");
                    },
                },
            ],
            { cancelable: false }
        );
    }


    return <OrderContext.Provider value={{ saveOrder }}>
        {children}
    </OrderContext.Provider>
}

export const useOrder = (): OrderContextType => {
    const context = useContext(OrderContext);
    if (!context) {
        throw new Error("useOrder debe usarse dentro de un SettingsProvider");
    }
    return context;
};