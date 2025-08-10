import "react-native-gesture-handler";

import "@/global.css";

import { ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { configManager } from "ws-dottie";

import { DataContextProvider } from "@/data/contexts";
import { ThemeToggle } from "@/shared/components/ThemeToggle";
import { UIContextProvider } from "@/shared/contexts";
import { useFonts } from "@/shared/hooks/useFonts";
import { useNavTheme } from "@/shared/hooks/useNavTheme";
import { usePlatformSetup } from "@/shared/hooks/usePlatformSetup";

// Configure WS-Dottie with WSDOT API key once at module load (after imports)
configManager.setApiKey(process.env.EXPO_PUBLIC_WSDOT_ACCESS_TOKEN || "");

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export default function RootLayout() {
  usePlatformSetup();
  const { navTheme, statusBarStyle } = useNavTheme();
  const { fontsLoaded, fontError } = useFonts();

  // Configure WS-Dottie with WSDOT API key
  // Don't render until fonts are loaded
  if (!fontsLoaded) {
    return null;
  }

  // Log font errors if any
  if (fontError) {
    console.error("Font loading error:", fontError);
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* <WsfCacheProvider /> */}
      <DataContextProvider>
        <UIContextProvider>
          <ThemeProvider value={navTheme}>
            <StatusBar style={statusBarStyle} />
            <Stack screenOptions={{ headerRight: () => <ThemeToggle /> }} />
            <PortalHost />
          </ThemeProvider>
        </UIContextProvider>
      </DataContextProvider>
    </GestureHandlerRootView>
  );
}
