import type { Category } from "../lib/types.ts";

export const addressBilling: Category = {
  id: "address-billing",
  title: "6. 住所 (Address) — billing",
  fields: [
    { autocomplete: "billing address-line1", type: "text" },
    { autocomplete: "billing address-line2", type: "text" },
    { autocomplete: "billing address-level2", type: "text" },
    { autocomplete: "billing address-level1", type: "text" },
    { autocomplete: "billing country", type: "text" },
    { autocomplete: "billing postal-code", type: "text" },
  ],
};
