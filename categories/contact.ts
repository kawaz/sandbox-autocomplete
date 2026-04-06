import type { Category } from "../lib/types.ts";

export const contact: Category = {
  id: "contact",
  title: "14. 連絡先 (Contact)",
  fields: [
    { autocomplete: "email", type: "email" },
    { autocomplete: "home email", type: "email" },
    { autocomplete: "work email", type: "email" },
    { autocomplete: "impp", type: "url" },
  ],
};
