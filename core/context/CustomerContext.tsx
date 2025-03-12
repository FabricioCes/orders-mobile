import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Customer } from "@/types/customerTypes";
import { CustomerService } from "@/core/services/customer.service";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Hook para obtener clientes
export const useCustomers = (signal?: AbortSignal) => {
  return useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: () => CustomerService.fetchCustomers(signal),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};
export const useSelectedCustomer = () => {
  const queryClient = useQueryClient();

  const { data: selectedCustomer } = useQuery<Customer | null>({
    queryKey: ["selectedCustomer"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem("selectedCustomer");
      // Si no hay datos, retorna null en lugar de undefined
      return stored ? JSON.parse(stored) : null;
    },
    initialData: null,
  });

  const { mutate: setSelectedCustomer } = useMutation({
    mutationFn: (customer: Customer) => {
      return AsyncStorage.setItem("selectedCustomer", JSON.stringify(customer));
    },
    onSuccess: (_data, customer) => {
      // Actualiza el query cache con el cliente recibido
      queryClient.setQueryData(["selectedCustomer"], customer);
    },
  });

  const { mutate: clearSelectedCustomer } = useMutation({
    mutationFn: () => AsyncStorage.removeItem("selectedCustomer"),
    onSuccess: () => {
      queryClient.setQueryData(["selectedCustomer"], null);
    },
  });

  return { selectedCustomer, setSelectedCustomer, clearSelectedCustomer };
};
