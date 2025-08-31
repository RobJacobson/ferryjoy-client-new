import { useConvex } from "convex/react";
import type { PropsWithChildren } from "react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useOnReconnect } from "@/shared/hooks/useOnReconnect";

type Mode = "refresh" | "incremental";

type RollingProviderOptions = {
  intervalMs?: number;
  staleMs?: number;
  windowMs?: number;
  logTag?: string;
};

type RollingContextValue<S> = {
  data: S;
  latestMs: number;
  refresh: () => Promise<void>;
};

export const createRollingProvider = <S, T>(config: {
  name: string;
  initialState: S;
  getSinceMs: (state: S) => number;
  reduceAndPrune: (state: S, items: T[], windowMs: number) => S;
  fetchFn: (
    mode: Mode,
    sinceMs: number,
    client: ReturnType<typeof useConvex>
  ) => Promise<T[]>;
  options?: RollingProviderOptions;
}) => {
  const {
    name,
    initialState,
    getSinceMs,
    reduceAndPrune,
    fetchFn,
    options = {},
  } = config;

  const {
    intervalMs = 60_000,
    staleMs = 150_000,
    windowMs = 20 * 60_000,
    logTag = name,
  } = options;

  const Ctx = createContext<RollingContextValue<S> | undefined>(undefined);
  Ctx.displayName = `${name}RollingContext`;

  const Provider = ({ children }: PropsWithChildren) => {
    const convex = useConvex();
    const [state, setState] = useState<S>(initialState);
    const latestMs = useMemo(() => getSinceMs(state), [state]);
    const isFetching = useRef(false);

    const doFetch = async (mode: Mode) => {
      if (isFetching.current) return;
      isFetching.current = true;
      try {
        const sinceMs = mode === "refresh" ? Date.now() - windowMs : latestMs;
        const items = await fetchFn(mode, sinceMs, convex);
        if (items.length > 0) {
          setState((prev) => reduceAndPrune(prev, items, windowMs));
        }
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          // eslint-disable-next-line no-console
          console.error(`${logTag}: fetch failed`, error);
        }
      } finally {
        isFetching.current = false;
      }
    };

    // biome-ignore lint/correctness/useExhaustiveDependencies: controlled scheduling
    useEffect(() => {
      const id = setInterval(() => {
        if (latestMs === 0 || Date.now() - latestMs > staleMs) {
          void doFetch("refresh");
        } else {
          void doFetch("incremental");
        }
      }, intervalMs);
      return () => clearInterval(id);
    }, [intervalMs, staleMs, latestMs]);

    // biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount
    useEffect(() => {
      void doFetch("refresh");
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useOnReconnect(() => {
      if (isFetching.current) return;
      void doFetch("refresh");
    });

    const refresh = async () => {
      await doFetch("refresh");
    };

    return (
      <Ctx.Provider value={{ data: state, latestMs, refresh }}>
        {children}
      </Ctx.Provider>
    );
  };

  const useData = () => {
    const ctx = useContext(Ctx);
    if (!ctx)
      throw new Error(`use${name}Data must be used within ${name} Provider`);
    return ctx;
  };

  const withData =
    <P extends object>(Component: (props: P & { data: S }) => JSX.Element) =>
    (props: P) => {
      const { data } = useData();
      return <Component {...props} data={data} />;
    };

  return { Provider, useData, withData } as const;
};
