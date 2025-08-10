import { DarkTheme, DefaultTheme, type Theme } from "@react-navigation/native";

import { NAV_THEME, useColorScheme } from "@/shared/lib";

type NavThemeResult = {
  navTheme: Theme;
  statusBarStyle: "light" | "dark";
};

export const useNavTheme = (): NavThemeResult => {
  const { isDarkColorScheme } = useColorScheme();
  const navTheme: Theme = isDarkColorScheme
    ? { ...DarkTheme, colors: NAV_THEME.dark }
    : { ...DefaultTheme, colors: NAV_THEME.light };

  const statusBarStyle: "light" | "dark" = isDarkColorScheme ? "light" : "dark";
  return { navTheme, statusBarStyle };
};
