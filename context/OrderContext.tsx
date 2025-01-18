import { Order, Product } from "@/types/types";
import { router } from "expo-router";
import { createContext, useContext } from "react";
import { Alert } from "react-native";
import { useSettings } from "./SettingsContext";
import { useTable } from "./TablesContext";

interface OrderContextType {
    saveOrder: (order: Order) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: React.ReactNode }) => {

    const { settings, token } = useSettings();
    const { getActiveTables } = useTable();

    async function saveOrder(order: Order) {

        const url = `http://${settings}:5001/orden`

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(order)
            })
            //console.log(JSON.stringify(order, null, 2))

            console.log(res.status);
            if (res.status === 200) {
                getActiveTables();
                showOrder(true);
            }else if(res.status === 409){
                Alert.alert(
                    "Error 🚫",
                    "Mesa ocupada, debe actualizar la orden.",
                    [
                        {
                            text: "Aceptar",
                            onPress: () => {
                                
                                return;
                            },
                        },
                    ],
                    { cancelable: false }
                );
            }
            else{
                showOrder(false);
            }
            console.log(JSON.stringify(order, null, 2))

        } catch (error) {

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
                            // Reemplazar ruta después de aceptar
                            router.replace("/(tabs)");
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