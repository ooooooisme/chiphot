// Stories withheld at the publication layer while their evidence may still be public on item pages.
import { HIDDEN_STORY_PUBLIC_IDS } from "@aihot/site";

const hidden = new Set(HIDDEN_STORY_PUBLIC_IDS.map((id) => id.toLowerCase()));

export function isHiddenStory(publicId: string): boolean {
  return hidden.has(publicId.toLowerCase());
}