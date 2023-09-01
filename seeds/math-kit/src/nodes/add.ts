/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  InputValues,
  OutputValues,
} from "@google-labs/graph-runner";

export type AddOutputs = {
  result: number;
};

export type AddInputs = {
  x: number;
  y: number;
};

export default async (inputs: InputValues): Promise<OutputValues> => {
  const { x, y } = inputs as AddInputs;
  return {result: x+y};
};
