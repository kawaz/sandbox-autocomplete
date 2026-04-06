import type { Category } from "../lib/types.ts";

export const creditCard: Category = {
  id: "credit-card",
  title: "7. クレジットカード (Credit Card)",
  fields: [
    { autocomplete: "cc-name", type: "text" },
    { autocomplete: "cc-given-name", type: "text" },
    { autocomplete: "cc-additional-name", type: "text" },
    { autocomplete: "cc-family-name", type: "text" },
    { autocomplete: "cc-number", type: "text", inputmode: "numeric" },
    { autocomplete: "cc-exp", type: "text", placeholder: "MM/YY" },
    { autocomplete: "cc-exp-month", type: "number" },
    { autocomplete: "cc-exp-year", type: "number" },
    { autocomplete: "cc-csc", type: "text", inputmode: "numeric", maxlength: "4" },
    { autocomplete: "cc-type", type: "text" },
  ],
};
