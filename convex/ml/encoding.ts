// ============================================================================
// GENERIC FEATURE ENCODING UTILITIES
// ============================================================================

import type { FeatureNames, FeatureVector } from "./types";

/**
 * Generic utility for flattening nested objects into dot-notation feature names
 * Converts structured features into flat key-value pairs for ML models
 *
 * @param obj - Object to flatten
 * @param prefix - Prefix for feature names (e.g., "hourOfDay", "terminal")
 * @returns Record with dot-notation keys and numeric values
 */
export const flattenObject = (
  obj: Record<string, unknown>,
  prefix: string
): Record<string, number> => {
  return Object.entries(obj).reduce(
    (result, [key, value]) => {
      const featureName = `${prefix}.${key}`;

      if (typeof value === "number") {
        result[featureName] = value;
      } else if (Array.isArray(value)) {
        // Handle arrays (like hourOfDay [0,0,1,0,...])
        const arrayFeatures = Object.fromEntries(
          value.map((item, index) => [
            `${featureName}.${index.toString().padStart(2, "0")}`,
            item as number,
          ])
        );
        Object.assign(result, arrayFeatures);
      } else if (typeof value === "object" && value !== null) {
        // Recursively flatten nested objects
        const nested = flattenObject(
          value as Record<string, unknown>,
          featureName
        );
        Object.assign(result, nested);
      }

      return result;
    },
    {} as Record<string, number>
  );
};

/**
 * Validates that all feature vectors have identical keys
 * Ensures consistency across training examples for ML model training
 *
 * @param featureVectors - Array of feature vectors to validate
 * @returns Array of feature names in consistent order
 * @throws Error if feature vectors are inconsistent
 */
export const validateFeatureVectors = (
  featureVectors: FeatureVector[]
): FeatureNames => {
  if (featureVectors.length === 0) {
    throw new Error("Cannot validate empty feature vector array");
  }

  const firstKeys = Object.keys(featureVectors[0]).sort();
  const firstKeysSet = new Set(firstKeys);

  // Single loop with fail-fast approach
  for (let i = 1; i < featureVectors.length; i++) {
    const currentKeys = Object.keys(featureVectors[i]).sort();

    if (currentKeys.length !== firstKeys.length) {
      throw new Error(
        `Feature vector ${i} has ${currentKeys.length} features, expected ${firstKeys.length}. ` +
          `Expected: ${JSON.stringify(firstKeys)}. ` +
          `Actual: ${JSON.stringify(currentKeys)}`
      );
    }

    // Check if all keys match using set comparison
    if (!currentKeys.every((key) => firstKeysSet.has(key))) {
      throw new Error(
        `Feature vector ${i} has inconsistent feature names compared to the first vector. ` +
          `Expected: ${JSON.stringify(firstKeys)}. ` +
          `Actual: ${JSON.stringify(currentKeys)}`
      );
    }
  }

  return firstKeys;
};

/**
 * Generic feature encoding function that converts structured features to flat feature vectors
 * This is the main entry point for the encoding stage
 *
 * @param features - Structured features to encode
 * @returns Flattened feature vector with dot-notation naming
 */
export const encodeFeatures = (
  features: Record<string, unknown>
): FeatureVector => {
  return flattenObject(features, "");
};
