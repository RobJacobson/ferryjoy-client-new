import { vi } from "vitest";

// Mock react-native to avoid import issues in test environment
vi.mock("react-native", () => ({
  Platform: { OS: "web" },
  StyleSheet: { create: (styles: any) => styles },
  View: () => null,
  Text: () => null,
}));

// Note: We no longer need to mock these modules since we removed the react-native dependency
// The fetchInternal module now uses environment detection instead of Platform.OS

// Mock react-native-logs to avoid react-native dependency
vi.mock("react-native-logs", () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock logger module to avoid react-native-logs dependency
vi.mock("@/lib/logger", () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock document for JSONP tests
Object.defineProperty(window, "document", {
  value: {
    createElement: vi.fn(() => ({
      src: "",
      onerror: null,
      parentNode: null,
    })),
    head: {
      appendChild: vi.fn(),
      removeChild: vi.fn(),
    },
  },
  writable: true,
});

// Global test utilities
global.fetch = vi.fn();
