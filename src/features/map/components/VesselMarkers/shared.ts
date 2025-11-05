import type { VesselLocation } from "ws-dottie";

type BottomSheetItem = {
  id: string;
  name: string;
  type: "vessel" | "terminal";
  data: VesselLocation;
};

/**
 * Configuration constants for vessel markers
 */
export const VESSEL_MARKER_CONFIG = {
  ZOOM_THRESHOLD: 6,
} as const;

/**
 * Check if vessels should be shown based on zoom level
 */
export const shouldShowVessels = (zoom: number): boolean =>
  zoom >= VESSEL_MARKER_CONFIG.ZOOM_THRESHOLD;

/**
 * Generate vessel display name with fallback
 */
export const getVesselDisplayName = (vessel: VesselLocation): string =>
  vessel.VesselName || `Vessel ${vessel.VesselID}`;

/**
 * Create vessel press handler for opening bottom sheet
 */
export const createVesselPressHandler =
  (vessel: VesselLocation, openBottomSheet: (item: BottomSheetItem) => void) =>
  () => {
    openBottomSheet({
      id: vessel.VesselID.toString(),
      name: getVesselDisplayName(vessel),
      type: "vessel",
      data: vessel,
    });
  };
