/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  InputValues,
  OutputValues,
} from "@google-labs/graph-runner";

export type MulOutputs = {
  result: number;
};

export type MulInputs = {
  x: number;
  y: number;
};

export default async (inputs: InputValues): Promise<OutputValues> => {
  const { x, y } = inputs as MulInputs;
  return {result: x*y};
};
