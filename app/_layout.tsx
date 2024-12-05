import { Stack } from "expo-router";
import '../global.css'
import Providers from "./providers";

export default function RootLayout() {
  return (
    <Providers>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </Providers>

  );
}
