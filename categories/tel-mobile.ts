import type { Category } from "../lib/types.ts";

export const telMobile: Category = {
  id: "tel-mobile",
  title: "11. 電話番号 (Telephone) — mobile",
  fields: [
    { autocomplete: "mobile tel", type: "tel" },
  ],
};
