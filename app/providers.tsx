import React from "react";
import { SettingsProvider } from "@/core/context/SettingsContext";
import { OrderProvider } from "@/core/context/OrderContext";
import { ProductsProvider } from "@/core/context/ProductsContext";
import { CustomerProvider } from "@/core/context/CustomerContext";
import { ActiveTablesProvider } from "@/core/context/ActiveTablesContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <ActiveTablesProvider>
        <CustomerProvider>
          <OrderProvider>
            <ProductsProvider>{children}</ProductsProvider>
          </OrderProvider>
        </CustomerProvider>
      </ActiveTablesProvider>
    </SettingsProvider>
  );
}
