import { Customer } from "@/types/customerTypes";
import { useMemo } from "react";

const useCustomerSearch = (customers: Customer[], query: string) => {
  return useMemo(() => {
    const normalizedQuery = query
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    return customers.filter(
      (client) =>
        client.nombre.toLowerCase().includes(normalizedQuery) ||
        client.cedula.includes(normalizedQuery)
    );
  }, [customers, query]);
};

export default useCustomerSearch;
