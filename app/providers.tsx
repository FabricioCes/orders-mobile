import { SettingsProvider } from "@/core/context/SettingsContext";
import { OrderProvider } from "@/core/context/OrderContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PortalProvider } from "@gorhom/portal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient();
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
            <OrderProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                  <PortalProvider>{children}</PortalProvider>
                </GestureHandlerRootView>
            </OrderProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
}
