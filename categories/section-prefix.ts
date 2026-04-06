import type { Category } from "../lib/types.ts";

export const sectionPrefix: Category = {
  id: "section-prefix",
  title: "17. section- プレフィックスのデモ",
  note: '<code>section-*</code> プレフィックスを使うと、同一フォーム内で同じフィールドを複数の独立グループに分けられます。',
  separatorAfter: 2, // index 2 (section-blue email) の後にセパレータ
  fields: [
    { autocomplete: "section-blue given-name", type: "text" },
    { autocomplete: "section-blue family-name", type: "text" },
    { autocomplete: "section-blue email", type: "email" },
    { autocomplete: "section-red given-name", type: "text" },
    { autocomplete: "section-red family-name", type: "text" },
    { autocomplete: "section-red email", type: "email" },
  ],
};
