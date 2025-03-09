import React from "react";
import { SettingsProvider } from "@/core/context/SettingsContext";
import { OrderProvider } from "@/core/context/OrderContext";
import { ProductsProvider } from "@/core/context/ProductsContext";
import { CustomerProvider } from "@/core/context/CustomerContext";
import { ActiveTablesProvider } from "@/core/context/ActiveTablesContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PortalProvider } from "@gorhom/portal";


export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <ActiveTablesProvider>
        <CustomerProvider>
          <OrderProvider>
            <ProductsProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <PortalProvider>{children}</PortalProvider>
              </GestureHandlerRootView>
            </ProductsProvider>
          </OrderProvider>
        </CustomerProvider>
      </ActiveTablesProvider>
    </SettingsProvider>
  );
}
