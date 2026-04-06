# passwordrules 属性仕様の詳細調査

## 調査日: 2026-04-08

## 判明した事実

### 基本

- Apple が提唱した `<input>` 要素の属性で、パスワードジェネレーターの生成ルールを指定する
- WHATWG HTML への標準化は提案中（https://github.com/whatwg/html/issues/3518）、未標準
- HTML の `pattern` 属性はパスワードジェネレーターに**無視される**（バリデーション用であり生成制御用ではない）
- `minlength` / `maxlength` は 1Password が対応しているが、文字種の制御には `passwordrules` が必要

### 構文

セミコロン区切りの key-value ペア:

```
required: <character-class>[, <character-class>];
allowed: <character-class>[, <character-class>];
minlength: <integer>;
maxlength: <integer>;
max-consecutive: <integer>;
```

| プロパティ | 説明 |
|---|---|
| `required` | 最低1文字必要な文字クラス。複数行で AND、カンマ区切りで OR |
| `allowed` | 使用可能な文字クラス。未指定時は required から推論 |
| `minlength` | 最小パスワード長 |
| `maxlength` | 最大パスワード長（下限は 12） |
| `max-consecutive` | 同一文字の最大連続数（"aaa" 等の制限） |

### 文字クラス

#### 名前付きクラス

| 識別子 | 範囲 | 文字数 |
|---|---|---|
| `upper` | A-Z | 26 |
| `lower` | a-z | 26 |
| `digit` | 0-9 | 10 |
| `special` | ASCII 記号 + スペース | 33 |
| `ascii-printable` | U+0020 ~ U+007E | 95 |
| `unicode` | U+0000 ~ U+10FFFF | 全 Unicode |

#### `special` の正確な文字セット（33文字）

`ascii-printable` から `upper`, `lower`, `digit` を除いた全て:

```
 !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~
```

（先頭はスペース U+0020）

#### カスタム文字セット

角括弧 `[]` 内に ASCII 文字を列挙:

```
required: [-_!@#$%];
allowed: upper, lower, digit, [-_!@#$%];
```

- ハイフン `-` は先頭に配置: `[-abc]`
- 閉じ括弧 `]` は末尾に配置: `[abc]]`
- 開き括弧 `[` はそのまま含められる: `[-[]`
- `[` と `]` の両方が必要な場合は2つのカスタムセットに分ける: `[-[], [-]]`
- `\` はエスケープ文字ではなくリテラル: `[-\\]` で `\` を含める
- セミコロン `;` は `[]` 内で安全に使える
- **Unicode 文字は使用不可**（1Password では ASCII のみ対応）

### required の論理

```
required: upper;           ← AND: 大文字1文字以上
required: lower;           ← AND: 小文字1文字以上
required: digit, special;  ← OR: 数字または記号から1文字以上
```

- 複数の `required` 行 = AND（各行から最低1文字ずつ）
- 1つの `required` 内のカンマ = OR（いずれかから1文字）

### 記号の出現割合の制御

**直接的な制御手段はない。** `max-special` や文字クラスごとの最大数指定は仕様に存在しない。

`max-consecutive` は同一文字の連続制限であり、文字クラスの出現回数上限ではない。

**ワークアラウンド: `allowed` で記号を少数に限定する**

```html
<!-- 記号は - のみ使用。英数字が大部分を占める -->
passwordrules="required: upper; required: lower; required: digit; required: [-]; allowed: upper, lower, digit, [-]; minlength: 20;"
```

`allowed` に含まれる記号が少なければ、ランダム生成で記号が選ばれる確率が下がり、結果的に英数字が大部分を占める。

### 1Password での検証結果（テスト 20a-20m）

| 制限 | 生成結果 |
|---|---|
| 制限なし | 19文字、英数記号 |
| `minlength="20"` | 20文字（従う） |
| `maxlength="8"` | 8文字（従う） |
| `minlength="12" maxlength="16"` | 16文字（maxlength に合わせる） |
| `pattern` 各種 | **無視される** |
| `passwordrules` required: all + special | 20文字、記号の割合が大幅に増加（半数近く） |
| `passwordrules` allowed: digit のみ | 数字のみ（PIN 生成可能） |
| `passwordrules` required: upper,lower,digit（special なし） | 記号なし |
| `new-password` × 2 | 両方に同じ値 |

## ツール対応状況

| ツール | 対応状況 | 備考 |
|---|---|---|
| Safari | ✅ 完全対応 | iOS 12+ / macOS Mojave+。提唱者 |
| 1Password | ✅ 対応 | スマートパスワード生成。Rust パーサも公開 |
| Chrome | △ 部分的 | 不正確な生成の報告あり |
| Firefox | ❌ 未対応 | 標準ポジションは 2024年に positive に転換。将来実装の可能性 |
| Bitwarden | ❌ 未対応 | PR がクローズされた |

## 実用的な HTML 記述例

```html
<!-- 基本: 大文字・小文字・数字・記号を各1つ以上 -->
<input type="password" autocomplete="new-password"
  passwordrules="required: upper; required: lower; required: digit; required: special; max-consecutive: 3;">

<!-- 記号を特定の文字に限定（記号が多すぎる問題を回避） -->
<input type="password" autocomplete="new-password"
  passwordrules="required: upper; required: lower; required: digit; required: [-_!@#]; allowed: upper, lower, digit, [-_!@#]; minlength: 12; maxlength: 64;">

<!-- 記号を最小限に（ハイフンのみ） -->
<input type="password" autocomplete="new-password"
  passwordrules="required: upper; required: lower; required: digit; required: [-]; allowed: upper, lower, digit, [-]; minlength: 20;">

<!-- PIN（数字のみ） -->
<input type="password" autocomplete="new-password"
  passwordrules="minlength: 6; maxlength: 6; allowed: digit;">

<!-- 記号なし（英数字のみ） -->
<input type="password" autocomplete="new-password"
  passwordrules="required: upper; required: lower; required: digit; minlength: 16;">
```

## カスタム文字セットの特殊文字テスト（21a-21q）

### テスト結果

| ID | 指定 | 生成結果 | 備考 |
|---|---|---|---|
| 21a | `[-]` | 数字 + ハイフン | ✅ ベースライン |
| 21b | `[-]]` | 数字 + ハイフン + `]` | ✅ `]` を末尾に配置で動作 |
| 21c | `[-[]` | 数字 + ハイフン + `[` | ✅ `[` を含めるのは簡単 |
| 21d | `[-[]]` | デフォルトにフォールバック | ❌ パースエラー。`[` と `]` を1つの `[]` に同時に含められない |
| 21e | `[-\\]` | 数字 + ハイフン + `\` | ✅ `\` はリテラルとして扱われる |
| 21f | `[-\]]` | `-` `[` `\` の3文字 | `\]` はエスケープではなく `\` と `]` として解釈 |
| 21g | `[-\[]` | `-` `]` `\` の3文字 | 同上。`\` はエスケープ文字として機能しない |
| 21h | `[-;]` | 数字 + ハイフン + `;` | ✅ セミコロンは `[]` 内では区切り文字ではない |
| 21i | `[あいうえお]` | デフォルトにフォールバック | ❌ Unicode ひらがなは無視される |
| 21j | `unicode` | デフォルトにフォールバック | ❌ 1Password は unicode クラスを無視（ASCII のみ対応） |
| 21k | `[😀🎉🔑💡]` | デフォルトにフォールバック | ❌ 絵文字も無視 |
| 21l | `[河津佳章]` | デフォルトにフォールバック | ❌ 漢字も無視 |
| 21m | `required: [-[];` + `required: [-]];` | 数字 + `[` + `]` + `-` | ✅ **required を2行に分けて `[` と `]` を別々に指定** |
| 21n | `allowed: digit, [-[], [-]]` | 数字 + `[` + `]` + `-` | ✅ **allowed のカンマ区切りで2つのカスタムセットを指定** |
| 21o | `[][-]` | デフォルトにフォールバック | ❌ `]` を先頭に配置する POSIX 方式は非対応 |
| 21p | `[][]` | デフォルトにフォールバック | ❌ 同上 |
| 21q | `special, digit` | 全 special 文字 + 数字 | ✅ `[` `]` `\` は出るが special 33文字中なので確率低い |

### 判明したルール

#### `\` はエスケープ文字ではない

- `\]` は `]` にエスケープされず、`\` と `]` の2文字として解釈される
- `\` はリテラルの `\` として扱われる

#### `[` と `]` の両方を1つの `[]` に含める方法はない

1つのカスタムセット `[...]` 内に `[` と `]` を同時に入れるとパースエラーになる。

**解決策: 2つのカスタムセットに分けてカンマで並べる**

```
allowed: digit, [-[], [-]];
```

または `required` を2行に:

```
required: [-[];
required: [-]];
```

#### Unicode はカスタムセットで使用不可（1Password）

- `[あいうえお]`, `[😀🎉🔑💡]`, `[河津佳章]` は全てパースエラーまたは無視
- 名前付きクラス `unicode` も 1Password では無視される（仕様上は存在するが実装されていない）
- 1Password のパスワードジェネレーターは **ASCII のみ対応**

#### セミコロンは `[]` 内で安全

- `[-;]` は正常に動作。`[]` 内ではセミコロンは passwordrules の区切り文字として解釈されない

## 参考リンク

- Apple Password Rules Validation Tool: https://developer.apple.com/password-rules/
- Apple password-manager-resources: https://github.com/apple/password-manager-resources
- 1Password password-rules-parser (Rust): https://github.com/1Password/password-rules-parser
- 1Password 開発者ドキュメント: https://developer.1password.com/docs/web/compatible-website-design/
- WHATWG HTML 標準化議論: https://github.com/whatwg/html/issues/3518
- Mozilla 標準ポジション: https://github.com/mozilla/standards-positions/issues/61
