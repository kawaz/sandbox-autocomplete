# 1Password OTP QR コード検出メカニズムの調査

## 調査日: 2026-04-06 〜 2026-04-07

## 判明した事実

### OTP 登録ダイアログのトリガー条件

1Password は以下の条件が全て揃った時に OTP 登録ダイアログを表示する:

1. **ページ内に `<img>` 要素が存在する**（SVG DOM 直接挿入は `<img>` とは扱いが異なる）
2. **その `<img>` が viewport に完全表示されている**（一部でも隠れていると不反応）
3. **以下のテキストシグナルのいずれかが存在する**:
   - `<img>` の `alt` 属性に特定キーワードを含む（`qr code`, `qrcode`, `totp`, `otp`, `authenticator`, `two-factor` 等）
   - ページ内のテキストノードに `otpauth://` を含む

### `<img>` 要素の検出ルール

- **src の種類は問わない**: data URI, same-origin URL, cross-origin URL, blob URL いずれも検出される
- **DOM API による追加は検出される**: `createElement` + `appendChild` で追加された `<img>` は検出される
- **innerHTML による追加は検出されない**: innerHTML で一括挿入された `<img>` は検出されない
- **iframe 内の `<img>` は検出されない**: sandbox iframe 内の要素は対象外

### alt 属性のマッチングルール

- **大文字小文字を区別しない**（case-insensitive）
- **部分一致**: 文字列のどの位置に含まれていても可
- **スペースの有無を区別しない**: `"qrcode"` = `"qr code"`
- **語順は重要**: `"QR Code"` ✅ / `"Code QR"` ❌
- **検出キーワード**: `qr code` / `qrcode` / `totp` / `otp` / `authenticator` / `two-factor`
- **`QR` 単体は不反応**: ただし `OTP QR` のように他のキーワードと組み合わさると反応する
- **alt 属性なし / 空文字は不反応**

### Viewport 可視性のルール

- **IntersectionObserver（threshold: 1.0 相当）** で `<img>` 要素の完全表示を監視
- 画像**全体**が viewport 内に収まった瞬間にトリガー
- 部分表示、ブラウザズームではみ出し、ウィンドウリサイズではみ出しは全て不反応
- ダイアログを閉じた後にスクロールで再表示すると**毎回再トリガー**（debounce なし）
- 画像の**レンダリングサイズが十分大きい**必要がある: QR の1ドットあたり最低 3px 必要（45x45 モジュールの QR で最小 135x135px）
- `max-width:100%;max-height:100vh` で viewport に収めつつ十分なサイズを維持するのが実用的
- `transform:scale()` による視覚的縮小もレンダリング結果が縮小されるため検出されない

### 動的表示で検出させる方法（スクロール不要）

以下の CSS/DOM 変化は IntersectionObserver の再評価をトリガーし、検出される:
- `display:none → display:block`（img 自体 or 親要素）✅
- `position:absolute;left:-9999px → position:static` ✅
- `height:0;overflow:hidden → height:auto` ✅
- `clip-path:inset(100%) → clip-path:none` ✅
- `createElement + appendChild` で img を DOM に追加 ✅
- DOM から `remove()` した img を `appendChild` で再追加 ✅

**注意**: `display:none → block` は親要素のサイズが固定であっても（＝ページレイアウトが一切変化しなくても）検出される。IntersectionObserver は **img 要素自体の交差率変化**を見ており、親のレイアウト変化とは無関係。

以下はレイアウトに影響しないため IntersectionObserver が再評価されず、検出されない:
- `visibility:hidden → visibility:visible` ❌
- `opacity:0 → opacity:1` ❌
- `transform:scale(0) → transform:scale(1)` ❌

### SVG DOM + テキストの検出パス

`<img>` を使わず SVG を DOM に直接挿入した場合:
- SVG DOM 単体では不反応
- SVG DOM + ページ内に `otpauth://` テキストがある場合は反応
- → `otpauth://` テキストの存在が `<img>` 以外の画像要素も検出対象にする

### 1Password 拡張のクラッシュ

- **OTP 登録ダイアログが表示された状態でページ遷移すると拡張がクラッシュする**
- クラッシュ後はポップアップが真っ白になり、全検出が停止
- タブを閉じて1分以上待つと復旧
- 原因: `<com-1password-notification>` カスタム要素がページ遷移時に残存すること

## テスト環境

- テストページ: https://sandbox-autocomplete.oreore.net:8443/otp-trigger-test
- 1Password for Mac 8.12.8 (81208026)

## UI 設計への示唆

OTP セットアップ用 QR コードを表示する際のベストプラクティス:

- `<img alt="QR Code ...">` を設定すると 1Password が自動検出する
- `alt` を設定しない、または `alt="QR"` だけだと検出されない
- `otpauth://` URI をページ内にテキスト表示すると、alt に関係なく検出される
- `createElement` + `appendChild` で img を追加すること（innerHTML は検出されない）
- SPA でのページ遷移時、OTP ダイアログが出た状態で遷移すると拡張がクラッシュする
  - ワークアラウンド: ページ遷移前に `<com-1password-notification>` を除去する

## 1Password 拡張のクラッシュ問題

### 再現条件

OTP 登録ダイアログが表示された状態で、ダイアログを閉じずにページ遷移すると 1Password 拡張がクラッシュする。

- ダイアログを閉じてからページ遷移すればクラッシュしない
- クラッシュ後はポップアップが白くなり、全ての検出が停止
- タブを閉じて1分以上待つと復旧

### ワークアラウンド（UserScript）

**Gist**: https://gist.github.com/kawaz/b1608032dcb58bf4200cb93e8aecb7ca

```js
// ==UserScript==
// @name         1Passwordのクラッシュ問題をパッチ
// @description  1Passwordの通知ダイアログが出てる最中にページ遷移すると暫く1Password拡張が真っ白で使えなくなる問題を解決するワークアラウンド
// @namespace    http://x.com/kawaz
// @version      2026-04-07
// @author       kawaz
// @match        https://*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=1password.com
// @grant        none
// ==/UserScript==

const rmOP=()=>document.querySelector('com-1password-notification')?.remove();
window.addEventListener('beforeunload', rmOP);
window.navigation?.addEventListener('navigate', rmOP);
```

`beforeunload`（従来のページ遷移）と `navigation.navigate`（SPA のページ遷移）の両方で `<com-1password-notification>` を事前除去する。

---

## 検証の詳細

> 追加検証を行った際は、このセクションにテスト結果を追加し、先頭の「判明した事実」セクションも更新すること。

### テスト方法論

1. 各テストの前に M（確実に反応するベースライン）を開いて拡張の正常動作を確認
2. ページ移動は間隔を空ける（拡張のコンテンツスクリプト初期化待ち）
3. OTP ダイアログが出たら必ず閉じてからページ遷移（クラッシュ防止）
4. 無反応の場合は拡張の状態（ポップアップが白くないか）を確認
5. 結果が前回と異なる場合は少なくとも3回再現を確認

### 基本テスト (A-P)

| バリアント | 内容 | 結果 | 備考 |
|---|---|---|---|
| A | `autocomplete="one-time-code"` input のみ | ❌ | input フィールド単体では反応しない |
| B | otpauth:// URI テキスト表示のみ | ❌ | テキスト単体では反応しない |
| C | QR コード（SVG DOM 直接挿入）のみ | ❌ | SVG DOM 単体では反応しない |
| D | 通常 URL の QR コード — コントロール | ❌ | 期待通り |
| E | `<a href="otpauth://...">` リンク | ❌ | リンクの href は検査対象外 |
| F | 空ページ — コントロール | ❌ | 期待通り |
| G | `<input type="hidden" value="otpauth://...">` | ❌ | hidden input は検査対象外 |
| H | `data-otp-uri="otpauth://..."` | ❌ | data 属性は検査対象外 |
| **I** | **QR コード（SVG DOM）+ otpauth テキスト** | **✅** | SVG + テキストの組み合わせで反応 |
| J | ボタンクリックで QR 遅延表示 | ❌ | innerHTML 動的生成 |
| K | クリップボードコピーボタン（data 属性に格納） | ❌ | |
| L | JS 変数のみ（DOM に非表示） | ❌ | JS メモリ内は検査対象外 |
| **M** | **`<img>` SVG data URI** | **✅** | alt="QR Code" を含む |
| N | HTML コメント内の otpauth URI | ❌ | コメントノードは検査対象外 |
| O | ボタンクリックで otpauth テキスト遅延表示 | ❌ | |
| P | iframe 内の QR コード | ❌ | sandbox iframe 内は検査対象外 |

### スクロール依存性テスト (Q-U)

| バリアント | 内容 | 結果 | 備考 |
|---|---|---|---|
| Q | `<img>` QR + 上下150vhスペーサー | ✅ 毎回 | 画像全体が viewport に入った瞬間に反応 |
| R | SVG QR + otpauth テキスト + スペーサー | ✅ 毎回 | Q と同じ挙動 |
| S | SVG QR のみ + スペーサー（テキストなし） | ❌ | |
| T | JS 遅延生成（innerHTML）→ スクロール | ❌ | innerHTML 挿入のため |
| U | otpauth テキストのみ + スペーサー | ❌ | |

Viewport 可視性の詳細:
- 画像全体（上下左右）が viewport に収まった瞬間に反応
- 部分表示では不反応
- ブラウザズームで画像がはみ出す → 何度スクロールしても不反応
- ウィンドウリサイズではみ出し → 不反応。全体が入った瞬間に反応
- ダイアログを閉じてスクロールで再表示 → 毎回再トリガー

### 画像ソース別テスト (V-Z)

| バリアント | src の種類 | 結果 |
|---|---|---|
| V | data URI | ✅ |
| W | same-origin URL (`/qr.svg`) | ✅ |
| X | cross-origin URL (`qr-cdn.oreore.net`) | ✅ |
| Y | cross-origin + `crossorigin="anonymous"` | ✅ |
| Z | blob URL | ✅ |

**src の種類は検出に影響しない。**

注: 第2ラウンドでは W-Z が無反応だったが、拡張クラッシュによる誤結果と判明（第3ラウンドで確定）。

### 遅延生成テスト (T, T3)

| バリアント | 追加方法 | 結果 |
|---|---|---|
| T | innerHTML で img + data URI 挿入 | ❌ |
| T3 | createElement + appendChild | ✅ |

innerHTML は MutationObserver に個別ノードとして通知されないため検出されない。

### MXD デバッグテスト（alt 属性の発見）

| バリアント | alt 属性 | ページ内テキスト | 結果 |
|---|---|---|---|
| MXD1 | `QR` | なし | ❌ |
| MXD5 (V clone) | `QR Code (data URI)` | note あり | ✅ |
| MXD6 | `QR Code (data URI)` | なし | ✅ |
| MXD7 | `QR` | `data:image/svg+xml;base64,...` | ❌ |
| MXD8 | `QR` | `Hello World` | ❌ |
| MXD9 | `QR` | `otpauth://...` | ✅ |
| MXD10 | `QR Code (data URI)` | なし | ✅ |

→ alt に "QR Code" を含むか、ページに otpauth テキストがあれば反応。

### alt 属性境界値テスト (ALT-1〜17)

| # | alt 属性値 | 結果 |
|---|---|---|
| 1 | `QR Code` | ✅ |
| 2 | `QR` | ❌ |
| 3 | `qr code` | ✅ |
| 4 | `Qr Code` | ✅ |
| 5 | `QR CODE` | ✅ |
| 6 | `qrcode` | ✅ |
| 7 | `QRCode` | ✅ |
| 8 | `QR Code for OTP setup` | ✅ |
| 9 | `Scan this QR Code` | ✅ |
| 10 | `Code QR` | ❌ |
| 11 | `QR code image` | ✅ |
| 12 | `Two-factor authentication QR` | ✅ |
| 13 | `TOTP setup` | ✅ |
| 14 | `OTP QR` | ✅ |
| 15 | `Authenticator setup code` | ✅ |
| 16 | alt 属性なし | ❌ |
| 17 | `""` (空文字) | ❌ |

### CSS 可視性変化テスト (VIS-1〜10)

スクロール不要な画面で、ボタンクリックにより QR の表示状態を動的に変更して検出されるかのテスト。
全て alt="QR Code" を使用。

| # | 初期状態 | ボタン操作 | 結果 |
|---|---|---|---|
| VIS1 | `display:none` | → `display:block` | ✅ |
| VIS2 | `visibility:hidden` | → `visibility:visible` | ❌ |
| VIS3 | `opacity:0` | → `opacity:1` | ❌ |
| VIS4 | `position:absolute;left:-9999px` | → `position:static` | ✅ |
| VIS5 | img なし | → `createElement + appendChild` | ✅ |
| VIS6 | 親 div が `display:none` | → 親を `display:block` | ✅ |
| VIS7 | img を DOM から `remove()` | → `appendChild` で再追加 | ✅ |
| VIS8 | `height:0;overflow:hidden` | → `height:auto` | ✅ |
| VIS9 | `transform:scale(0)` | → `scale(1)` | ❌ |
| VIS10 | `clip-path:inset(100%)` | → `clip-path:none` | ✅ |
| VIS11 | 固定サイズ親 div 内で `display:none` | → `display:block` | ✅ |
| VIS12 | 固定サイズ親 + `visibility:hidden` | → `visibility:visible` | ❌ |
| VIS13 | 固定サイズ親 + `opacity:0` | → `opacity:1` | ❌ |
| VIS14 | `transform:scale(0.1)`（レイアウト200px、視覚的に極小） | 初期状態 | ❌ |
| VIS15 | `width:20px;height:20px` | 初期状態 | ❌ |
| VIS16 | `width:1px;height:1px` | 初期状態 | ❌ |
| VIS17 | `50x50px` + `object-fit:contain` | 初期状態 | ❌ |
| VIS18 | `max-width:100%;max-height:100vh` | 初期状態 | ✅ |

#### 分析

**反応するパターン（スクロールなしで動的表示可能）:**
- `display:none → block`（VIS1, VIS6）: display 変化は IntersectionObserver のエントリ再評価をトリガーする
- `left:-9999px → static`（VIS4）: レイアウト位置の変化
- `createElement + appendChild`（VIS5）: MutationObserver + IntersectionObserver の連携
- DOM 再追加（VIS7）: remove → appendChild も MutationObserver で検出
- `height:0 → auto`（VIS8）: サイズ変化で IntersectionObserver が再評価
- `clip-path:inset(100%) → none`（VIS10）: clip-path 変化
- 固定サイズ親 div 内での `display:none → block`（VIS11）: 親のレイアウトが変化しなくても img 要素自体の display 変化で IntersectionObserver が発火

**反応しないパターン:**
- `visibility:hidden → visible`（VIS2）: visibility の変化は IntersectionObserver のエントリ交差率を変えない（要素のレイアウト上のサイズ・位置は変わらない）
- `opacity:0 → 1`（VIS3）: 同上。opacity は視覚的な透明度だけでレイアウトに影響しない
- `transform:scale(0) → scale(1)`（VIS9）: transform もレイアウトに影響しない（視覚的な変換のみ）
- 固定サイズ親 div 内でも `visibility:hidden → visible`（VIS12）、`opacity:0 → 1`（VIS13）は不反応: 親のレイアウト固定は無関係。img 自体の IntersectionObserver エントリの交差率が変化しないことが原因

→ **IntersectionObserver は img 要素自体のエントリ交差率を監視**している。`display:none` の要素は交差率 0 であり、`display:block` になった瞬間に交差率 1.0 に変化するため発火する。`visibility:hidden` や `opacity:0` はレイアウト上は通常サイズで存在し交差率 1.0 のまま変化しないため、発火しない。親要素のレイアウト変化は無関係。

**画像サイズの閾値:**
- `max-width:100%;max-height:100vh`（VIS18）: ✅ — viewport に収めつつ十分なサイズを維持
- `transform:scale(0.1)`（VIS14）: ❌ — レンダリング結果が縮小されて QR デコード不可
- `50x50px`（VIS17）、`20x20px`（VIS15）、`1x1px`（VIS16）: 全て ❌ — 画像が小さすぎてデコード不可

→ IntersectionObserver で viewport 内判定された後、1Password は画像のレンダリング結果を取得して QR デコードを試みる。画像サイズが小さすぎるとデコードに失敗し、ダイアログは表示されない。

### ドットサイズ閾値テスト (DOT1〜6)

QR コード（45x45 モジュール）のセルサイズ（cellSize）を変えて、検出に必要な最小レンダリングサイズを検証。

| # | cellSize | 画像サイズ | 結果 |
|---|---|---|---|
| DOT1 | 1px/dot | 45x45px | ❌ |
| DOT2 | 2px/dot | 90x90px | ❌ |
| DOT3 | 3px/dot | 135x135px | ✅ |
| DOT4 | 4px/dot | 180x180px | ✅ |
| DOT5 | 5px/dot | 225x225px | ✅ |
| DOT6 | 6px/dot | 270x270px | ✅ |

→ **3px/dot（135x135px）が検出可能な最小サイズ。** 1-2px/dot では QR デコーダーの精度が不足する。
