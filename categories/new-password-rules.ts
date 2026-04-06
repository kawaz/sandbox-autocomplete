import type { Category } from "../lib/types.ts";

// new-password の文字種・文字長制限テスト
// 各パターンを個別ページにして 1Password のパスワードジェネレーターの挙動を検証

function makePasswordTest(id: string, title: string, rawHtml: string, note: string): Category {
  return {
    id,
    title,
    description: "new-password の制限が 1Password のパスワードジェネレーターに影響するかの検証",
    fields: [
      { autocomplete: "username", type: "text", note: "username（コンテキスト用）" },
      { autocomplete: "new-password", type: "password", rawHtml, note },
    ],
  };
}

export const newPasswordRulesTests: Category[] = [
  {
    id: "new-password-rules-overview",
    title: "20. new-password 制限テスト（まとめ）",
    description: "minlength, maxlength, pattern, passwordrules 属性が 1Password のパスワードジェネレーターに影響するかの検証。各パターンは個別ページで検証。",
    fields: [
      { autocomplete: "username", type: "text", note: "username（コンテキスト用）" },
      { autocomplete: "new-password", type: "password", note: "制限なしのベースライン — 以下は個別ページで検証" },
    ],
  },

  // 20a: ベースライン（制限なし）
  makePasswordTest(
    "pw-rules-a", "20a. 制限なし（ベースライン）",
    '<input type="password" autocomplete="new-password">',
    "制限なし — ジェネレーターのデフォルト挙動を確認",
  ),

  // 20b: minlength="20"
  makePasswordTest(
    "pw-rules-b", "20b. minlength=20",
    '<input type="password" autocomplete="new-password" minlength="20">',
    'minlength="20" — 最低20文字が反映されるか',
  ),

  // 20c: maxlength="8"
  makePasswordTest(
    "pw-rules-c", "20c. maxlength=8",
    '<input type="password" autocomplete="new-password" maxlength="8">',
    'maxlength="8" — 最大8文字が反映されるか',
  ),

  // 20d: minlength="12" maxlength="16"
  makePasswordTest(
    "pw-rules-d", "20d. minlength=12 maxlength=16",
    '<input type="password" autocomplete="new-password" minlength="12" maxlength="16">',
    'minlength="12" maxlength="16" — 12-16文字の範囲が反映されるか',
  ),

  // 20e: pattern（英数字のみ8-16文字）
  makePasswordTest(
    "pw-rules-e", "20e. pattern=[a-zA-Z0-9]{8,16}",
    '<input type="password" autocomplete="new-password" pattern="[a-zA-Z0-9]{8,16}">',
    'pattern="[a-zA-Z0-9]{8,16}" — 英数字のみ8-16文字が反映されるか',
  ),

  // 20f: pattern（PIN コード風、数字4桁）
  makePasswordTest(
    "pw-rules-f", "20f. pattern=[0-9]{4}（PIN風）",
    '<input type="password" autocomplete="new-password" pattern="[0-9]{4}">',
    'pattern="[0-9]{4}" — 数字4桁のみが反映されるか',
  ),

  // 20g: pattern（大小英数字+記号必須、12文字以上）
  makePasswordTest(
    "pw-rules-g", "20g. pattern 複雑（大小英数記号必須12文字以上）",
    '<input type="password" autocomplete="new-password" pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&amp;*]).{12,}">',
    'pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{12,}" — 複雑な pattern が反映されるか',
  ),

  // 20h: Apple passwordrules 属性（大小英数記号必須20-30文字）
  makePasswordTest(
    "pw-rules-h", "20h. passwordrules（大小英数記号20-30文字）",
    '<input type="password" autocomplete="new-password" passwordrules="minlength: 20; maxlength: 30; required: upper; required: lower; required: digit; required: special;">',
    'passwordrules="minlength: 20; maxlength: 30; required: upper; required: lower; required: digit; required: special;" — Apple passwordrules が反映されるか',
  ),

  // 20i: passwordrules（数字8桁のみ）
  makePasswordTest(
    "pw-rules-i", "20i. passwordrules 数字8桁",
    '<input type="password" autocomplete="new-password" passwordrules="minlength: 8; maxlength: 8; required: digit; allowed: digit;">',
    'passwordrules="minlength: 8; maxlength: 8; required: digit; allowed: digit;" — 数字8桁のみが反映されるか',
  ),

  // 20j: passwordrules（数字6桁PIN）
  makePasswordTest(
    "pw-rules-j", "20j. passwordrules 数字6桁（PIN）",
    '<input type="password" autocomplete="new-password" passwordrules="minlength: 6; maxlength: 6; allowed: digit;">',
    'passwordrules="minlength: 6; maxlength: 6; allowed: digit;" — 数字6桁PINが反映されるか',
  ),

  // 20k: minlength="32" maxlength="64"（長いパスワード）
  makePasswordTest(
    "pw-rules-k", "20k. minlength=32 maxlength=64（長い）",
    '<input type="password" autocomplete="new-password" minlength="32" maxlength="64">',
    'minlength="32" maxlength="64" — 長いパスワード範囲が反映されるか',
  ),

  // 20l: passwordrules + minlength + maxlength 併用
  makePasswordTest(
    "pw-rules-l", "20l. passwordrules + minlength + maxlength 併用",
    '<input type="password" autocomplete="new-password" passwordrules="minlength: 16; required: upper, lower, digit;" minlength="16" maxlength="32">',
    'passwordrules="minlength: 16; required: upper, lower, digit;" + minlength="16" maxlength="32" — 併用時にどちらが優先されるか',
  ),

  // 20m: confirm password パターン（new-password × 2）
  {
    id: "pw-rules-m",
    title: "20m. confirm password（new-password x2）",
    description: "new-password の制限が 1Password のパスワードジェネレーターに影響するかの検証",
    fields: [
      { autocomplete: "username", type: "text", note: "username（コンテキスト用）" },
      { autocomplete: "new-password", type: "password", rawHtml: '<input type="password" autocomplete="new-password">', note: "新しいパスワード" },
      { autocomplete: "new-password", type: "password", rawHtml: '<input type="password" autocomplete="new-password">', note: "確認用 — ジェネレーターで生成した場合に両方同じ値になるか" },
    ],
  },
];
