import * as Location from "expo-location";
import { useCallback, useEffect, useState } from "react";

type PermissionState = "unknown" | "granted" | "denied" | "blocked";

export function useLocationPermission() {
  const [status, setStatus] = useState<PermissionState>("unknown");
  const [isRequesting, setIsRequesting] = useState(false);

  const check = useCallback(async () => {
    const { status: foregroundStatus, canAskAgain } =
      await Location.getForegroundPermissionsAsync();
    if (foregroundStatus === Location.PermissionStatus.GRANTED) {
      setStatus("granted");
      return "granted" as const;
    }
    if (!canAskAgain) {
      setStatus("blocked");
      return "blocked" as const;
    }
    setStatus("denied");
    return "denied" as const;
  }, []);

  const request = useCallback(async () => {
    setIsRequesting(true);
    try {
      const { status: foregroundStatus } =
        await Location.requestForegroundPermissionsAsync();
      const resolved: PermissionState =
        foregroundStatus === Location.PermissionStatus.GRANTED
          ? "granted"
          : "denied";
      setStatus(resolved);
      return resolved;
    } finally {
      setIsRequesting(false);
    }
  }, []);

  useEffect(() => {
    // Initial check on mount
    void check();
  }, [check]);

  const getCurrentPosition = useCallback(
    async (
      options?: Location.LocationOptions
    ): Promise<Location.LocationObject | null> => {
      const currentStatus = await check();
      if (currentStatus !== "granted") {
        const requested = await request();
        if (requested !== "granted") return null;
      }
      return Location.getCurrentPositionAsync(options);
    },
    [check, request]
  );

  return { status, isRequesting, check, request, getCurrentPosition };
}
