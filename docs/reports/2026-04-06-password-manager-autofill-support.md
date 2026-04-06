# パスワードマネージャー autocomplete オートフィル対応状況調査

## 調査日: 2026-04-06

## エグゼクティブサマリー

- **Chrome の組み込み autofill** が最も広範な autocomplete トークンをサポートしている。ML モデルによるヒューリスティック検出も併用し、`autocomplete` 属性がないフォームでも高精度で認識する
- **1Password** は autocomplete 属性を「推奨」として参照するが、`id`/`name`/`label`/`placeholder` 等のヒューリスティック検出も併用する。Identity（名前・住所・電話番号等）と Credit Card のフィルに対応
- **すべての主要パスワードマネージャー・ブラウザが `autocomplete="off"` を無視する**（パスワードフィールドに関して）。これはユーザーセキュリティを優先する意図的な設計判断
- **Safari は autocomplete 属性のサポートが部分的**。特にクレジットカードフィールドでは autocomplete 属性を無視し、独自のヒューリスティック（name 属性やラベルテキストのキーワードマッチ）に依存する
- **Shadow DOM 内のフォーム**は多くの PM で問題が発生する。Dashlane は独自の Shadow DOM 探索を実装済み。1Password は v4.7.4 以降で対応。ブラウザ組み込み autofill（Chrome）は Shadow DOM 対応済み
- **Cross-origin iframe** での autofill は、セキュリティ上の理由から制限される。1Password はログイン情報を cross-origin iframe に填めないが、クレジットカード情報は例外
- **HTTPS は事実上必須**。Chrome 86 以降、混合コンテンツフォームの autofill を無効化。Safari も非 HTTPS サイトでの自動 autofill を制限
- **`transaction-currency`、`transaction-amount`、`language`、`photo`、`impp`** などの「マイナー」トークンは、ほぼどの PM・ブラウザでもサポートされていない
- **`section-*`、`shipping`/`billing` 修飾子**は Chrome/Opera でのみ明確にサポートが確認されている

---

## 1. 1Password（詳細）

### 対応トークン

1Password は「Identity」と「Credit Card」の2つのアイテムカテゴリを通じてフォームフィルに対応する。

**Credential 系（Login アイテム）**:
| トークン | 対応 | 備考 |
|---|---|---|
| `username` | ✅ | Login アイテムから自動検出・填入 |
| `current-password` | ✅ | Login アイテムのパスワード |
| `new-password` | ✅ | パスワードジェネレータが起動 |
| `one-time-code` | ✅ | TOTP コードの自動填入。公式ドキュメントで明記 |

**Name 系（Identity アイテム）**:
| トークン | 対応 | 備考 |
|---|---|---|
| `name` | ✅ | Identity のフルネーム |
| `given-name` | ✅ | Identity の名 |
| `family-name` | ✅ | Identity の姓 |
| `additional-name` | ❓ | 明確なドキュメントなし（推測: 対応の可能性あり） |
| `honorific-prefix` | ❓ | 明確なドキュメントなし |
| `honorific-suffix` | ❓ | 明確なドキュメントなし |
| `nickname` | ❓ | 明確なドキュメントなし |

**Organization 系**:
| トークン | 対応 | 備考 |
|---|---|---|
| `organization` | ✅ | Identity アイテムに組織フィールドあり |
| `organization-title` | ✅ | Identity アイテムに役職フィールドあり |

**Address 系（Identity アイテム）**:
| トークン | 対応 | 備考 |
|---|---|---|
| `street-address` | ✅ | |
| `address-line1` | ✅ | |
| `address-line2` | ✅ | |
| `address-line3` | ❓ | |
| `address-level1` | ✅ | 都道府県/州 |
| `address-level2` | ✅ | 市区町村 |
| `address-level3` | ❓ | |
| `address-level4` | ❓ | |
| `postal-code` | ✅ | |
| `country` | ✅ | |
| `country-name` | ✅ | |

**Credit Card 系（Credit Card アイテム）**:
| トークン | 対応 | 備考 |
|---|---|---|
| `cc-name` | ✅ | |
| `cc-given-name` | ❓ | |
| `cc-additional-name` | ❓ | |
| `cc-family-name` | ❓ | |
| `cc-number` | ✅ | |
| `cc-exp` | ✅ | |
| `cc-exp-month` | ✅ | |
| `cc-exp-year` | ✅ | |
| `cc-csc` | ✅ | セキュリティコード |
| `cc-type` | ❓ | |

**Tel 系**:
| トークン | 対応 | 備考 |
|---|---|---|
| `tel` | ✅ | Identity の電話番号 |
| `tel-country-code` | ❓ | |
| `tel-national` | ❓ | |
| `tel-area-code` | ❓ | |
| `tel-local` | ❓ | |
| `tel-local-prefix` | ❓ | |
| `tel-local-suffix` | ❓ | |
| `tel-extension` | ❓ | |

**Contact 系**:
| トークン | 対応 | 備考 |
|---|---|---|
| `email` | ✅ | Identity および Login から |
| `impp` | ❌ | サポート情報なし |

**Birthday 系**:
| トークン | 対応 | 備考 |
|---|---|---|
| `bday` | ✅ | Identity に生年月日フィールドあり |
| `bday-day` | ❓ | |
| `bday-month` | ❓ | |
| `bday-year` | ❓ | |

**Misc 系**:
| トークン | 対応 | 備考 |
|---|---|---|
| `sex` | ❓ | Identity に性別フィールドがあるかは不明 |
| `url` | ❓ | |
| `photo` | ❌ | |
| `language` | ❌ | |

**Transaction 系**:
| トークン | 対応 | 備考 |
|---|---|---|
| `transaction-currency` | ❌ | |
| `transaction-amount` | ❌ | |

**WebAuthn**:
| トークン | 対応 | 備考 |
|---|---|---|
| `webauthn` | ✅ | Passkey 対応（Conditional UI） |

### 検出メカニズム

1Password はフォームフィールドの検出に**複数のヒューリスティック**を併用する:

1. **autocomplete 属性**（最優先）: WHATWG 仕様に準拠した autocomplete 値を認識
2. **id / name 属性**: 一意な識別子としてフィールドタイプを推定
3. **label 要素**: `for` 属性で紐づけられたラベルテキスト
4. **ARIA 属性**: `aria-label`、`aria-hidden` 等を参照
5. **placeholder 属性**: フィールドの用途推定に使用
6. **フィールドの配置・グルーピング**: `<form>` 要素内の論理的なグループ

**公式推奨事項**:
- すべてのフィールドに一意な `id` または `name` を付与
- 関連するフィールドは1つの `<form>` 要素内にグループ化
- 無関係なフィールドは別の `<form>` に分離
- 動的に生成される ID/name を避ける
- DOM 操作ではフィールドの表示/非表示切替ではなく追加/削除を推奨

### 特記事項・制限

**独自属性**:
- `data-1p-ignore` / `data-op-ignore`: 1Password にフィールドを無視させる
- `passwordrules` 属性: パスワード生成ルールの指定（Safari と 1Password のみ対応）
- Apple の Password Manager Resources を統合してスマートなパスワード生成を実現

**autocomplete="off" の扱い**: 無視する。開発者がフィールドを無視させるには `data-1p-ignore` の使用が必要

**HTTPS 要件**: 1Password 自体は HTTP サイトでも動作するが、フィッシング警告を表示する場合がある

**iframe の扱い**:
- **同一オリジン iframe**: 通常通り autofill
- **Cross-origin iframe（Login）**: autofill しない（セキュリティ対策）
- **Cross-origin iframe（Credit Card）**: autofill する（EC サイトの決済フォーム対応のため例外）

**Shadow DOM**: v4.7.4 以降の companion extension で対応。`querySelectorAll` ベースの検出のため、以前は Shadow DOM 内のフォームを検出できなかった

**Identity のインライン表示制限**: インラインメニューは email フィールドとアドレスフィールドでのみ自動表示。名前や電話番号は手動で 1Password アイコンから「Autofill」を選択する必要がある

---

## 2. Bitwarden

### 対応トークン

Bitwarden は「Login」「Card」「Identity」のアイテムタイプを持つ。

**Credential 系**: `username` ✅、`current-password` ✅、`new-password` ✅（パスワードジェネレータ連携）、`one-time-code` ✅

**Identity 系**: 名前、住所、電話番号、メールアドレスのフィルに対応。ただし、**Bitwarden は autocomplete 属性よりも `id`/`name`/`aria-label`/`placeholder` を優先して使用する**。autocomplete 属性の個別トークンへの対応は公式ドキュメントに明記されていない。

**Card 系**: クレジットカード番号、有効期限、セキュリティコード、カード名義のフィルに対応。

### 検出メカニズム

Bitwarden のフィールドマッチングは以下の優先順位:

1. **`id` 属性**
2. **`name` 属性**
3. **`aria-label` 属性**
4. **`placeholder` 属性**
5. **対応する `<label>` のテキスト**

マッチングは**完全一致・大文字小文字区別なし**。

**特殊なマッチング方法**:
- `csv=` プレフィックス: 複数の名前をカンマ区切りで指定
- `regex=` プレフィックス: 正規表現マッチング

**注意**: autocomplete 属性は Bitwarden のカスタムフィールドマッチングでは参照されない。これはコミュニティフォーラムで改善要望として議論されている。

### 特記事項・制限

- **独自属性**: `data-bwautofill`（`<span>` 要素への autofill 用）、`data-bwignore`（autofill 無視用）
- **autocomplete="off"**: 無視する
- **HTTPS 要件**: Bitwarden 自体は特に制限しないが、ブラウザの制限が適用される
- **Identity autofill**: ブラウザ拡張のみ対応（モバイルアプリは非対応）
- **Card autofill**: ブラウザ拡張 + Android 対応
- **Safari**: コンテキストメニュー autofill が利用不可

---

## 3. LastPass

### 対応トークン

LastPass は「パスワード」「フォームフィル」「セキュアノート」等のカテゴリを持つ。

フォームフィルでは以下をサポート:
- 名前（フルネーム、名、姓）
- 生年月日
- 性別
- メールアドレス
- 電話番号
- 住所（複数プロファイル対応）
- クレジットカード情報
- 社会保障番号（SSN）
- 銀行口座情報

個別の autocomplete トークンへの対応は公式ドキュメントに詳細な記載がない。ヒューリスティック検出が主体。

### 検出メカニズム

- URL マッチングでサイトを特定
- フォームフィールドの `name`/`id`/`label` 等をヒューリスティックに分析
- autocomplete 属性も参照するが、主要な検出メカニズムではない

### 特記事項・制限

- **独自属性**: `data-lpignore="true"` でフィールドを無視させる
- **autocomplete="off"**: デフォルトでは無視する。ユーザー設定「Respect AutoComplete=off」を有効にすることで尊重可能
- **フォーム ID のハック**: フォーム ID に `-search-` を含むとフォームフィルが抑制される

---

## 4. Dashlane

### 対応トークン

Dashlane は以下のデータカテゴリを持つ:
- ログイン（ユーザー名、パスワード）
- 個人情報（名前、生年月日、住所、電話番号、メール）
- クレジットカード
- ID（パスポート、運転免許証、社会保障番号等）
- 2FA トークン

### 検出メカニズム

**Web フォーム**:
- **autocomplete 属性**: 標準の HTML autocomplete 値を認識（MDN リファレンス準拠）
- **`data-form-type` 属性**: Dashlane 独自のフォームタイプ指定
  - `login`: ログインフォーム
  - `password-change`: パスワード変更フォーム
  - `payment`: 決済フォーム
  - `other`: autofill を無効化

**Android**: `android:autofillHints` 属性を使用
**iOS**: `textContentType` プロパティを使用

### 特記事項・制限

- **Shadow DOM 対応**: 独自の Shadow DOM トラバーサルを実装済み。パフォーマンスオーバーヘッドは 5% 以下
- **iframe 対応**: 各 iframe から独立してフォームデータを抽出し、メインフレームに集約
- **autocomplete="off"**: `data-form-type="other"` で無効化
- **SAWF (Standard Autofill Web Framework)**: Dashlane が GitHub で公開しているフレームワーク

---

## 5. KeePassXC（ブラウザ拡張）

### 対応トークン

KeePassXC-Browser は主にログイン認証情報に特化:

| トークン | 対応 | 備考 |
|---|---|---|
| `username` | ✅ | |
| `current-password` | ✅ | |
| `new-password` | ⚠️ | Issue #1921: 完全に尊重されない場合がある |
| `one-time-code` | ✅ | TOTP フィールド検出に使用 |
| その他（住所、CC 等） | ❌ | KeePassXC は Identity/CC カテゴリを持たない |

### 検出メカニズム

- `type="password"` の `<input>` 要素を主に検出
- `autocomplete="one-time-code"` で TOTP フィールドを認識
- 正規表現パターン（例: `/\btotp\b/`）と `maxlength="6"` の組み合わせ
- `name`/`id`/`class` 属性のパターンマッチング
- カスタムフィールドは KeePassXC エントリの Advanced タブで `KPH: ` プレフィックス付きで定義

### 特記事項・制限

- **autocomplete="off"**: 完全には尊重されない（Issue #1921）
- **HTTPS 要件**: HTTP/HTTPS 問わず填入する（セキュリティ上の懸念あり、Issue #380 で議論）
- **iframe**: v1.8.12 で Cross-Origin iframe オプション追加。v1.9.1 で iframe URL 処理を修正
- **セキュリティ脆弱性**: CVE-2025-65203 — CSP sandbox directive 下の iframe でも autofill される問題
- **住所・クレジットカード**: 非対応（ログイン認証情報と TOTP のみ）

---

## 6. Apple Passwords / iCloud Keychain（Safari, macOS/iOS）

### 対応トークン

Apple Passwords は以下のカテゴリをサポート:

**Credential 系**: `username` ✅、`current-password` ✅、`new-password` ✅、`one-time-code` ✅（Safari 14+）、`webauthn` ✅

**Address 系**: Safari は Contacts アプリの連絡先カードから住所情報を填入する。基本的な住所フィールド（`street-address`、`postal-code`、`address-level1` 等）に対応。

**Credit Card 系**: `cc-number` ✅、`cc-exp` ✅、`cc-exp-month` ✅、`cc-exp-year` ✅、`cc-csc` ✅、`cc-name` ✅

**Name 系**: Contacts から `given-name`、`family-name` 等を填入。

### 検出メカニズム

Safari の autofill は**2つの異なるアプローチ**を使う:

1. **パスワード/ユーザー名**: autocomplete 属性を参照
2. **クレジットカード**: autocomplete 属性を**無視**し、`name` 属性やラベルテキストのキーワードマッチに依存
   - 検出キーワード例: "card number"、"cardnumber"、"cardholder"、"name on card"、"credit card number"、"expiration date"、"ccv2" 等
3. **住所/名前**: autocomplete 属性と `name` 属性の両方を参照

**Safari の quirk**: クレジットカードフィールドが複数存在しないと、個別フィールドへの autofill を提案しない場合がある。

### 特記事項・制限

- **HTTPS 要件**: 非 HTTPS サイトでは autofill プロンプトが自動表示されない。手動で右クリックから選択する必要がある
- **autocomplete="off"**: パスワードマネージャーとしては無視するが、ユーザー設定で「Allow AutoFill even for websites that request passwords not be saved」を有効にする必要がある場合がある
- **`maxlength` 無視**: Safari は autofill 時に `maxlength` 制限を無視する
- **`passwordrules` 属性**: Safari と 1Password のみがサポート
- **iCloud Passwords Chrome 拡張**: Chromium ベースブラウザでも iCloud のパスワードを autofill 可能

---

## 7. Google Chrome 組み込みパスワードマネージャー / Autofill

Chrome の autofill は「パスワードマネージャー」と「住所・決済の autofill」の2つの独立したシステムで構成される。

### 対応トークン

Chrome は WHATWG 仕様に準拠した autocomplete トークンを**最も広範に**サポートする。

**Credential 系**: `username` ✅、`current-password` ✅、`new-password` ✅、`one-time-code` ✅、`webauthn` ✅

**Name 系**: `name` ✅、`honorific-prefix` ✅、`given-name` ✅、`additional-name` ✅、`family-name` ✅、`honorific-suffix` ✅

**Organization 系**: `organization` ✅、`organization-title` ✅

**Address 系**: `street-address` ✅、`address-line1` ✅、`address-line2` ✅、`address-line3` ✅、`address-level1` ✅、`address-level2` ✅、`address-level3` ✅、`address-level4` ✅、`postal-code` ✅、`country` ✅、`country-name` ✅

**Credit Card 系**: `cc-name` ✅、`cc-given-name` ✅、`cc-additional-name` ✅、`cc-family-name` ✅、`cc-number` ✅、`cc-exp` ✅、`cc-exp-month` ✅、`cc-exp-year` ✅、`cc-csc` ✅、`cc-type` ✅

**Tel 系**: `tel` ✅、`tel-country-code` ✅、`tel-national` ✅、`tel-area-code` ✅、`tel-local` ✅、`tel-local-prefix` ✅、`tel-local-suffix` ✅、`tel-extension` ✅

**Contact 系**: `email` ✅、`impp` ❓

**Birthday 系**: `bday` ❓、`bday-day` ❓、`bday-month` ❓、`bday-year` ❓（Chrome は bday を保存する UI を持たないため、実質的に非対応の可能性）

**Misc 系**: `nickname` ❓、`sex` ❓、`url` ❓、`photo` ❌、`language` ❌

**Transaction 系**: `transaction-currency` ❌、`transaction-amount` ❌

**修飾子**: `shipping` ✅、`billing` ✅、`section-*` ✅、`home`/`work`/`mobile`/`fax`/`pager` ✅

### 検出メカニズム

Chrome は**3層のフィールド検出**を使用:

1. **autocomplete 属性**（最優先）: WHATWG 仕様に準拠。ParseAutocompleteAttribute で解析
2. **ルールベースのヒューリスティック**: `name`/`id`/`label`/`placeholder`/`type` 属性を正規表現でマッチング
   - 多言語対応: 英語、ドイツ語、スペイン語、フランス語、日本語、ポルトガル語、ロシア語、中国語等
   - 例: address-line1 の検出パターン: `address.*line|address1|addr1|street|住所1|地址` 等
3. **ML モデル（Form Understanding）**: 1億以上のフォームで訓練。ラベルのないフォームの分類精度を 30-40% 向上

**後処理（Rationalization）**: 矛盾するフィールド分類の修正（例: `street-address` の後に `address-line1` が来る場合）

### 特記事項・制限

- **autocomplete="off"**: パスワードフィールドでは意図的に無視（2014年からの方針）。アドレス/クレジットカードフィールドでも Chrome は無視する傾向がある
- **HTTPS 要件**: Chrome 86 以降、HTTP ページまたは混合コンテンツフォームでは autofill を無効化。警告テキスト「This form is not secure. Autofill has been turned off」を表示
- **Shadow DOM**: Chrome の autofill は Shadow DOM 内のフォームに対応
- **SPA 対応**: DOM の変更を MutationObserver で監視。ただし hydration 後のフォームは初回クロール時に見逃す可能性あり
- **DevTools**: autofill の検査・デバッグ用パネルを提供。Form Troubleshooter 拡張で問題を診断可能
- **Android**: Chrome 137 以降、Android Autofill Framework のネイティブサポートに移行。サードパーティ autofill サービスとの連携を強化

---

## 8. Firefox 組み込みパスワードマネージャー / Form Autofill

Firefox は「Lockwise パスワードマネージャー」と「Form Autofill」の2つのシステムを持つ。

### 対応トークン

**Credential 系**: `username` ✅、`current-password` ✅、`new-password` ✅、`one-time-code` ✅（v122+）、`webauthn` ✅（v122+、Conditional UI）

**Address 系**: `street-address` ✅、`address-line1` ✅、`address-line2` ✅、`address-line3` ✅、`address-level1` ✅、`address-level2` ✅、`postal-code` ✅、`country` ✅、`country-name` ✅

**Credit Card 系**: `cc-name` ✅、`cc-number` ✅、`cc-exp` ✅、`cc-exp-month` ✅、`cc-exp-year` ✅（v135 以降、グローバルで利用可能。CVV は保存しない）

**Name 系**: `name` ✅、`given-name` ✅、`additional-name` ✅、`family-name` ✅

**Tel 系**: `tel` ✅、`tel-national` ✅

**Contact 系**: `email` ✅

**注意**: 上記は Firefox の Form Autofill で認識されるトークン。ヒューリスティックでは `address-level3`、`address-level4`、`tel-country-code`、`tel-area-code` 等のより細かいトークンも検出可能。

### 検出メカニズム

Firefox は**3つの検出メカニズム**を使用:

1. **autocomplete 属性**: `element.getAutocompleteInfo()` で WHATWG 仕様に準拠したパースを実行。セクション情報も抽出
2. **Fathom ML モデル**: `cc-name` と `cc-number` の検出に特化したルールベースの学習システム。アドレスフィールドには使用しない
3. **HeuristicsRegExp（正規表現）**: `HeuristicsRegExp.sys.mjs` にある大量の正規表現パターンで `id`/`name`/`placeholder`/`label` をマッチング。アドレスフィールドの分類に主に使用

**セクション検出**: `FormAutofillSection.sys.mjs` の `groupFields` 関数で shipping/billing セクションを自動分割。autocomplete 属性で明示的にセクションが指定されている場合はそれを優先。

**地域メタデータ**: `AddressMetaData.sys.mjs` に国別の郵便番号形式、州名、必須フィールド等を定義。

### 特記事項・制限

- **autocomplete="off"**: パスワードマネージャーとしては無視。Form Autofill（住所等）は `signon.autofillForms.autocompleteOff` プレフで制御可能
- **フォーム送信が必要**: Firefox はフォーム送信後にのみデータを保存（Chrome/Safari はプロアクティブにキャプチャ）
- **HTTPS 要件**: HTTP サイトでは autofill を無効化する方針（Bug 1217152）
- **Cross-origin iframe**: 同一オリジンの非 sandbox iframe のみ autofill（他の cross-origin/sandbox iframe は無視）
- **Shadow DOM**: Bug 1629226 で対応作業中。2026年時点では部分的な対応
- **動的フォーム対応**: フォーカスイベント時に再スキャン。国別フィールド変更にも動的に対応
- **about:config 設定**: `extensions.formautofill.addresses.enabled`、`extensions.formautofill.creditCards.enabled` 等で細かく制御可能

---

## 比較マトリクス

### 凡例

- ✅ = 対応確認
- ⚠️ = 部分的対応 / 条件付き
- ❌ = 非対応
- ❓ = 不明（公式情報なし）
- N/A = 該当カテゴリなし

### Credential 系トークン

| トークン | 1Password | Bitwarden | LastPass | Dashlane | KeePassXC | Apple Passwords | Chrome | Firefox |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `username` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `current-password` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `new-password` | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ | ✅ |
| `one-time-code` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `webauthn` | ✅ | ✅ | ❓ | ❓ | ❌ | ✅ | ✅ | ✅ |

### Name 系トークン

| トークン | 1Password | Bitwarden | LastPass | Dashlane | KeePassXC | Apple Passwords | Chrome | Firefox |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `name` | ✅ | ✅ | ✅ | ✅ | N/A | ✅ | ✅ | ✅ |
| `honorific-prefix` | ❓ | ❓ | ❓ | ❓ | N/A | ❓ | ✅ | ❓ |
| `given-name` | ✅ | ✅ | ✅ | ✅ | N/A | ✅ | ✅ | ✅ |
| `additional-name` | ❓ | ❓ | ❓ | ❓ | N/A | ❓ | ✅ | ✅ |
| `family-name` | ✅ | ✅ | ✅ | ✅ | N/A | ✅ | ✅ | ✅ |
| `honorific-suffix` | ❓ | ❓ | ❓ | ✅ | N/A | ❓ | ✅ | ❓ |
| `nickname` | ❓ | ❓ | ❓ | ✅ | N/A | ❓ | ❓ | ❓ |

### Organization 系トークン

| トークン | 1Password | Bitwarden | LastPass | Dashlane | KeePassXC | Apple Passwords | Chrome | Firefox |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `organization-title` | ✅ | ❓ | ❓ | ❓ | N/A | ❓ | ✅ | ❓ |
| `organization` | ✅ | ✅ | ✅ | ✅ | N/A | ❓ | ✅ | ✅ |

### Address 系トークン

| トークン | 1Password | Bitwarden | LastPass | Dashlane | KeePassXC | Apple Passwords | Chrome | Firefox |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `street-address` | ✅ | ✅ | ✅ | ✅ | N/A | ✅ | ✅ | ✅ |
| `address-line1` | ✅ | ✅ | ✅ | ✅ | N/A | ✅ | ✅ | ✅ |
| `address-line2` | ✅ | ✅ | ✅ | ✅ | N/A | ✅ | ✅ | ✅ |
| `address-line3` | ❓ | ❓ | ❓ | ❓ | N/A | ❓ | ✅ | ✅ |
| `address-level1` | ✅ | ✅ | ✅ | ✅ | N/A | ✅ | ✅ | ✅ |
| `address-level2` | ✅ | ✅ | ✅ | ✅ | N/A | ✅ | ✅ | ✅ |
| `address-level3` | ❓ | ❓ | ❓ | ❓ | N/A | ❓ | ✅ | ❓ |
| `address-level4` | ❓ | ❓ | ❓ | ❓ | N/A | ❓ | ✅ | ❓ |
| `postal-code` | ✅ | ✅ | ✅ | ✅ | N/A | ✅ | ✅ | ✅ |
| `country` | ✅ | ✅ | ✅ | ✅ | N/A | ✅ | ✅ | ✅ |
| `country-name` | ✅ | ❓ | ❓ | ❓ | N/A | ❓ | ✅ | ✅ |

### Credit Card 系トークン

| トークン | 1Password | Bitwarden | LastPass | Dashlane | KeePassXC | Apple Passwords | Chrome | Firefox |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `cc-name` | ✅ | ✅ | ✅ | ✅ | N/A | ✅ | ✅ | ✅ |
| `cc-given-name` | ❓ | ❓ | ❓ | ❓ | N/A | ❓ | ✅ | ❓ |
| `cc-additional-name` | ❓ | ❓ | ❓ | ❓ | N/A | ❓ | ✅ | ❓ |
| `cc-family-name` | ❓ | ❓ | ❓ | ❓ | N/A | ❓ | ✅ | ❓ |
| `cc-number` | ✅ | ✅ | ✅ | ✅ | N/A | ✅ | ✅ | ✅ |
| `cc-exp` | ✅ | ✅ | ✅ | ✅ | N/A | ✅ | ✅ | ✅ |
| `cc-exp-month` | ✅ | ✅ | ✅ | ✅ | N/A | ✅ | ✅ | ✅ |
| `cc-exp-year` | ✅ | ✅ | ✅ | ✅ | N/A | ✅ | ✅ | ✅ |
| `cc-csc` | ✅ | ✅ | ✅ | ✅ | N/A | ✅ | ✅ | ⚠️ |
| `cc-type` | ❓ | ❓ | ❓ | ❓ | N/A | ❓ | ✅ | ❓ |

※ Firefox は CVV（cc-csc）を保存しない。autofill 時に毎回入力を求める。

### Tel 系トークン

| トークン | 1Password | Bitwarden | LastPass | Dashlane | KeePassXC | Apple Passwords | Chrome | Firefox |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `tel` | ✅ | ✅ | ✅ | ✅ | N/A | ✅ | ✅ | ✅ |
| `tel-country-code` | ❓ | ❓ | ❓ | ❓ | N/A | ❓ | ✅ | ❓ |
| `tel-national` | ❓ | ❓ | ❓ | ❓ | N/A | ❓ | ✅ | ✅ |
| `tel-area-code` | ❓ | ❓ | ❓ | ❓ | N/A | ❓ | ✅ | ❓ |
| `tel-local` | ❓ | ❓ | ❓ | ❓ | N/A | ❓ | ✅ | ❓ |
| `tel-local-prefix` | ❓ | ❓ | ❓ | ❓ | N/A | ❓ | ✅ | ❓ |
| `tel-local-suffix` | ❓ | ❓ | ❓ | ❓ | N/A | ❓ | ✅ | ❓ |
| `tel-extension` | ❓ | ❓ | ❓ | ❓ | N/A | ❓ | ✅ | ❓ |

### Contact 系トークン

| トークン | 1Password | Bitwarden | LastPass | Dashlane | KeePassXC | Apple Passwords | Chrome | Firefox |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `email` | ✅ | ✅ | ✅ | ✅ | N/A | ✅ | ✅ | ✅ |
| `impp` | ❌ | ❌ | ❌ | ✅ | N/A | ❌ | ❓ | ❌ |

### Birthday 系トークン

| トークン | 1Password | Bitwarden | LastPass | Dashlane | KeePassXC | Apple Passwords | Chrome | Firefox |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `bday` | ✅ | ❓ | ✅ | ✅ | N/A | ❓ | ❓ | ❓ |
| `bday-day` | ❓ | ❓ | ❓ | ❓ | N/A | ❓ | ❓ | ❓ |
| `bday-month` | ❓ | ❓ | ❓ | ❓ | N/A | ❓ | ❓ | ❓ |
| `bday-year` | ❓ | ❓ | ❓ | ❓ | N/A | ❓ | ❓ | ❓ |

※ Chrome は bday を autofill プロファイルに保存する UI を持たないため、実質的に非対応と推測される。Firefox も同様。

### Misc 系トークン

| トークン | 1Password | Bitwarden | LastPass | Dashlane | KeePassXC | Apple Passwords | Chrome | Firefox |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `sex` | ❓ | ❓ | ✅ | ❓ | N/A | ❓ | ❓ | ❓ |
| `url` | ❓ | ❓ | ❓ | ✅ | N/A | ❓ | ❓ | ❓ |
| `photo` | ❌ | ❌ | ❌ | ❌ | N/A | ❌ | ❌ | ❌ |
| `language` | ❌ | ❌ | ❌ | ❌ | N/A | ❌ | ❌ | ❌ |

### Transaction 系トークン

| トークン | 1Password | Bitwarden | LastPass | Dashlane | KeePassXC | Apple Passwords | Chrome | Firefox |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `transaction-currency` | ❌ | ❌ | ❌ | ❌ | N/A | ❌ | ❌ | ❌ |
| `transaction-amount` | ❌ | ❌ | ❌ | ❌ | N/A | ❌ | ❌ | ❌ |

---

## 修飾子の対応状況

### shipping / billing 修飾子

| PM / ブラウザ | shipping | billing | 備考 |
|---|:---:|:---:|---|
| Chrome | ✅ | ✅ | 住所フォームの shipping/billing 分離に対応 |
| Opera | ✅ | ✅ | Chrome と同様 |
| Firefox | ✅ | ✅ | FormAutofillSection で自動分割 |
| Safari | ⚠️ | ⚠️ | 部分的。独自ヒューリスティックの影響で不安定 |
| 1Password | ❓ | ❓ | 明確なドキュメントなし |
| Bitwarden | ❓ | ❓ | autocomplete 属性自体をあまり参照しない |
| LastPass | ❓ | ❓ | 複数プロファイル対応だが修飾子の尊重は不明 |
| Dashlane | ❓ | ❓ | 明確なドキュメントなし |
| KeePassXC | N/A | N/A | 住所フィルなし |

### section-* トークン

| PM / ブラウザ | 対応 | 備考 |
|---|:---:|---|
| Chrome | ✅ | 複数セクションのフォームを正しく分離 |
| Opera | ✅ | Chrome と同様 |
| Firefox | ✅ | autocomplete のセクション情報を getAutocompleteInfo() で抽出 |
| Safari | ❓ | ドキュメントなし。部分的対応の可能性 |
| 1Password | ❓ | |
| Bitwarden | ❓ | |
| LastPass | ❓ | |
| Dashlane | ❓ | |
| KeePassXC | N/A | |

### home / work / mobile / fax / pager 修飾子

| PM / ブラウザ | 対応 | 備考 |
|---|:---:|---|
| Chrome | ✅ | tel, email, impp に適用可能 |
| Firefox | ❓ | |
| Safari | ❓ | |
| 専用 PM 各種 | ❓ | 明確なサポート情報なし |

---

## ブラウザ組み込み PM vs 専用 PM の違い

| 項目 | ブラウザ組み込み | 専用 PM（1Password 等） |
|---|---|---|
| **autocomplete 属性の尊重** | 高い（特に Chrome） | 中程度（ヒューリスティック併用） |
| **ヒューリスティック検出** | 非常に高度（ML モデル含む） | 中程度〜高度 |
| **対応フィールド範囲** | 広い（住所、CC、名前、電話等） | ログイン中心。Identity/CC は PM による |
| **修飾子サポート** | Chrome/Firefox で対応 | ほぼ不明 |
| **クロスプラットフォーム** | 同一ブラウザ内のみ | マルチブラウザ・マルチデバイス |
| **セキュリティモデル** | ブラウザの暗号化ストレージ | 独自の暗号化ヴォールト |
| **カスタマイズ性** | 低い | 高い（カスタムフィールド等） |
| **TOTP/OTP** | Chrome は非対応 | 多くの PM が対応 |

---

## autocomplete="off" の扱い

### 各ブラウザ・PM の挙動一覧

| PM / ブラウザ | パスワード | 住所・CC | 無視させる方法 |
|---|---|---|---|
| **Chrome** | 無視（autofill する） | 無視する傾向 | なし（ユーザー側で autofill をオフにする） |
| **Firefox** | 無視（PM）/ 尊重可（pref） | 条件付き尊重 | `signon.autofillForms.autocompleteOff` pref |
| **Safari** | 条件付き無視 | 尊重する傾向 | ユーザー設定で制御 |
| **1Password** | 無視 | 無視 | `data-1p-ignore` / `data-op-ignore` |
| **Bitwarden** | 無視 | 無視 | `data-bwignore` |
| **LastPass** | デフォルト無視 | デフォルト無視 | `data-lpignore="true"` + ユーザー設定 |
| **Dashlane** | 無視 | 無視 | `data-form-type="other"` |
| **KeePassXC** | 無視 | N/A | 完全な無視防止方法なし |

### 全 PM 対応の無視属性の組み合わせ

```html
<input
  type="password"
  autocomplete="off"
  data-1p-ignore
  data-bwignore
  data-lpignore="true"
  data-form-type="other"
/>
```

---

## HTTPS 要件

| PM / ブラウザ | HTTP での autofill | 備考 |
|---|---|---|
| **Chrome** | ❌ v86以降で無効化 | 混合コンテンツフォームも無効化。パスワードジェネレータは動作 |
| **Firefox** | ❌ 無効化方針 | Bug 1217152 で実装 |
| **Safari** | ⚠️ 自動プロンプトなし | 手動選択は可能 |
| **1Password** | ✅ 動作する | フィッシング警告を表示する場合あり |
| **Bitwarden** | ✅ 動作する | ブラウザの制限が適用される |
| **LastPass** | ✅ 動作する | |
| **Dashlane** | ✅ 動作する | |
| **KeePassXC** | ✅ 動作する | HTTP/HTTPS 問わず填入（Issue #380 で議論） |

※ Chrome 86 以降: HTTP ページでフォームを填入しようとすると赤い警告テキストが表示され、送信時にはフルページのセキュリティ警告が表示される。

---

## iframe 内のフォームの挙動

| PM / ブラウザ | 同一オリジン | Cross-origin | Sandbox iframe | 備考 |
|---|:---:|:---:|:---:|---|
| **Chrome** | ✅ | ❌ | ❌ | 同一オリジンの非 sandbox のみ |
| **Firefox** | ✅ | ❌ | ❌ | 同一オリジンの非 sandbox のみ |
| **Safari** | ✅ | ❓ | ❓ | |
| **Edge** | ✅ | ⚠️ | ❓ | 警告なしで cross-origin にも填入（セキュリティ懸念） |
| **1Password** | ✅ | ❌（Login）/ ✅（CC） | ❌ | CC は EC サイト対応のため例外 |
| **Bitwarden** | ✅ | ⚠️ | ❓ | 警告プロンプトを表示してユーザーに確認 |
| **LastPass** | ✅ | ❓ | ❓ | |
| **Dashlane** | ✅ | ✅ | ❓ | 各 iframe から独立抽出・集約 |
| **KeePassXC** | ✅ | ⚠️ | ⚠️ | v1.8.12 で cross-origin オプション追加。CVE-2025-65203 脆弱性あり |

---

## Shadow DOM の対応状況

| PM / ブラウザ | 対応 | 備考 |
|---|:---:|---|
| **Chrome** | ✅ | ネイティブ対応 |
| **Firefox** | ⚠️ | Bug 1629226 で対応作業中。部分的 |
| **Safari** | ❓ | |
| **1Password** | ✅ | v4.7.4 以降の companion extension で対応 |
| **Bitwarden** | ❓ | 明確な情報なし |
| **LastPass** | ❌ | Shadow DOM 内のフォームを検出不可との報告 |
| **Dashlane** | ✅ | 独自の Shadow DOM トラバーサル実装。5% 以下のオーバーヘッド |
| **KeePassXC** | ❓ | 明確な情報なし |

---

## SPA（Single Page Application）での課題

### 主な問題点

1. **初期 DOM クロール時にフォームが存在しない**: SPA はハイドレーション後にフォームをレンダリングするため、PM の初回スキャンで見逃される
2. **動的なフィールド ID/name**: フレームワーク（React, Vue 等）が動的に生成する ID は PM のマッチングを妨げる
3. **ステップ分割フォーム**: Email-first ログインなど、複数ステップに分かれたフォームは PM の検出を困難にする

### 推奨対応策

- JavaScript でフィールドを挿入した後、最初の関連フィールドに `focus` イベントを dispatch する
- React では `useEffect` 内でフィールドレンダリングをラップ
- 安定した `id`/`name` 属性を使用（フレームワークが生成するランダムな ID を避ける）
- 明示的な `<label>` 要素を `for` 属性で紐づける
- `autocomplete` 属性を必ず設定する（PM のヒューリスティック検出の補助）

### 各 PM/ブラウザの SPA 対応

- **Chrome**: MutationObserver で DOM 変更を監視。比較的良好
- **Firefox**: フォーカスイベント時に再スキャン。動的フォームにも対応
- **1Password**: 「ユーザーがフィールドをクリックした時点で」分析を実行し、結果をキャッシュ。動的追加された `data-1p-ignore` は尊重されない
- **Bitwarden**: DOM の変更に応じて再スキャンするが、タイミングの問題が発生する場合あり

---

## OS 固有の挙動

### iOS / iPadOS

- **AutoFill フレームワーク**: UIKit の `textContentType` プロパティで autofill ヒントを指定
  - `.username`、`.password`、`.emailAddress`、`.oneTimeCode` 等
- **キーボード連携**: `textContentType` に基づいて適切なキーボードを自動選択。`keyboardType` でさらにカスタマイズ可能
- **Associated Domains**: OTP の AutoFill には `apple-app-site-association` ファイルと Associated Domains Entitlement が必要
- **Safari on iOS vs Chrome on iOS**: iOS では全ブラウザが WebKit エンジンを使用するため、autofill の基本動作は同一。ただし PM 拡張の利用可能性に差がある
- **`inputmode` との組み合わせ**: `inputmode="numeric"` + `autocomplete="one-time-code"` で OTP に最適化されたキーボードと AutoFill を実現

### Android

- **Android Autofill Framework**: `android:autofillHints` 属性を使用。WHATWG 仕様の autocomplete 値にマッピング
- **Chrome on Android**: v137 以降、互換モードを廃止し Android Autofill Framework のネイティブサポートに移行
  - サードパーティ autofill サービス（1Password, Bitwarden 等）がネイティブに Chrome フォームを填入可能に
  - ユーザーは Chrome 設定で「Autofill using another service」を選択
- **Samsung Internet**: Samsung Pass と統合。v25.0.0.41 以降、サードパーティ PM の autofill に問題が発生する報告あり

---

## 独自属性・拡張まとめ

| PM | 無視属性 | その他の独自属性 |
|---|---|---|
| **1Password** | `data-1p-ignore` / `data-op-ignore` | `passwordrules`（Safari と共有） |
| **Bitwarden** | `data-bwignore` | `data-bwautofill`（span 要素への autofill） |
| **LastPass** | `data-lpignore="true"` | フォーム ID に `-search-` を含むと抑制 |
| **Dashlane** | `data-form-type="other"` | `data-form-type="login|password-change|payment"` |
| **KeePassXC** | なし | カスタムフィールド `KPH: ` プレフィックス |

---

## 参考リンク

### 仕様・標準
- [WHATWG HTML Standard - Autofill](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill)
- [MDN - HTML attribute: autocomplete](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/autocomplete)
- [W3C WAI - Autocomplete attribute has valid value](https://www.w3.org/WAI/standards-guidelines/act/rules/73f2c2/)

### 1Password
- [1Password Developer - Compatible Website Design](https://developer.1password.com/docs/web/compatible-website-design/)
- [1Password Support - Credit Card and Address Filling](https://support.1password.com/credit-card-address-filling/)
- [1Password Support - Browser Autofill Security](https://support.1password.com/browser-autofill-security/)
- [1Password Community - autocomplete="off" Discussion](https://www.1password.community/discussions/1password/1password-doesnt-respect-autocompleteoff-attribute-on-select-html-elements/156926)

### Bitwarden
- [Bitwarden Help - Autofill Custom Fields](https://bitwarden.com/help/auto-fill-custom-fields/)
- [Bitwarden Help - Autofill Cards & Identities](https://bitwarden.com/help/auto-fill-card-id/)
- [Bitwarden Community - autocomplete Attribute Support](https://community.bitwarden.com/t/support-the-autocomplete-html-attribute-for-custom-fields/29331)

### LastPass
- [LastPass Support - Prevent Fields from Being Filled](https://support.lastpass.com/s/document-item?language=en_US&bundleId=lastpass&topicId=LastPass/c_lp_prevent_fields_from_being_filled_automatically.html)

### Dashlane
- [Dashlane Blog - Shadow DOM Autofill](https://www.dashlane.com/blog/shadow-dom-better-autofill)
- [Dashlane Blog - Developers Help Us Help Your Users](https://www.dashlane.com/blog/developers-help-us-help-your-users)

### KeePassXC
- [KeePassXC-Browser Issue #1921 - autocomplete="new-password" Support](https://github.com/keepassxreboot/keepassxc-browser/issues/1921)
- [KeePassXC-Browser Issue #2647 - CVE-2025-65203](https://github.com/keepassxreboot/keepassxc-browser/issues/2647)

### Chrome / Chromium
- [Chromium - Form Styles That Chromium Understands](https://www.chromium.org/developers/design-documents/form-styles-that-chromium-understands/)
- [Chrome for Developers - Autofill](https://developer.chrome.com/docs/identity/autofill)
- [Chromium Dev - Ignoring autocomplete="off"](https://groups.google.com/a/chromium.org/g/chromium-dev/c/zhhj7hCip5c)
- [Chrome for Developers - Autofill Insights 2024](https://developer.chrome.com/blog/autofill-insights-2024)

### Firefox
- [Firefox Source Docs - Form Autofill](https://firefox-source-docs.mozilla.org/browser/extensions/formautofill/docs/)
- [Mozilla Wiki - Form Autofill](https://wiki.mozilla.org/Firefox/Features/Form_Autofill)
- [Bugzilla - Disable Autofill on HTTP](https://bugzilla.mozilla.org/show_bug.cgi?id=1217152)

### Safari / Apple
- [Apple Developer - Password AutoFill](https://developer.apple.com/documentation/security/password-autofill)
- [Apple Support - Safari AutoFill](https://support.apple.com/guide/safari/autofill-user-name-and-password-info-ibrwf71ba236/mac)

### 比較・解説記事
- [Cloud Four - Autofill: What Web Devs Should Know, but Don't](https://cloudfour.com/thinks/autofill-what-web-devs-should-know-but-dont/)
- [web.dev - Autofill](https://web.dev/learn/forms/autofill)
- [bitstorm.org - Autofill with the autocomplete attribute](https://bitstorm.org/weblog/2025-4/autofill.html)
- [How Modern Browsers Implement Form Auto-Filling](https://www.w3tutorials.net/blog/how-does-form-auto-filling-in-the-browser-work/)
- [Stefan Judis - How to Turn Off Password Managers for Fields](https://www.stefanjudis.com/snippets/turn-off-password-managers/)
- [JScrambler - Auto-F(a)illing Password Managers and Security Concerns](https://jscrambler.com/blog/auto-failling-password-managers)

### Android / iOS
- [Android Developers - Autofill Framework](https://developer.android.com/identity/autofill)
- [Google Developers Blog - Chrome 3P Autofill Services](https://developers.googleblog.com/en/chrome-3p-autofill-services/)
- [Apple Developer - Enabling Password AutoFill](https://developer.apple.com/documentation/security/enabling-password-autofill-on-a-text-input-view)
