declare module "ml-regression" {
  export class MultivariateLinearRegression {
    constructor(
      x: number[][],
      y: number[][],
      options?: { intercept?: boolean; statistics?: boolean }
    );
    predict(x: number[]): number;
    weights: number[][];
    intercept: boolean;
    inputs: number;
    outputs: number;
  }
}
