import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";
import { TAGS } from "./content";

/** Invalidate cached content and the rendered public pages after an admin save. */
export function revalidateContent(...tags: (keyof typeof TAGS)[]) {
  for (const t of tags) revalidateTag(TAGS[t]);
  revalidatePath("/", "layout");
}
