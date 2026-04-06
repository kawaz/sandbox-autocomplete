export type Field = {
  autocomplete: string;
  type: string;
  tag?: "textarea" | "select";
  options?: string[];
  inputmode?: string;
  maxlength?: string;
  placeholder?: string;
  note?: string;
  /** 生 HTML で直接フィールドを記述（tag/type を無視） */
  rawHtml?: string;
};

export type Category = {
  id: string;
  title: string;
  description?: string;
  note?: string;
  fields: Field[];
  /** keywords カテゴリ専用: 2フォーム比較 */
  keywordDemo?: boolean;
  /** section-prefix 用 separator 位置 (fields のインデックス) */
  separatorAfter?: number;
  /** フォーム下部に表示する追加 HTML */
  footer?: string;
};

export type OtpVariant = {
  id: string;
  title: string;
  description: string;
  render: () => string;
};
