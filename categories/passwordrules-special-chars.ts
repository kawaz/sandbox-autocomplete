import type { Category } from "../lib/types.ts";

function makePwRuleTest(id: string, title: string, passwordrules: string, note: string): Category {
  return {
    id,
    title,
    description: "passwordrules のカスタム文字セットにおける特殊文字の指定方法の検証",
    fields: [
      { autocomplete: "username", type: "text", note: "username（コンテキスト用）" },
      {
        autocomplete: "new-password",
        type: "password",
        rawHtml: '<input type="password" autocomplete="new-password" passwordrules="' + passwordrules + '">',
        note,
      },
    ],
  };
}

export const passwordrulesSpecialCharsTests: Category[] = [
  makePwRuleTest(
    "pwrsc-a", "21a. allowed: [-] のみ（ベースライン）",
    "minlength: 8; maxlength: 8; allowed: digit, [-]; required: [-];",
    "数字 + ハイフンのみ。ベースライン。",
  ),
  makePwRuleTest(
    "pwrsc-b", '21b. ] を末尾に配置 [abc]]',
    "minlength: 8; maxlength: 8; allowed: digit, [-]]; required: [-]];",
    '[] 内の末尾に ] を置く: [-]]',
  ),
  makePwRuleTest(
    "pwrsc-c", '21c. [ を含める [-[]',
    "minlength: 8; maxlength: 8; allowed: digit, [-[]; required: [-[];",
    '[ を角括弧内に: [-[]',
  ),
  makePwRuleTest(
    "pwrsc-d", '21d. [ と ] の両方 [-[]]',
    "minlength: 8; maxlength: 8; allowed: digit, [-[]]]; required: [-[]];",
    '[ と ] 両方: [-[]]',
  ),
  makePwRuleTest(
    "pwrsc-e", '21e. バックスラッシュ \\ を含める',
    "minlength: 8; maxlength: 8; allowed: digit, [-\\\\]; required: [-\\\\];",
    'バックスラッシュ: [-\\\\]',
  ),
  makePwRuleTest(
    "pwrsc-f", '21f. エスケープ: \\] で ] を指定',
    "minlength: 8; maxlength: 8; allowed: digit, [-\\]]; required: [-\\]];",
    'エスケープ形式: [-\\]]',
  ),
  makePwRuleTest(
    "pwrsc-g", '21g. エスケープ: \\[ で [ を指定',
    "minlength: 8; maxlength: 8; allowed: digit, [-\\[]; required: [-\\[];",
    'エスケープ形式: [-\\[]',
  ),
  makePwRuleTest(
    "pwrsc-h", '21h. セミコロン ; を含める',
    "minlength: 8; maxlength: 8; allowed: digit, [-;]; required: [-;];",
    'セミコロン: [-;] — passwordrules の区切り文字と衝突するか',
  ),
  makePwRuleTest(
    "pwrsc-i", '21i. Unicode: [あいうえお]',
    "minlength: 8; maxlength: 8; allowed: [あいうえお]; required: [あいうえお];",
    'ひらがな: [あいうえお] — Unicode 文字が使えるか',
  ),
  makePwRuleTest(
    "pwrsc-j", '21j. allowed: unicode',
    "minlength: 8; maxlength: 8; allowed: unicode; required: unicode;",
    '名前付きクラス unicode — 全 Unicode 文字が allowed',
  ),
  makePwRuleTest(
    "pwrsc-k", '21k. 絵文字: [😀🎉🔑💡]',
    "minlength: 4; maxlength: 4; allowed: [😀🎉🔑💡]; required: [😀🎉🔑💡];",
    '絵文字4文字 — サロゲートペアの扱い',
  ),
  makePwRuleTest(
    "pwrsc-l", '21l. 漢字: [河津佳章]',
    "minlength: 4; maxlength: 4; allowed: [河津佳章]; required: [河津佳章];",
    '漢字4文字',
  ),
  // --- [ と ] の両方を含める方法の探索 ---
  makePwRuleTest(
    "pwrsc-m", '21m. required 2行で [ と ] を別々に',
    "minlength: 8; maxlength: 8; allowed: digit, [-[],[-]]; required: [-[]; required: [-]];",
    'required を2つに分けて [-[] と [-]] を別々に指定',
  ),
  makePwRuleTest(
    "pwrsc-n", '21n. allowed 2つで [ と ] を別々に',
    "minlength: 8; maxlength: 8; allowed: digit, [-[], [-]]; required: digit;",
    'allowed をカンマ区切りで [-[] と [-]] の2つ指定',
  ),
  makePwRuleTest(
    "pwrsc-o", '21o. ] を先頭に []-]',
    "minlength: 8; maxlength: 8; allowed: digit, [][-]; required: [][-];",
    '] を先頭に配置: [][-]',
  ),
  makePwRuleTest(
    "pwrsc-p", '21p. ][ の順で [][]',
    "minlength: 8; maxlength: 8; allowed: digit, [][]; required: [][];",
    '][: [][] — 空セットにならないか',
  ),
  makePwRuleTest(
    "pwrsc-q", '21q. special + digit（[ ] \\ 全部含む）',
    "minlength: 8; maxlength: 8; allowed: special, digit; required: special;",
    'special なら [ ] \\ 全て含まれるはず。実際に出るか',
  ),
];
