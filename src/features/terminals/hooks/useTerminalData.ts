/**
 * Hook for terminal data management
 * Provides terminal data with wait times, space availability, and filtering capabilities
 */
export const useTerminalData = () => {
  // TODO: Replace with actual terminal data from WSF API
  const mockTerminals = [
    { id: 1, name: "Seattle", waitTime: 15, spaceAvailable: 45 },
    { id: 2, name: "Bainbridge", waitTime: 5, spaceAvailable: 80 },
    { id: 3, name: "Bremerton", waitTime: 25, spaceAvailable: 20 },
  ];

  const highWaitTimeTerminals = mockTerminals.filter(
    (terminal) => terminal.waitTime > 10
  );

  const lowSpaceTerminals = mockTerminals.filter(
    (terminal) => terminal.spaceAvailable < 50
  );

  return {
    allTerminals: mockTerminals,
    highWaitTimeTerminals,
    lowSpaceTerminals,
    totalTerminals: mockTerminals.length,
    averageWaitTime:
      mockTerminals.reduce((sum, t) => sum + t.waitTime, 0) /
      mockTerminals.length,
  };
};
