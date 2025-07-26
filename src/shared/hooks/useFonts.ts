/**
 * Hook to load custom fonts for the app
 *
 * Currently using system fonts. To add Google Fonts:
 * 1. Install the font package: bun add @expo-google-fonts/[font-name]
 * 2. Import the font weights you need
 * 3. Add them to the fonts object below
 *
 * Available Google Fonts packages:
 * - @expo-google-fonts/inter (Inter)
 * - @expo-google-fonts/roboto (Roboto)
 * - @expo-google-fonts/open-sans (Open Sans)
 * - @expo-google-fonts/poppins (Poppins)
 * - @expo-google-fonts/lato (Lato)
 * - @expo-google-fonts/montserrat (Montserrat)
 * - @expo-google-fonts/raleway (Raleway)
 * - @expo-google-fonts/ubuntu (Ubuntu)
 *
 * Example with Google Fonts:
 * import { Inter_400Regular, Inter_700Bold } from "@expo-google-fonts/inter";
 * import { useFonts as useExpoFonts } from "expo-font";
 *
 * const [fontsLoaded, fontError] = useExpoFonts({
 *   "Inter-Regular": Inter_400Regular,
 *   "Inter-Bold": Inter_700Bold,
 * });
 *
 * @returns Object with fontsLoaded boolean and error if any
 */
export const useFonts = () => {
  // For now, return immediately loaded fonts since we're using system fonts
  // This avoids the dependency issue with @expo-google-fonts/inter
  return { fontsLoaded: true, fontError: null };
};
