import type { Category } from "../lib/types.ts";

export const telFax: Category = {
  id: "tel-fax",
  title: "12. 電話番号 (Telephone) — fax",
  fields: [
    { autocomplete: "fax tel", type: "tel" },
  ],
};
