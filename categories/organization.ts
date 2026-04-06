import type { Category } from "../lib/types.ts";

export const organization: Category = {
  id: "organization",
  title: "4. 組織 (Organization)",
  fields: [
    { autocomplete: "organization-title", type: "text" },
    { autocomplete: "organization", type: "text" },
  ],
};
