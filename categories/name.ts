import type { Category } from "../lib/types.ts";

export const name: Category = {
  id: "name",
  title: "2. 氏名 (Name)",
  fields: [
    { autocomplete: "name", type: "text" },
    { autocomplete: "honorific-prefix", type: "text" },
    { autocomplete: "given-name", type: "text" },
    { autocomplete: "additional-name", type: "text" },
    { autocomplete: "family-name", type: "text" },
    { autocomplete: "honorific-suffix", type: "text" },
    { autocomplete: "nickname", type: "text" },
  ],
};
