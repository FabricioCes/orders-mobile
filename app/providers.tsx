import React from "react";
import { SettingsProvider } from "@/context/SettingsContext";
import { OrderProvider } from "@/context/OrderContext";
import { ProductsProvider } from "@/context/ProductsContext";
import { ClientsProvider } from "@/context/ClientsContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <ProductsProvider>
          <OrderProvider>
            <ClientsProvider>{children}</ClientsProvider>
          </OrderProvider>
      </ProductsProvider>
    </SettingsProvider>
  );
}
