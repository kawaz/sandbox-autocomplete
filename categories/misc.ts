import type { Category } from "../lib/types.ts";

export const misc: Category = {
  id: "misc",
  title: "16. その他 (Miscellaneous)",
  fields: [
    { autocomplete: "sex", type: "text" },
    { autocomplete: "url", type: "url" },
    { autocomplete: "photo", type: "url" },
    { autocomplete: "language", type: "text" },
  ],
};
