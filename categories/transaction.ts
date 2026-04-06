import type { Category } from "../lib/types.ts";

export const transaction: Category = {
  id: "transaction",
  title: "8. 取引 (Transaction)",
  fields: [
    { autocomplete: "transaction-currency", type: "text" },
    { autocomplete: "transaction-amount", type: "number" },
  ],
};
