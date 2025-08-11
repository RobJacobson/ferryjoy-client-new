import { useAppState } from "@react-native-community/hooks";
import { useNetInfo } from "@react-native-community/netinfo";
import { useCallback, useEffect, useRef } from "react";

type Options = { debounceMs?: number };

/**
 * Hook that invokes onReconnect when the app becomes active or the network becomes online.
 * Useful for resuming background tasks or rehydrating data after inactivity or connectivity loss.
 *
 * @param onReconnect Callback to invoke when a reconnect-like event occurs
 * @param options Optional configuration (e.g., debounceMs to coalesce rapid double-fires)
 */
export const useOnReconnect = (
  onReconnect: () => void,
  options: Options = {}
) => {
  const { debounceMs = 0 } = options;
  const appState = useAppState();
  const prevAppStateRef = useRef<string | undefined>(undefined);
  const { isConnected, isInternetReachable } = useNetInfo();
  const lastFiredAtRef = useRef<number>(0);

  const maybeFire = useCallback(() => {
    const now = Date.now();
    if (debounceMs && now - lastFiredAtRef.current < debounceMs) return;
    lastFiredAtRef.current = now;
    onReconnect();
  }, [debounceMs, onReconnect]);

  useEffect(() => {
    const prev = prevAppStateRef.current;
    prevAppStateRef.current = appState;
    if ((prev === "inactive" || prev === "background") && appState === "active")
      maybeFire();
  }, [appState, maybeFire]);

  useEffect(() => {
    const online = !!isConnected && !!isInternetReachable;
    if (online) maybeFire();
  }, [isConnected, isInternetReachable, maybeFire]);
};
