import type React from "react";
import { createContext, type ReactNode, useContext, useState } from "react";

type BottomSheetItem = {
  id: string;
  name: string;
  type: "vessel" | "terminal";
  data?: any;
};

type BottomSheetContextType = {
  isOpen: boolean;
  currentItem: BottomSheetItem | null;
  openBottomSheet: (item: BottomSheetItem) => void;
  closeBottomSheet: () => void;
};

const BottomSheetContext = createContext<BottomSheetContextType | undefined>(
  undefined
);

/**
 * Provider component for bottom sheet state management
 */
export const BottomSheetProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<BottomSheetItem | null>(null);

  const openBottomSheet = (item: BottomSheetItem) => {
    setCurrentItem(item);
    setIsOpen(true);
  };

  const closeBottomSheet = () => {
    setIsOpen(false);
    setCurrentItem(null);
  };

  return (
    <BottomSheetContext.Provider
      value={{
        isOpen,
        currentItem,
        openBottomSheet,
        closeBottomSheet,
      }}
    >
      {children}
    </BottomSheetContext.Provider>
  );
};

/**
 * Hook to use the bottom sheet context
 */
export const useBottomSheet = () => {
  const context = useContext(BottomSheetContext);
  if (context === undefined) {
    throw new Error("useBottomSheet must be used within a BottomSheetProvider");
  }
  return context;
};
