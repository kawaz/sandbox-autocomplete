import type { Category } from "../lib/types.ts";

export const telHome: Category = {
  id: "tel-home",
  title: "9. 電話番号 (Telephone) — home",
  fields: [
    { autocomplete: "home tel", type: "tel" },
    { autocomplete: "home tel-country-code", type: "tel" },
    { autocomplete: "home tel-national", type: "tel" },
    { autocomplete: "home tel-area-code", type: "tel" },
    { autocomplete: "home tel-local", type: "tel" },
    { autocomplete: "home tel-local-prefix", type: "tel" },
    { autocomplete: "home tel-local-suffix", type: "tel" },
    { autocomplete: "home tel-extension", type: "tel" },
  ],
};
