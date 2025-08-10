import * as React from "react";
import { Appearance, Platform } from "react-native";

import { setAndroidNavigationBar } from "@/shared/lib";

const useIsomorphicLayoutEffect =
  Platform.OS === "web" && typeof window === "undefined"
    ? React.useEffect
    : React.useLayoutEffect;

const useSetWebBackgroundClassName = () => {
  useIsomorphicLayoutEffect(() => {
    document.documentElement.classList.add("bg-background");
  }, []);
};

const useSetAndroidNavigationBar = () => {
  React.useLayoutEffect(() => {
    setAndroidNavigationBar(Appearance.getColorScheme() ?? "light");
  }, []);
};

export const usePlatformSetup = () => {
  const hook = Platform.select({
    web: useSetWebBackgroundClassName,
    android: useSetAndroidNavigationBar,
    default: () => {},
  });
  hook?.();
};
