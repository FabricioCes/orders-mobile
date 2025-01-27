import { View, Text } from "react-native";
import React from "react";
import { SettingsProvider } from "@/context/SettingsContext";
import { NavigationContainer } from "@react-navigation/native";
import { OrderProvider } from "@/context/OrderContext";
import { ProductsProvider } from "@/context/ProductsContext";
import { TableProvider } from "@/context/TablesContext";
import { ClientsProvider } from "@/context/ClientsContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <ProductsProvider>
        <TableProvider>
          <OrderProvider>
            <ClientsProvider>{children}</ClientsProvider>
          </OrderProvider>
        </TableProvider>
      </ProductsProvider>
    </SettingsProvider>
  );
}
