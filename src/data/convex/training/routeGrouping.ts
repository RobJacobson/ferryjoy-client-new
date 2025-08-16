import type { RouteGroup, TrainingExample } from "./types";

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Groups training examples by route ID
 * Designed for reduce: (groups, example) => groups
 */
export const groupExamplesByRoute = (
  groups: RouteGroup[],
  example: TrainingExample
): RouteGroup[] => {
  const existingGroup = groups.find((g) => g.routeId === example.routeId);

  if (existingGroup) {
    existingGroup.examples.push(example);
    return groups;
  } else {
    return [...groups, { routeId: example.routeId, examples: [example] }];
  }
};

/**
 * Filters routes that have sufficient training data
 * Designed for filter: (group) => boolean
 */
export const filterRoutesWithMinData =
  (minExamples: number) =>
  (group: RouteGroup): boolean =>
    group.examples.length >= minExamples;
