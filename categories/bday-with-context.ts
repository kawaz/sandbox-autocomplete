import type { Category } from "../lib/types.ts";

export const bdayWithContext: Category[] = [
  {
    id: "bday-with-name",
    title: "15b. bday + given-name",
    description: "given-name で補完発動 → bday が連動するか",
    fields: [
      { autocomplete: "given-name", type: "text", note: "← ここで補完を発動" },
      { autocomplete: "bday", type: "date", note: "bday が連動するか" },
    ],
  },
  {
    id: "bday-split-with-name",
    title: "15c. bday-day/month/year + given-name",
    description: "given-name で補完発動 → bday 分割フィールドが連動するか",
    fields: [
      { autocomplete: "given-name", type: "text", note: "← ここで補完を発動" },
      { autocomplete: "bday-year", type: "number", note: "bday-year" },
      { autocomplete: "bday-month", type: "number", note: "bday-month" },
      { autocomplete: "bday-day", type: "number", note: "bday-day" },
    ],
  },
  {
    id: "bday-with-address",
    title: "15d. bday + postal-code",
    description: "postal-code で補完発動 → bday が連動するか",
    fields: [
      { autocomplete: "postal-code", type: "text", note: "← ここで補完を発動" },
      { autocomplete: "bday", type: "date", note: "bday が連動するか" },
    ],
  },
  {
    id: "bday-name-heuristic",
    title: '15e. name="birthday" ヒューリスティック',
    description: "given-name で補完発動 → name='birthday' が連動するか",
    fields: [
      { autocomplete: "given-name", type: "text", note: "← ここで補完を発動" },
      {
        autocomplete: "off",
        type: "date",
        rawHtml: '<input type="date" name="birthday">',
        note: 'name="birthday"',
      },
    ],
  },
  {
    id: "bday-name-dob",
    title: '15f. name="date_of_birth" ヒューリスティック',
    description: "given-name で補完発動 → name='date_of_birth' が連動するか",
    fields: [
      { autocomplete: "given-name", type: "text", note: "← ここで補完を発動" },
      {
        autocomplete: "off",
        type: "date",
        rawHtml: '<input type="date" name="date_of_birth">',
        note: 'name="date_of_birth"',
      },
    ],
  },
];
