/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Converts `GraphDescriptor` to Mermaid format
 */

import type { Edge, GraphDescriptor, NodeDescriptor } from "./types.js";

const template = (edges: string, direction: string) => {
  return `%%{init: 'themeVariables': { 'fontFamily': 'Fira Code, monospace' }}%%
graph ${direction};
${edges}
classDef default stroke:#ffab40,fill:#fff2ccff,color:#000
classDef input stroke:#3c78d8,fill:#c9daf8ff,color:#000
classDef output stroke:#38761d,fill:#b6d7a8ff,color:#000
classDef passthrough stroke:#a64d79,fill:#ead1dcff,color:#000
classDef slot stroke:#a64d79,fill:#ead1dcff,color:#000
classDef config stroke:#a64d79,fill:#ead1dcff,color:#000
classDef secrets stroke:#db4437,fill:#f4cccc,color:#000
classDef slotted stroke:#a64d79`;
};

const properNodeId = (node: string) => {
  // Mermaid gets confused by hyphens in node ids
  // For example `get-graph` id will throw a syntax error, because it thinks
  // that it sees the `graph` token.
  return node && node.replace(/-/g, "");
};

const shape = (descriptor?: NodeDescriptor, idPrefix = "") => {
  if (!descriptor) return "";
  const node = descriptor.id;
  const prefix = idPrefix ? `${properNodeId(idPrefix)}_` : "";
  const nodeId = `${prefix}${properNodeId(node)}`;
  const nodeType = descriptor.type;
  const text = `"${nodeType} <br> id='${node}'"`;
  switch (nodeType) {
    case "include":
      return `${nodeId}[[${text}]]:::include`;
    case "slot":
      return `${nodeId}((${text})):::slot`;
    case "passthrough":
      return `${nodeId}((${text})):::passthrough`;
    case "input":
      return `${nodeId}[/${text}/]:::input`;
    case "secrets":
      return `${nodeId}(${text}):::secrets`;
    case "output":
      return `${nodeId}{{${text}}}:::output`;
    default:
      return `${nodeId}[${text}]`;
  }
};

type NodeMap = Map<string, NodeDescriptor>;

const describeEdge = (edge: Edge, nodeMap: NodeMap, idPrefix = "") => {
  const from = edge.from;
  const fromNode = shape(nodeMap.get(from), idPrefix);
  const to = edge.to;
  const toNode = shape(nodeMap.get(to), idPrefix);
  const input = edge.in;
  const output = edge.out;
  const optional = edge.optional;
  const constant = edge.constant;
  if (output === "*") {
    return `${fromNode} -- all --> ${toNode}`;
  }
  if (output && input) {
    if (optional) return `${fromNode} -. "${output}->${input}" .-> ${toNode}`;
    if (constant) return `${fromNode} -- "${output}->${input}" --o ${toNode}`;
    return `${fromNode} -- "${output}->${input}" --> ${toNode}`;
  }
  return `${fromNode} --> ${toNode}`;
};

function describeSubgraph(
  subgraph: GraphDescriptor,
  name: string,
  edgeName: string,
  fromNode: NodeDescriptor,
  idPrefix: string
) {
  const subgraphNodeMap: NodeMap = new Map(
    subgraph.nodes.map((node: NodeDescriptor) => [node.id, node])
  );
  const subgraphEdges = subgraph.edges.map((edge: Edge) =>
    describeEdge(edge, subgraphNodeMap, idPrefix)
  );
  return `\nsubgraph ${name}\n${subgraphEdges.join(
    "\n"
  )}\nend\n${name}:::slotted -- "${edgeName}->${edgeName}" --o ${properNodeId(
    fromNode.id
  )}\n`;
}

const handleSlotted = (fromNode: NodeDescriptor) => {
  const type = fromNode.type;
  if (type !== "include") return "";
  const slotted = fromNode.configuration?.slotted;
  if (!slotted) return "";
  const subgraphs = Object.entries(slotted).map(([name, subgraph]) =>
    describeSubgraph(subgraph, name, "slotted", fromNode, fromNode.id)
  );
  return subgraphs.join("\n");
};

const handleLambda = (fromNode: NodeDescriptor) => {
  const board = fromNode.configuration?.board;
  if (!board) return "";
  type BoardCapability = { kind: "board"; board: GraphDescriptor };
  const capability = board as BoardCapability;
  if (capability.kind !== "board") return "";
  const graph = capability.board;
  return describeSubgraph(graph, fromNode.id, "lamdba", fromNode, fromNode.id);
};

const describeSubgraphs = (edge: Edge, nodeMap: NodeMap) => {
  const fromNode = nodeMap.get(edge.from);
  if (!fromNode) return "";
  const lamdba = handleLambda(fromNode);
  const slotted = handleSlotted(fromNode);
  return `${slotted}${lamdba}`;
};

const describeGraph = (graph: GraphDescriptor) => {
  const { edges, nodes } = graph;
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const result = edges.map((edge) => {
    const mermEdge = describeEdge(edge, nodeMap);
    const mermSubgraphs = describeSubgraphs(edge, nodeMap);
    return `${mermEdge}${mermSubgraphs}`;
  });
  const constants = nodes
    .map((node) => {
      return Object.keys(node.configuration || {}).map((name) => {
        if (name === "slotted") return "";
        if (name === "board") return "";
        return `${properNodeId(
          `${name}${node.id}`
        )}[${name}]:::config -- "${name}->${name}" --o ${properNodeId(
          node.id
        )}`;
      });
    })
    .flat();
  return [...result, ...constants].join("\n");
};

export const toMermaid = (graph: GraphDescriptor, direction = "TD") => {
  const edges = describeGraph(graph);
  return template(edges, direction);
};
