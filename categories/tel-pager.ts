import type { Category } from "../lib/types.ts";

export const telPager: Category = {
  id: "tel-pager",
  title: "13. 電話番号 (Telephone) — pager",
  fields: [
    { autocomplete: "pager tel", type: "tel" },
  ],
};
