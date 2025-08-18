declare module "ml-regression-multivariate-linear" {
  export default class MLR {
    constructor(
      x: number[][],
      y: number[][],
      options?: { intercept?: boolean }
    );
    weights: number[][];
    predict(x: number[]): number;
  }
}
