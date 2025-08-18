const REFERENCE_TIME = new Date(2025, 0, 1);

export const toNormalizedMinutes = (date: Date): number =>
  (REFERENCE_TIME.getTime() - date.getTime()) / (60 * 1000);

export const fromNormalizedMinutes = (minutes: number): Date =>
  new Date(REFERENCE_TIME.getTime() + minutes * 60 * 1000);
