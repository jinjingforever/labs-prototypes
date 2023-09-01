/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import type {BreadboardNode, Kit, NodeFactory, OptionalIdConfiguration,} from '@google-labs/breadboard';
import {NodeHandlers} from '@google-labs/graph-runner';

import add, {AddInputs, AddOutputs} from './nodes/add.js';
import div, {DivInputs, DivOutputs} from './nodes/div.js';
import mul, {MulInputs, MulOutputs} from './nodes/mul.js';
import sub, {SubInputs, SubOutputs} from './nodes/sub.js';

const coreHandlers = {
  add,
  sub,
  mul,
  div,
};

/**
 * Syntactic sugar around the `coreHandlers` library.
 */
export class Math implements Kit {
  url = 'npm:@google-labs/math-kit';
  #nodeFactory: NodeFactory;
  #handlers: NodeHandlers;

  get handlers() {
    return this.#handlers;
  }

  constructor(nodeFactory: NodeFactory) {
    this.#nodeFactory = nodeFactory;
    this.#handlers = coreHandlers;
  }

  add<In = AddInputs>(config: OptionalIdConfiguration = {}):
      BreadboardNode<In, AddOutputs> {
    const {$id, ...rest} = config;
    return this.#nodeFactory.create('add', {...rest}, $id);
  }

  sub<In = SubInputs>(config: OptionalIdConfiguration = {}):
      BreadboardNode<In, SubOutputs> {
    const {$id, ...rest} = config;
    return this.#nodeFactory.create('sub', {...rest}, $id);
  }

  mul<In = MulInputs>(config: OptionalIdConfiguration = {}):
      BreadboardNode<In, MulOutputs> {
    const {$id, ...rest} = config;
    return this.#nodeFactory.create('mul', {...rest}, $id);
  }

  div<In = DivInputs>(config: OptionalIdConfiguration = {}):
      BreadboardNode<In, DivOutputs> {
    const {$id, ...rest} = config;
    return this.#nodeFactory.create('div', {...rest}, $id);
  }
}

export type AddNodeType = ReturnType<Math['add']>;
export type SubNodeType = ReturnType<Math['sub']>;
export type MulNodeType = ReturnType<Math['mul']>;
export type DivNodeType = ReturnType<Math['div']>;
