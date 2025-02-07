import { Client } from "@/types/clientTypes";
import { useMemo } from "react";

const useClientSearch = (clients: Client[], query: string) => {
  return useMemo(() => {
    const normalizedQuery = query
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    return clients.filter(
      (client) =>
        client.nombre.toLowerCase().includes(normalizedQuery) ||
        client.cedula.includes(normalizedQuery)
    );
  }, [clients, query]);
};

export default useClientSearch;
