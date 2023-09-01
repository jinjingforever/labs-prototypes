/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  InputValues,
  OutputValues,
} from "@google-labs/graph-runner";

export type DivOutputs = {
  result: number;
};

export type DivInputs = {
  x: number;
  y: number;
};

export default async (inputs: InputValues): Promise<OutputValues> => {
  const { x, y } = inputs as DivInputs;
  return {result: x/y};
};
