import type { Category } from "../lib/types.ts";

// フリガナ検出テスト: 各パターンを個別ページに分離
// given-name をトリガー用に付けて、連動でフリガナが埋まるか検証

function makeFuriganaTest(id: string, title: string, rawHtml: string, note: string): Category {
  return {
    id,
    title,
    description: "given-name で補完を発動し、フリガナ系フィールドが連動するか検証",
    fields: [
      { autocomplete: "given-name", type: "text", note: "← ここで補完を発動" },
      { autocomplete: "off", type: "text", rawHtml, note },
    ],
  };
}

export const furiganaTests: Category[] = [
  {
    id: "furigana-overview",
    title: "19. フリガナ検出テスト（まとめ）",
    description: "autocomplete 仕様にフリガナ用トークンはない。1Password がヒューリスティックでフリガナを検出するかの検証。各フィールドを個別ページで検証（同一カテゴリの先着ルールを避けるため）。",
    fields: [
      { autocomplete: "given-name", type: "text", note: "given-name（ベースライン）" },
      { autocomplete: "off", type: "text", rawHtml: '<input type="text" name="family-name-kana" placeholder="セイ">', note: 'name="family-name-kana" — 以下は個別ページで検証' },
    ],
  },
  makeFuriganaTest(
    "furigana-a", "19a. name=family-name-kana",
    '<input type="text" name="family-name-kana" placeholder="セイ">',
    'name="family-name-kana" placeholder="セイ"',
  ),
  makeFuriganaTest(
    "furigana-b", "19b. name=given-name-kana",
    '<input type="text" name="given-name-kana" placeholder="メイ">',
    'name="given-name-kana" placeholder="メイ"',
  ),
  makeFuriganaTest(
    "furigana-c", "19c. name=kana_sei",
    '<input type="text" name="kana_sei">',
    'name="kana_sei"',
  ),
  makeFuriganaTest(
    "furigana-d", "19d. name=kana_mei",
    '<input type="text" name="kana_mei">',
    'name="kana_mei"',
  ),
  makeFuriganaTest(
    "furigana-e", "19e. id=furigana-sei",
    '<input type="text" id="furigana-sei" name="furi1">',
    'id="furigana-sei"',
  ),
  makeFuriganaTest(
    "furigana-f", "19f. id=furigana-mei",
    '<input type="text" id="furigana-mei" name="furi2">',
    'id="furigana-mei"',
  ),
  makeFuriganaTest(
    "furigana-g", '19g. label="姓（フリガナ）"',
    '<label>姓（フリガナ）<input type="text" name="last_kana"></label>',
    'label="姓（フリガナ）"',
  ),
  makeFuriganaTest(
    "furigana-h", '19h. label="名（フリガナ）"',
    '<label>名（フリガナ）<input type="text" name="first_kana"></label>',
    'label="名（フリガナ）"',
  ),
  makeFuriganaTest(
    "furigana-i", "19i. name=phonetic-name",
    '<input type="text" name="phonetic-name">',
    'name="phonetic-name"',
  ),
  makeFuriganaTest(
    "furigana-j", "19j. name=x-phonetic-family-name",
    '<input type="text" name="x-phonetic-family-name">',
    'name="x-phonetic-family-name"',
  ),
  makeFuriganaTest(
    "furigana-k", "19k. name=x-phonetic-given-name",
    '<input type="text" name="x-phonetic-given-name">',
    'name="x-phonetic-given-name"',
  ),
  makeFuriganaTest(
    "furigana-l", "19l. name=name_kana placeholder=カタカナ",
    '<input type="text" name="name_kana" placeholder="ヤマダ タロウ">',
    'name="name_kana" placeholder="ヤマダ タロウ"',
  ),
  makeFuriganaTest(
    "furigana-m", "19m. name=name_hiragana placeholder=ひらがな",
    '<input type="text" name="name_hiragana" placeholder="やまだ たろう">',
    'name="name_hiragana" placeholder="やまだ たろう"',
  ),
  makeFuriganaTest(
    "furigana-n", "19n. name=sei_kana",
    '<input type="text" name="sei_kana">',
    'name="sei_kana"',
  ),
  makeFuriganaTest(
    "furigana-o", "19o. name=mei_kana",
    '<input type="text" name="mei_kana">',
    'name="mei_kana"',
  ),
  makeFuriganaTest(
    "furigana-p", "19p. name=lastname_kana",
    '<input type="text" name="lastname_kana">',
    'name="lastname_kana"',
  ),
  makeFuriganaTest(
    "furigana-q", "19q. name=firstname_kana",
    '<input type="text" name="firstname_kana">',
    'name="firstname_kana"',
  ),
];
