import { ActivityIndicator, View } from "react-native";

type LoadingSpinnerProps = {
  size?: "small" | "large";
  color?: string;
};

/**
 * Loading spinner component for displaying loading states
 * Provides consistent loading UI across the application
 */
const LoadingSpinner = ({
  size = "large",
  color = "#3B82F6",
}: LoadingSpinnerProps) => {
  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

export default LoadingSpinner;
