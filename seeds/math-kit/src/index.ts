/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Math } from "./math.js";
export default Math;
export { Math };
export type {
  AddNodeType,
  SubNodeType,
  MulNodeType,
  DivNodeType,
} from "./math.js";

const w = window as any;
if (w['breadboard'] == null) {
  w['breadboard'] = {};
}
w['breadboard']['Math'] = Math;
