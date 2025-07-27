configManager.setApiKey(process.env.EXPO_PUBLIC_WSDOT_ACCESS_TOKEN || "");

import "@/global.css";

import {
  DarkTheme,
  DefaultTheme,
  type Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { Appearance, Platform } from "react-native";
import { configManager } from "ws-dottie";

import { ThemeToggle } from "@/shared/components/ThemeToggle";
import { DataProvider } from "@/shared/contexts";
import { useFonts } from "@/shared/hooks/useFonts";
import {
  NAV_THEME,
  setAndroidNavigationBar,
  useColorScheme,
} from "@/shared/lib";

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

// Create a persistent client
// const queryClient = createPersistentQueryClient();
const queryClient = new QueryClient();

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

const usePlatformSpecificSetup = Platform.select({
  web: useSetWebBackgroundClassName,
  android: useSetAndroidNavigationBar,
  default: noop,
});

export default function RootLayout() {
  usePlatformSpecificSetup();
  // useStartupRefetch(); // Refetch real-time data on startup
  const { isDarkColorScheme } = useColorScheme();
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
    <QueryClientProvider client={queryClient}>
      {/* <WsfCacheProvider /> */}
      <DataProvider>
        <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
          <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
          <Stack>
            <Stack.Screen
              name="index"
              options={{
                title: "Starter Base",
                headerRight: () => <ThemeToggle />,
              }}
            />
            <Stack.Screen
              name="map"
              options={{
                title: "Map",
                headerRight: () => <ThemeToggle />,
              }}
            />
          </Stack>
          <PortalHost />
        </ThemeProvider>
      </DataProvider>
    </QueryClientProvider>
  );
}

const useIsomorphicLayoutEffect =
  Platform.OS === "web" && typeof window === "undefined"
    ? React.useEffect
    : React.useLayoutEffect;

function useSetWebBackgroundClassName() {
  useIsomorphicLayoutEffect(() => {
    // Adds the background color to the html element to prevent white background on overscroll.
    document.documentElement.classList.add("bg-background");
  }, []);
}

function useSetAndroidNavigationBar() {
  React.useLayoutEffect(() => {
    setAndroidNavigationBar(Appearance.getColorScheme() ?? "light");
  }, []);
}

function noop() {}
