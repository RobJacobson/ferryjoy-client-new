// Converter function for valid date range

import { parseWsfDate } from "../../../shared/utils";
import type { ValidDateRange } from "./types";

/**
 * Raw API response type for valid date range
 */
export type WsfValidDateRangeResponse = {
  StartDate: string;
  EndDate: string;
};

/**
 * Converts WSF API valid date range response to domain model
 * Returns null if no data is provided
 */
export const toValidDateRange = (
  data: WsfValidDateRangeResponse | null
): ValidDateRange | null => {
  if (!data) return null;

  return {
    startDate: parseWsfDate(data.StartDate),
    endDate: parseWsfDate(data.EndDate),
  };
};
