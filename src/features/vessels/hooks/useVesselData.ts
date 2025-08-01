import { useVesselLocations } from "@/data/contexts";

/**
 * Hook for vessel data management
 * Provides enhanced vessel data with filtering, sorting, and search capabilities
 */
export const useVesselData = () => {
  const { vesselLocations } = useVesselLocations();

  // TODO: Add filtering, sorting, and search functionality
  const inServiceVessels = vesselLocations.filter((vessel) => vessel.InService);

  const outOfServiceVessels = vesselLocations.filter(
    (vessel) => !vessel.InService
  );

  return {
    allVessels: vesselLocations,
    inServiceVessels,
    outOfServiceVessels,
    totalVessels: vesselLocations.length,
    inServiceCount: inServiceVessels.length,
    outOfServiceCount: outOfServiceVessels.length,
  };
};
