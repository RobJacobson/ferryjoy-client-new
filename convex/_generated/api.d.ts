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
import type * as functions_index from "../functions/index.js";
import type * as functions_predictions_actions from "../functions/predictions/actions.js";
import type * as functions_predictions_index from "../functions/predictions/index.js";
import type * as functions_predictions_mutations from "../functions/predictions/mutations.js";
import type * as functions_predictions_queries from "../functions/predictions/queries.js";
import type * as functions_predictions_types from "../functions/predictions/types.js";
import type * as functions_vesselLocation_actions from "../functions/vesselLocation/actions.js";
import type * as functions_vesselLocation_index from "../functions/vesselLocation/index.js";
import type * as functions_vesselLocation_mutations from "../functions/vesselLocation/mutations.js";
import type * as functions_vesselLocation_queries from "../functions/vesselLocation/queries.js";
import type * as functions_vesselPings_actions from "../functions/vesselPings/actions.js";
import type * as functions_vesselPings_index from "../functions/vesselPings/index.js";
import type * as functions_vesselPings_mutations from "../functions/vesselPings/mutations.js";
import type * as functions_vesselPings_queries from "../functions/vesselPings/queries.js";
import type * as functions_vesselTrips_actions from "../functions/vesselTrips/actions.js";
import type * as functions_vesselTrips_index from "../functions/vesselTrips/index.js";
import type * as functions_vesselTrips_mutations from "../functions/vesselTrips/mutations.js";
import type * as functions_vesselTrips_queries from "../functions/vesselTrips/queries.js";
import type * as functions_vesselTrips_schemas from "../functions/vesselTrips/schemas.js";
import type * as ml_actions from "../ml/actions.js";
import type * as ml_index from "../ml/index.js";
import type * as ml_pipeline_encode from "../ml/pipeline/encode.js";
import type * as ml_pipeline_load from "../ml/pipeline/load.js";
import type * as ml_pipeline_train from "../ml/pipeline/train.js";
import type * as ml_predict from "../ml/predict.js";
import type * as ml_shared from "../ml/shared.js";
import type * as ml_train from "../ml/train.js";
import type * as ml_types from "../ml/types.js";

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
  "functions/index": typeof functions_index;
  "functions/predictions/actions": typeof functions_predictions_actions;
  "functions/predictions/index": typeof functions_predictions_index;
  "functions/predictions/mutations": typeof functions_predictions_mutations;
  "functions/predictions/queries": typeof functions_predictions_queries;
  "functions/predictions/types": typeof functions_predictions_types;
  "functions/vesselLocation/actions": typeof functions_vesselLocation_actions;
  "functions/vesselLocation/index": typeof functions_vesselLocation_index;
  "functions/vesselLocation/mutations": typeof functions_vesselLocation_mutations;
  "functions/vesselLocation/queries": typeof functions_vesselLocation_queries;
  "functions/vesselPings/actions": typeof functions_vesselPings_actions;
  "functions/vesselPings/index": typeof functions_vesselPings_index;
  "functions/vesselPings/mutations": typeof functions_vesselPings_mutations;
  "functions/vesselPings/queries": typeof functions_vesselPings_queries;
  "functions/vesselTrips/actions": typeof functions_vesselTrips_actions;
  "functions/vesselTrips/index": typeof functions_vesselTrips_index;
  "functions/vesselTrips/mutations": typeof functions_vesselTrips_mutations;
  "functions/vesselTrips/queries": typeof functions_vesselTrips_queries;
  "functions/vesselTrips/schemas": typeof functions_vesselTrips_schemas;
  "ml/actions": typeof ml_actions;
  "ml/index": typeof ml_index;
  "ml/pipeline/encode": typeof ml_pipeline_encode;
  "ml/pipeline/load": typeof ml_pipeline_load;
  "ml/pipeline/train": typeof ml_pipeline_train;
  "ml/predict": typeof ml_predict;
  "ml/shared": typeof ml_shared;
  "ml/train": typeof ml_train;
  "ml/types": typeof ml_types;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
