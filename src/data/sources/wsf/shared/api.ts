// WSF API Utilities

export type WsfDateString = string;

/**
 * Parses WSF API date strings in format "/Date(1750981529000-0700)/" to JavaScript Date objects
 */
export const parseWsfDate = (dateString: WsfDateString) => {
  // Extract timestamp portion: /Date(1750981529000-0700)/ -> 1750981529000
  const middle = dateString.slice(6, 19);
  const timestamp = parseInt(middle);
  return new Date(timestamp);
};
