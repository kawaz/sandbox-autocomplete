import type { Category } from "../lib/types.ts";

export const keywords: Category = {
  id: "keywords",
  title: "1. キーワード (on / off)",
  description: 'autocomplete="on" と autocomplete="off" の比較',
  keywordDemo: true,
  fields: [], // keywords は特殊レンダリング
};
