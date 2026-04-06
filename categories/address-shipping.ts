import type { Category } from "../lib/types.ts";

export const addressShipping: Category = {
  id: "address-shipping",
  title: "5. 住所 (Address) — shipping",
  fields: [
    { autocomplete: "shipping street-address", type: "text", tag: "textarea" },
    { autocomplete: "shipping address-line1", type: "text" },
    { autocomplete: "shipping address-line2", type: "text" },
    { autocomplete: "shipping address-line3", type: "text" },
    { autocomplete: "shipping address-level4", type: "text" },
    { autocomplete: "shipping address-level3", type: "text" },
    { autocomplete: "shipping address-level2", type: "text" },
    { autocomplete: "shipping address-level1", type: "text" },
    { autocomplete: "shipping country", type: "text" },
    { autocomplete: "shipping country-name", type: "text" },
    { autocomplete: "shipping postal-code", type: "text" },
  ],
};
