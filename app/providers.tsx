import React from "react";
import { SettingsProvider } from "@/core/context/SettingsContext";
import { OrderProvider } from "@/core/context/OrderContext";
import { ProductsProvider } from "@/core/context/ProductsContext";
import { CustomerProvider } from "@/core/context/CustomerContext";

export default function Providers({ children, orderId,}: { children: React.ReactNode, orderId?: string}) {
  return (
    <SettingsProvider>
      <OrderProvider orderId={String(orderId)}>
        <ProductsProvider>
          <CustomerProvider>{children}</CustomerProvider>
        </ProductsProvider>
      </OrderProvider>
    </SettingsProvider>
  );
}
