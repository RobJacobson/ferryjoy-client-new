/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as crons from "../crons.js";
import type * as index from "../index.js";
import type * as lib_fetchServer from "../lib/fetchServer.js";
import type * as vesselLocations_index from "../vesselLocations/index.js";
import type * as vesselLocations_vesselLocationActions from "../vesselLocations/vesselLocationActions.js";
import type * as vesselLocations_vesselLocationHelpers from "../vesselLocations/vesselLocationHelpers.js";
import type * as vesselLocations_vesselLocationMutations from "../vesselLocations/vesselLocationMutations.js";
import type * as vesselLocations_vesselLocationQueries from "../vesselLocations/vesselLocationQueries.js";
import type * as vesselLocations_vesselLocationValidation from "../vesselLocations/vesselLocationValidation.js";
import type * as vesselLocationsCurrent_index from "../vesselLocationsCurrent/index.js";
import type * as vesselLocationsCurrent_vesselLocationCurrentActions from "../vesselLocationsCurrent/vesselLocationCurrentActions.js";
import type * as vesselLocationsCurrent_vesselLocationCurrentHelpers from "../vesselLocationsCurrent/vesselLocationCurrentHelpers.js";
import type * as vesselLocationsCurrent_vesselLocationCurrentMutations from "../vesselLocationsCurrent/vesselLocationCurrentMutations.js";
import type * as vesselLocationsCurrent_vesselLocationCurrentQueries from "../vesselLocationsCurrent/vesselLocationCurrentQueries.js";
import type * as vesselLocationsCurrent_vesselLocationCurrentValidation from "../vesselLocationsCurrent/vesselLocationCurrentValidation.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  crons: typeof crons;
  index: typeof index;
  "lib/fetchServer": typeof lib_fetchServer;
  "vesselLocations/index": typeof vesselLocations_index;
  "vesselLocations/vesselLocationActions": typeof vesselLocations_vesselLocationActions;
  "vesselLocations/vesselLocationHelpers": typeof vesselLocations_vesselLocationHelpers;
  "vesselLocations/vesselLocationMutations": typeof vesselLocations_vesselLocationMutations;
  "vesselLocations/vesselLocationQueries": typeof vesselLocations_vesselLocationQueries;
  "vesselLocations/vesselLocationValidation": typeof vesselLocations_vesselLocationValidation;
  "vesselLocationsCurrent/index": typeof vesselLocationsCurrent_index;
  "vesselLocationsCurrent/vesselLocationCurrentActions": typeof vesselLocationsCurrent_vesselLocationCurrentActions;
  "vesselLocationsCurrent/vesselLocationCurrentHelpers": typeof vesselLocationsCurrent_vesselLocationCurrentHelpers;
  "vesselLocationsCurrent/vesselLocationCurrentMutations": typeof vesselLocationsCurrent_vesselLocationCurrentMutations;
  "vesselLocationsCurrent/vesselLocationCurrentQueries": typeof vesselLocationsCurrent_vesselLocationCurrentQueries;
  "vesselLocationsCurrent/vesselLocationCurrentValidation": typeof vesselLocationsCurrent_vesselLocationCurrentValidation;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
