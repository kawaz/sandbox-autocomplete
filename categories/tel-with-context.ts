import type { Category } from "../lib/types.ts";

// 電話番号が他のフィールドと一緒にある場合に連動するかのテスト

export const telWithContext: Category[] = [
  {
    id: "tel-with-email",
    title: "9b. tel + email",
    description: "email で補完発動 → tel が連動するか",
    fields: [
      { autocomplete: "email", type: "email", note: "← ここで補完を発動" },
      { autocomplete: "tel", type: "tel", note: "tel が連動するか" },
    ],
  },
  {
    id: "tel-with-name",
    title: "9c. tel + given-name + family-name",
    description: "given-name で補完発動 → tel が連動するか",
    fields: [
      { autocomplete: "given-name", type: "text", note: "← ここで補完を発動" },
      { autocomplete: "family-name", type: "text" },
      { autocomplete: "tel", type: "tel", note: "tel が連動するか" },
    ],
  },
  {
    id: "tel-with-address",
    title: "9d. tel + 住所",
    description: "postal-code で補完発動 → tel が連動するか",
    fields: [
      { autocomplete: "postal-code", type: "text", note: "← ここで補完を発動" },
      { autocomplete: "address-level1", type: "text" },
      { autocomplete: "tel", type: "tel", note: "tel が連動するか" },
    ],
  },
  {
    id: "tel-with-name-phone",
    title: "9e. name=phone のヒューリスティック + autocomplete=tel",
    description: "name='phone' で 1P がヒューリスティック検出するか、autocomplete='tel' が優先されるか",
    fields: [
      { autocomplete: "given-name", type: "text", note: "← ここで補完を発動" },
      {
        autocomplete: "tel",
        type: "tel",
        rawHtml: '<input type="tel" name="phone" autocomplete="tel">',
        note: 'name="phone" autocomplete="tel"',
      },
    ],
  },
  {
    id: "tel-name-only",
    title: "9f. name=phone のみ（autocomplete なし）",
    description: "autocomplete 属性なしで name='phone' だけの場合",
    fields: [
      { autocomplete: "given-name", type: "text", note: "← ここで補完を発動" },
      {
        autocomplete: "off",
        type: "tel",
        rawHtml: '<input type="tel" name="phone">',
        note: 'name="phone"（autocomplete 属性なし）',
      },
    ],
  },
  {
    id: "tel-name-telephone",
    title: "9g. name=telephone",
    description: "name='telephone' の場合",
    fields: [
      { autocomplete: "given-name", type: "text", note: "← ここで補完を発動" },
      {
        autocomplete: "off",
        type: "tel",
        rawHtml: '<input type="tel" name="telephone">',
        note: 'name="telephone"',
      },
    ],
  },
  {
    id: "tel-name-tel",
    title: "9h. name=tel",
    description: "name='tel' の場合",
    fields: [
      { autocomplete: "given-name", type: "text", note: "← ここで補完を発動" },
      {
        autocomplete: "off",
        type: "tel",
        rawHtml: '<input type="tel" name="tel">',
        note: 'name="tel"',
      },
    ],
  },
  {
    id: "tel-name-mobile",
    title: "9i. name=mobile",
    description: "name='mobile' の場合",
    fields: [
      { autocomplete: "given-name", type: "text", note: "← ここで補完を発動" },
      {
        autocomplete: "off",
        type: "tel",
        rawHtml: '<input type="tel" name="mobile">',
        note: 'name="mobile"',
      },
    ],
  },
  {
    id: "tel-label-phone",
    title: "9j. label=電話番号",
    description: "label テキストが「電話番号」の場合",
    fields: [
      { autocomplete: "given-name", type: "text", note: "← ここで補完を発動" },
      {
        autocomplete: "off",
        type: "tel",
        rawHtml: '<label>電話番号<input type="tel" name="tel_field"></label>',
        note: 'label="電話番号"',
      },
    ],
  },
];
