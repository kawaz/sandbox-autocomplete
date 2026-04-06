import type { Category } from "../lib/types.ts";

export const birthday: Category = {
  id: "birthday",
  title: "15. 誕生日 (Birthday)",
  fields: [
    { autocomplete: "bday", type: "date" },
    { autocomplete: "bday-day", type: "number" },
    { autocomplete: "bday-month", type: "number" },
    { autocomplete: "bday-year", type: "number" },
  ],
};
