// Shared conversion helpers for manual, typed converters
export const toMs = (d: Date | null) => (d ? d.getTime() : undefined);

export const toDate = (n: number | undefined) =>
  n === undefined ? null : new Date(n);
