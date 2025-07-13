import "@/global.css";

import {
  DarkTheme,
  DefaultTheme,
  type Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Link, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { Appearance, Platform, View } from "react-native";

// import {
//   createPersistentQueryClient,
//   useStartupRefetch,
//   WsfCacheProvider,
// } from "wsdot-api-client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { SupabaseDataProvider } from "@/data/contexts/SupabaseData";
import { VesselPositionsProvider } from "@/data/contexts/VesselPositionsContext";
import { setAndroidNavigationBar } from "@/lib/android-navigation-bar";
import { NAV_THEME } from "@/lib/constants";
import { useColorScheme } from "@/lib/useColorScheme";

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

  return (
    <QueryClientProvider client={queryClient}>
      {/* <WsfCacheProvider /> */}
      <SupabaseDataProvider>
        <VesselPositionsProvider>
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
            <Link href="/map" asChild>
              <Button>
                <Text>Open Map</Text>
              </Button>
            </Link>
          </ThemeProvider>
        </VesselPositionsProvider>
      </SupabaseDataProvider>
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
