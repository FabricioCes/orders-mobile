import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ActiveTable } from "@/types/tableTypes";
import { orderService } from "@/core/services/order.service";
import { signalRService } from "../services/real-time.service";
import { useEffect } from "react";

// Hook personalizado para obtener mesas activas
export const useActiveTables = () => {
  const queryClient = useQueryClient();

  const {
    data: activeTables = [], // Valor por defecto
    isLoading,
    error,
  } = useQuery<ActiveTable[]>({
    queryKey: ["activeTables"],
    queryFn: async () => {
      try {
        return await orderService.loadActiveOrders();
      } catch (error) {
        console.error("Error fetching active tables:", error);
        return []; // Retornar array vacío en caso de error
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // Manejo de actualizaciones en tiempo real con SignalR
  useEffect(() => {
    const handleOrderUpdate = () => {
      console.log("Actualización de orden recibida - Recargando mesas...");
      queryClient.invalidateQueries({ queryKey: ["activeTables"] });
    };

    const unsubscribe = signalRService.onOrderUpdated(handleOrderUpdate);

    return () => {
      console.log("Desuscribiendo de actualizaciones de orden...");
      unsubscribe();
    };
  }, [queryClient]);

  return { activeTables: activeTables || [], isLoading, error };
};