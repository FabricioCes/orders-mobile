import React from "react";
import { SettingsProvider } from "@/context/SettingsContext";
import { OrderProvider } from "@/context/OrderContext";
import { ProductsProvider } from "@/context/ProductsContext";
import { CustomerProvider } from "@/app/context/CustomerContext";

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
