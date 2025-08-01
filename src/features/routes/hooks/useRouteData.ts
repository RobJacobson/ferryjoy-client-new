/**
 * Hook for route data management
 * Provides route data with schedules, filtering, and search capabilities
 */
export const useRouteData = () => {
  // TODO: Replace with actual route data from WSF API
  const mockRoutes = [
    {
      id: 1,
      name: "Seattle ↔ Bainbridge Island",
      duration: 35,
      frequency: "Every 1-2 hours",
      status: "active",
      nextDeparture: "6:30 AM",
    },
    {
      id: 2,
      name: "Seattle ↔ Bremerton",
      duration: 60,
      frequency: "Every 1 hour",
      status: "active",
      nextDeparture: "7:00 AM",
    },
  ];

  const activeRoutes = mockRoutes.filter((route) => route.status === "active");

  return {
    allRoutes: mockRoutes,
    activeRoutes,
    totalRoutes: mockRoutes.length,
    activeCount: activeRoutes.length,
  };
};
