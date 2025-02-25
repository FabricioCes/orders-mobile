import React from "react";
import { SettingsProvider } from "@/core/context/SettingsContext";
import { OrderProvider } from "@/core/context/OrderContext";
import { ProductsProvider } from "@/core/context/ProductsContext";
import { CustomerProvider } from "@/core/context/CustomerContext";
import { ActiveTablesProvider } from "@/core/context/ActiveTablesContext";

export default function Providers({
  children,
  orderId,
}: {
  children: React.ReactNode;
  orderId?: string;
}) {
  return (
    <SettingsProvider>
      <ActiveTablesProvider>
        <OrderProvider orderId={String(orderId)}>
          <ProductsProvider>
            <CustomerProvider>{children}</CustomerProvider>
          </ProductsProvider>
        </OrderProvider>
      </ActiveTablesProvider>
    </SettingsProvider>
  );
}
