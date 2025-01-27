/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { config } from "dotenv";

import { Board } from "@google-labs/breadboard";
import { Starter } from "@google-labs/llm-starter";

import { PromptMaker } from "./template.js";

config();

const maker = new PromptMaker("v2-multi-agent");
const board = new Board();
const kit = board.addKit(Starter);

const menu = kit.promptTemplate(
  ...(await maker.prompt("menu-agent", "menuAgent"))
);
menu.wire("<-menu.", board.passthrough(await maker.part("menu", "txt")));
menu.wire(
  "<-menu-format.",
  board.passthrough(await maker.part("menu-format", "json"))
);
menu.wire(
  "<-menu-not-found.",
  board.passthrough(await maker.part("menu-not-found", "json"))
);

function parseResponse({ completion }: { completion: string }) {
  return { bot: JSON.parse(completion) };
}

board.input().wire(
  "customer->",
  menu.wire(
    "prompt->text",
    kit
      .generateText({
        stopSequences: ["Customer:"],
      })
      .wire("filters->error", board.output({ $id: "error" }))
      .wire("<-PALM_KEY", kit.secrets(["PALM_KEY"]))
      .wire(
        "completion->",
        kit
          .runJavascript("parseResponse", {
            $id: "parseResponse",
            code: parseResponse.toString(),
            raw: true,
          })
          .wire("bot->", board.output({ $id: "bot" }))
      )
  )
);

export const menuAgent = board;
