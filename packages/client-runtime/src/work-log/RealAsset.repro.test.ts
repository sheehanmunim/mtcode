import { describe, expect, it } from "@effect/vitest";
import { ThreadId } from "@t3tools/contracts";
import { resolveViewedImageAsset } from "./presentation.js";

const DIR = "/Users/sheehanmunim/.codex/generated_images/01a0893b-2df3-73e0-b009-b5f547325e20";
const threadId = ThreadId.make("c07e49f7-4994-4249-8426-6274f320f3ae");

describe("the four generated skies, with this thread's real workspace root", () => {
  for (const file of [
    "exec-604b7e89-aef5-438f-bcef-feb3518c1a98.png", // the one that renders today
    "exec-dc0d3aac-2795-4d12-bc45-3579cfbad524.png",
    "exec-d0998d72-2904-4bd0-b57f-92a4f513b1b8.png",
    "exec-74562a72-ee75-4ef2-acd4-af8ef1720842.png",
    "exec-6023c2d0-70ec-4fe8-a60c-c39becc1ad75.png",
  ]) {
    it(`resolves ${file}`, () => {
      const asset = resolveViewedImageAsset(`${DIR}/${file}`, {
        threadId,
        workspaceRoot: "/Users/sheehanmunim",
      });
      expect(asset).not.toBeNull();
    });
  }
});
