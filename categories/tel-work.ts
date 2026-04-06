import type { Category } from "../lib/types.ts";

export const telWork: Category = {
  id: "tel-work",
  title: "10. 電話番号 (Telephone) — work",
  fields: [
    { autocomplete: "work tel", type: "tel" },
    { autocomplete: "work tel-extension", type: "tel" },
  ],
};
