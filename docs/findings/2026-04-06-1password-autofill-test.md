# 1Password オートフィル テスト結果

## テスト環境

- パスワードマネージャー: 1Password
- テストページ: https://sandbox-autocomplete.oreore.net:8443
- テスト日: 2026-04-06

## テスト結果

### 1. キーワード (on / off)

| autocomplete | 補完発生 | 補完内容 | 備考 |
|---|---|---|---|
| `on` | ❌ | — | 何も補完されない |
| `off` | ❌ | — | 何も補完されない |

**所見**: `on`/`off` 単体では 1Password は反応しない。具体的なフィールドトークン（`name`, `email` 等）が必要と思われる。

### 2. 氏名 (Name)

| autocomplete | 補完発生 | 補完内容 | 備考 |
|---|---|---|---|
| `name` | ✅ | name のみ埋まる | プロファイル選択で name フィールドだけが入力される |
| `given-name` | ✅ | given-name + family-name が同時に埋まる | プロファイル選択で2フィールドが連動 |
| `additional-name` | ✅ | given-name + family-name が同時に埋まる | additional-name 自体はプロファイルに登録なし（空）だが補完UIは反応する |
| `family-name` | ✅ | given-name + family-name が同時に埋まる | given-name と同じ挙動 |
| `honorific-prefix` | ❌ | — | 補完自体が発生しない。プロファイルにも該当データなし |
| `honorific-suffix` | ❌ | — | 補完自体が発生しない。プロファイルにも該当データなし |
| `nickname` | （未テスト） | — | — |

**所見**:
- `name` は独立したフィールドとして扱われ、選択すると `name` だけが埋まる
- `given-name`, `additional-name`, `family-name` は**グループとして連動**する。どのフィールドでプロファイルを選んでも、given-name と family-name が同時に埋まる
- `honorific-prefix`/`honorific-suffix` は 1Password が対応していないか、プロファイルにデータがない場合は補完UIすら表示しない
- additional-name はプロファイルにデータがなくても補完UIは表示される（同グループの given-name/family-name にデータがあるため）

### 3. 認証情報 (Credentials)

| autocomplete | 補完発生 | 補完内容 | 備考 |
|---|---|---|---|
| `username` | ✅ | username + current-password が同時に埋まる | ホスト名に関連付けられた保存済みエントリが候補に表示された |
| `current-password` | ✅ | username + current-password が同時に埋まる | username と連動。選択した瞬間に submit も自動発生 |
| `new-password` | ✅ | 推奨パスワード（ランダム生成）が表示された | 1Password のパスワードジェネレーターが起動 |
| `one-time-code` | ⚠️ | 補完UI表示なし | username + current-password が埋まった後に submit が自動発生し、OTP 入力の機会がなかった。このホスト名に OTP を持つエントリが存在しないため未検証 |

**所見**:
- `username` と `current-password` は**ログインフォームグループ**として連動する。どちらかでプロファイルを選択すると両方が埋まる
- 選択時に **submit が自動発生**する（1Password のログインフォーム検出機能）
- `new-password` は既存パスワードの補完ではなく、**パスワードジェネレーター**が起動する
- `one-time-code` は同一フォーム内に username/current-password があると、ログインフローとして先に submit されてしまう。OTP は別画面（別フォーム）で提示するのが実運用のパターンと思われる
- このホスト名に OTP 登録済みエントリがないため、one-time-code 単独での補完動作は未検証

### 20. new-password 文字種・文字長制限テスト

1Password のパスワードジェネレーターが各種制限属性にどう反応するかの検証。

| ページ | 制限 | 生成結果 | 備考 |
|---|---|---|---|
| 20a | 制限なし | 19文字、英数記号 | デフォルト |
| 20b | `minlength="20"` | 20文字 | **minlength に従う** |
| 20c | `maxlength="8"` | 8文字 | **maxlength に従う** |
| 20d | `minlength="12" maxlength="16"` | 16文字 | maxlength に合わせる（範囲内の最大） |
| 20e | `pattern="[a-zA-Z0-9]{8,16}"` | デフォルトの文字種（記号含む） | **pattern は無視される** |
| 20f | `pattern="[0-9]{4}"` | デフォルトの文字種（記号含む） | **pattern は無視される** |
| 20g | 複雑な pattern | デフォルトの文字種（記号含む） | **pattern は無視される** |
| 20h | `passwordrules="minlength:20; maxlength:30; required:upper,lower,digit,special"` | 20文字、大小英数記号、**記号の割合が通常より大幅に多い（半数近く）** | **passwordrules に従う** |
| 20i | `passwordrules="minlength:8; maxlength:8; required:digit; allowed:digit"` | 数字8桁 | **passwordrules の allowed で文字種制御可能** |
| 20j | `passwordrules="minlength:6; maxlength:6; allowed:digit"` | 数字6桁 | PIN パターンに対応 |
| 20k | `minlength="32" maxlength="64"` | 32文字 | minlength に合わせる |
| 20l | `passwordrules="minlength:16; required:upper,lower,digit"` + `minlength="16" maxlength="32"` | 20文字、記号なし | passwordrules で special を required にも allowed にもしていないため記号なし |
| 20m | new-password × 2（confirm パターン） | 両方同じ値 | ジェネレーターで生成した値が両方に入る |

**所見**:

- **`minlength` / `maxlength` に対応**: パスワードジェネレーターが文字数制限に従う
- **`pattern` は完全に無視**: HTML の pattern 属性では文字種を制御できない
- **`passwordrules` に対応（Apple 提唱仕様）**: 文字種（required/allowed）と文字数を制御可能
  - `required: upper, lower, digit, special` で必須文字種を指定
  - `allowed: digit` で使用可能文字種を制限（数字のみ PIN 生成など）
  - required に含めず allowed にも含めない文字種は使用されない（20l で special を指定せず → 記号なし）
- **passwordrules で記号必須にすると記号の割合が大幅に上がる**: 通常は20文字中1-3文字程度だが、passwordrules で required: special にすると半数近くが記号になる
- **confirm password**: new-password が2つあると同じ生成パスワードが両方に入る

### 4. 組織 (Organization)

| autocomplete | 補完発生 | 補完内容 | 備考 |
|---|---|---|---|
| `organization-title` | ❌ | — | 補完 UI が表示されない |
| `organization` | ❌ | — | 補完 UI が表示されない |

**所見**:
- 1Password の Identity に組織情報が登録されていないか、organization フィールドの自動検出に対応していない可能性
- もしくは 1Password が組織フィールドを Identity アイテムとして認識していない

### 5. 住所 — shipping

各フィールドで補完を実行した際に、他のどのフィールドが連動して補完されるかを調査。

| 補完を実行したフィールド | 連動して補完されたフィールド | 備考 |
|---|---|---|
| `shipping street-address` | address-level2, address-level1, country, postal-code | |
| `shipping address-line1` | address-level2, address-level1, country, postal-code | |
| `shipping address-line2` | address-line1, address-level2, address-level1, country, postal-code | **address-line2 自体は補完されなかった** |
| `shipping address-line3` | street-address, address-level2, address-level1, country, postal-code | |
| `shipping address-level4` | address-level2, address-level1, country, postal-code | |
| `shipping address-level3` | address-level2, address-level1, country, postal-code | |
| `shipping address-level2` | street-address, address-level1, country, postal-code | |
| `shipping address-level1` | street-address, address-level2, country, postal-code | |
| `shipping country` | street-address, address-level2, address-level1, postal-code | |
| `shipping country-name` | street-address, address-level2, address-level1, postal-code | **country は補完されない**（country-name と country は排他的） |
| `shipping postal-code` | street-address, address-level2, address-level1, country | |

**所見**:

- **コアグループ**: `address-level2`, `address-level1`, `country`, `postal-code` は常に連動して補完される（address-line 系の補完でも含まれる）
- **street-address vs address-line**: street-address と address-line1 は互いに補完しあわない。address-line2 を補完すると address-line1 が連動するが address-line2 自体は補完されない（1Password に address-line2 相当のデータがない可能性）
- **address-line3**: 補完すると street-address が連動（line1 ではなく street-address）
- **address-level3/4**: コアグループのみ連動。level3/4 自体に対応するデータがない可能性
- **country vs country-name**: 排他的に扱われる。country-name を補完しても country は埋まらない
- **address-line2**: 唯一、自身を補完できないフィールド。1Password の Identity データに address-line2 が設定されていない可能性

### 5b. 住所バリエーション

select、分割入力等の実際のフォームパターンでのテスト。

| フィールド | パターン | 補完結果 | 備考 |
|---|---|---|---|
| `shipping postal-code` (1つ目) | `<input maxlength="3">` | `xxx-xxxx` 形式で入力された | **maxlength を無視**してハイフン付き全体が入力される |
| `shipping postal-code` (2つ目) | `<input maxlength="4">` | 変化なし | 同じ autocomplete 値が2つある場合、1つ目にのみ入力される |
| `shipping address-level1` | `<select>` (都道府県リスト) | 千葉県 | select でも正しく補完される |
| `shipping address-level1` | `<input type="text">` | 千葉県 | 通常 input と同じ |
| `shipping country` | `<select>` (ISO コード) | JP | select でも正しく補完される |
| `shipping country` | `<input type="text">` | JP | 通常 input と同じ |
| `shipping address-level2` | `<input type="text">` | 柏市 | |
| `shipping address-line1` | `<input type="text">` | 新富町2-10-5 | |

**所見**:

- **maxlength は無視される**: 1Password は maxlength 属性を考慮せず、郵便番号全体（xxx-xxxx 形式）を入力する
- **同一 autocomplete の2つ目は無視**: postal-code が2つあっても1つ目にのみ入力され、2つ目は変化なし。郵便番号を前半・後半に分割する日本式フォームでは正しく動作しない
- **select 要素に対応**: address-level1（都道府県）と country の select 補完が正しく機能する
- **連動補完**: 1つのフィールドで補完すると、同ページ内の他の住所フィールドも一斉に埋まる（5. の結果と同様）

### 5c-5i. 住所フィールド順序・select テスト

postal-code で補完を発動し、フォーム構成の違いによる連動補完の挙動を検証。

| ページ | フォーム構成 | 結果 |
|---|---|---|
| 5c | postal + country + country-name | country のみ埋まる（先にある方） |
| 5d | postal + country-name + country | country-name のみ埋まる（先にある方） |
| 5e | postal + country のみ | country 埋まる |
| 5f | postal + country-name のみ | country-name 埋まる |
| 5g | postal + 都道府県 select(value=コード) | 千葉県が選択される（label マッチ） |
| 5h | postal + 国 select(value=ISO コード) | 日本(JP)が選択される（label マッチ） |
| 5i | postal + 都道府県 select(value=label) | 千葉県が選択される（対照） |

**所見**:

- **country / country-name は排他的**: 同一フォームに両方ある場合、**DOM 上で先に現れる方だけ**が補完される。後の方は無視
- **country-name 単独でも補完される**: country がなくても country-name があればそこに国名が入る
- **select は label（表示テキスト）でマッチ**: value がコード番号（01-47, JP 等）でも、label に都道府県名・国名があれば正しく option が選択される
- 1Password は select の補完時に option の label テキストと保存データを照合し、一致する option を選択している

### 6. 住所 — billing

（未テスト）

### 7. クレジットカード (Credit Card)

| autocomplete | 補完発生 | 補完内容 | 備考 |
|---|---|---|---|
| `cc-name` | ✅ | YOSHIAKI KAWAZU | cc-number, cc-exp-month, cc-exp-year, cc-csc も連動 |
| `cc-given-name` | ✅ | — | cc-family-name とペアで補完。cc-name は補完されない |
| `cc-additional-name` | — | — | （未テスト） |
| `cc-family-name` | ✅ | — | cc-given-name とペアで補完。cc-name は補完されない |
| `cc-number` | ✅ | 16桁カード番号 | cc-name, cc-exp-month, cc-exp-year, cc-csc も連動 |
| `cc-exp` | ✅ | 04/27 | cc-exp-month, cc-exp-year は補完されない（排他） |
| `cc-exp-month` | ✅ | 04 | cc-name, cc-number, cc-exp-year, cc-csc と連動 |
| `cc-exp-year` | ✅ | 2027 | cc-name, cc-number, cc-exp-month, cc-csc と連動 |
| `cc-csc` | ✅ | セキュリティコード | cc-name, cc-number, cc-exp-month, cc-exp-year と連動 |
| `cc-type` | — | — | （未テスト） |

**所見**:

- **cc-name と cc-given-name/cc-family-name は排他的**: cc-name で補完すると given/family は埋まらず、given/family で補完すると name は埋まらない。country / country-name と同じ先着ルール
- **cc-exp と cc-exp-month/cc-exp-year も排他的**: cc-exp で補完すると "04/27" 形式で入るが、exp-month/exp-year は埋まらない。逆に exp-month/year で補完すると cc-exp は埋まらない
- **コアグループ**: cc-number, cc-exp-month, cc-exp-year, cc-csc は常に連動
- **cc-name はコアグループの一部**: cc-name で補完するとコアグループも埋まる
- **名前の自動スプリット**: 1Password には "YOSHIAKI KAWAZU" とだけ登録しているが、cc-given-name / cc-family-name で補完するとスペースで分割して適切に振り分けられる。1Password が内部でフルネームを given/family に自動分割している
- **type="password" でも補完可能**: cc-csc を `type="password"` に変更しても正しく補完される。autocomplete 属性が優先され、input type は補完の可否に影響しない

### 8. 取引 (Transaction)

| autocomplete | 補完発生 | 備考 |
|---|---|---|
| `transaction-currency` | ❌ | 補完 UI が表示されない |
| `transaction-amount` | ❌ | 補完 UI が表示されない |

**所見**:
- 1Password に取引関連のデータフィールドが存在しないため、補完対象にならない

### 9-13. 電話番号 (Telephone)

9〜13 の全電話番号カテゴリ（home / work / mobile / fax / pager）で補完 UI が一切表示されない。

| カテゴリ | 結果 | 備考 |
|---|---|---|
| 9. home tel 全フィールド | ❌ | 補完 UI 自体が表示されない |
| 10. work tel | ❌ | 同上 |
| 11. mobile tel | ❌ | 同上 |
| 12. fax tel | ❌ | 同上 |
| 13. pager tel | ❌ | 同上 |

**所見**:
- 1Password の Identity に電話番号が登録されていないか、tel 系 autocomplete トークンに対応していない可能性
- フリガナテスト（19i-k）で `phonetic-*` → `phone` マッチで電話番号が誤入力されたことから、1Password 内に電話番号データは存在する
- → autocomplete="tel" 等の**標準トークンでは**電話番号フィールドを認識していない可能性が高い（name 属性の "phone" ヒューリスティックでのみ検出）

### 9b-9j. 電話番号コンテキストテスト

他のフィールドがある場合に tel が連動するか、および name 属性ヒューリスティックの検証。

| ページ | tel フィールドの指定 | given-name で発動時の tel 連動 | 備考 |
|---|---|---|---|
| 9b | `autocomplete="tel"` | ❌ | email と tel は連動しない |
| 9c | `autocomplete="tel"` | ✅ | **name 系 + tel は連動する** |
| 9d | `autocomplete="tel"` | ✅ | 住所系 + tel も連動 |
| 9e | `name="phone" autocomplete="tel"` | ✅ | ヒューリスティック + autocomplete 共存 |
| 9f | `name="phone"` (autocomplete なし) | ✅ | name="phone" ヒューリスティック |
| 9g | `name="telephone"` | ✅ | "telephone" マッチ |
| 9h | `name="tel"` | ❌ | "tel" はマッチしない |
| 9i | `name="mobile"` | ✅ | "mobile" マッチ |
| 9j | `label="電話番号"` | ❌ | 日本語ラベルはマッチしない |

**所見**:

- **tel 系は単独では補完 UI が出ないが、Identity の他フィールド（name, address 等）と同じフォームにあれば連動する**
- **email とは連動しない**: email は別カテゴリ扱い
- **name 属性ヒューリスティック**: `phone` ✅, `telephone` ✅, `mobile` ✅, `tel` ❌
- **"tel" がマッチしない理由**: 短すぎるキーワード、または 1P のキーワードリストに含まれない
- **日本語ラベルは非対応**: `label="電話番号"` では検出されない

### 14. 連絡先 (Contact)

| autocomplete | 補完発生 | 補完内容 | 備考 |
|---|---|---|---|
| `email` | ✅ | メールアドレス | 自身のみ補完。他の email フィールドは連動しない |
| `home email` | ✅ | メールアドレス | 自身のみ補完 |
| `work email` | ✅ | メールアドレス | 自身のみ補完 |
| `impp` | ❌ | — | 補完 UI が表示されない |

**所見**:
- **email は各フィールドが独立**: email, home email, work email の3つはそれぞれ自身のみ補完され、他の email フィールドには連動しない
- **home/work 修飾子**: 補完は発生するが、1Password が home/work を区別して別のメールアドレスを入力するかは不明（同じアドレスが入った可能性）
- **impp は非対応**: インスタントメッセージングプロトコルのエンドポイントは 1Password に登録データがないか、対応していない

### 15. 誕生日 (Birthday)

| autocomplete | 補完発生 | 備考 |
|---|---|---|
| `bday` | ❌ | 補完 UI が表示されない |
| `bday-day` | ❌ | 同上 |
| `bday-month` | ❌ | 同上 |
| `bday-year` | ❌ | 同上 |

**所見**:
- 全フィールドで補完 UI が表示されない
- tel と同様、name 系フィールドと同じフォームにあれば連動する可能性（要検証）
- または 1Password の Identity に誕生日が登録されていない可能性

### 15b-15f. 誕生日コンテキストテスト

他のフィールドがある場合に bday が連動するか、および name 属性ヒューリスティックの検証。

| ページ | 構成 | bday 連動 | 備考 |
|---|---|---|---|
| 15b | given-name + bday | ✅ | name 系と連動 |
| 15c | given-name + bday-year/month/day | ✅ | 分割フィールドも連動 |
| 15d | postal-code + bday | ✅ | 住所系とも連動 |
| 15e | given-name + `name="birthday"` | ✅ | "birthday" ヒューリスティック |
| 15f | given-name + `name="date_of_birth"` | ✅ | "date_of_birth" ヒューリスティック |

**所見**:
- tel と同じパターン: **bday 系も単独では補完 UI が出ないが、Identity の他フィールド（name, address 等）と同じフォームにあれば連動する**
- name 属性ヒューリスティック: `birthday` ✅, `date_of_birth` ✅
- bday と bday-day/month/year の排他関係は未検証（同一フォームに両方ある場合）

### 16. その他 (Miscellaneous)

| autocomplete | 補完発生 | 備考 |
|---|---|---|
| `sex` | ❌ | 1Password の Identity に該当フィールドなし |
| `url` | ❌ | 同上 |
| `photo` | ❌ | 同上 |
| `language` | ❌ | 同上 |

**所見**:
- 全フィールドで補完 UI が表示されない
- tel/bday と異なり、1Password の Identity テンプレートにこれらに対応するフィールドが存在しないため、連動テストも不要
- カスタムフィールドを追加すれば name 属性ヒューリスティックで補完可能になる可能性はある（フリガナテストで確認済みの挙動）

### 17. section- プレフィックス

section-blue (given-name, family-name, email) と section-red (given-name, family-name, email) の6フィールドでの検証。

**結果**:

- `section-red given-name` で補完 → `section-red given-name` と `section-blue family-name` が埋まる
- given-name / family-name は section を無視して先着ルール適用: 同じカテゴリのフィールドは DOM 順で最初に見つかった空のフィールドに入る
- email はどこで補完しても**空のフィールド全て**に同じ値が埋まる
- ただし既に値が入っているフィールドは上書きしない（手動で空にしてから別のメアドを選択すると、もう一方は上書きされない）

**所見**:

- **1Password は `section-*` プレフィックスを認識していない**: section-blue と section-red を区別せず、純粋に autocomplete トークン（given-name, family-name, email）だけで判定
- **name/family-name は先着ルール**: 同じカテゴリのフィールドが複数ある場合、DOM 順で先の空フィールドに入る
- **email は全空フィールドに同一値を入力**: email は先着ルールではなく、空の email フィールド全てに同じ値を入れる（name 系と異なる挙動）
- **既存値の保護**: 手動入力済みのフィールドは上書きしない

### 18. WebAuthn

| autocomplete | 補完発生 | 補完内容 | 備考 |
|---|---|---|---|
| `username webauthn` | ✅ | username が埋まる | **Identity ではなく Login カテゴリ**のエントリが候補に表示される |

**所見**:
- `webauthn` トークンにより、Identity ではなく **Login カテゴリ**の保存済みエントリが候補に表示される
- FQDN（oreore.net）にマッチするエントリが候補として出現
- 選択すると username フィールドが埋まる
- パスキー対応の認証フローで使用されることを想定したトークン

### 22a. Passkey 登録（基本）

`navigator.credentials.create()` を呼び出した結果:

**1Password の挙動**:
- Passkey 登録ダイアログが表示される
- 保存すると以下の credential 情報が返される:
  - type: public-key
  - authenticatorAttachment: platform
  - clientDataJSON.type: webauthn.create
  - clientDataJSON.origin: https://sandbox-autocomplete.oreore.net:8443
  - transports: ["internal", "hybrid"]
  - publicKeyAlgorithm: -7 (ES256)

**1Password ダイアログを閉じた場合（Chrome のフォールバック）**:
- Chrome から「別の方法で保存、キャンセル、作成」の3ボタンダイアログが表示
- 「作成」→ Chrome（Google パスワードマネージャ）に保存
- 「別の方法で保存」→ 以下の選択肢:
  1. Google パスワードマネージャ — Google アカウントに紐付けて保存
  2. iCloud キーチェーン — Touch ID を求められる
  3. スマートフォンまたはセキュリティキー — FIDO CTAP2 hybrid transport (caBLE) 用 QR コードが表示される。スマートフォンで読み取ると BLE 経由で認証器として機能
  4. 自分の Chrome プロフィール — この PC のみに保存

**QR コードの内容**: FIDO CTAP2 の caBLE (cloud-assisted BLE) プロトコル用。`FIDO:/` で始まる URI で、公開鍵とルーティング情報が含まれる。スマートフォン側の認証器と Bluetooth Low Energy で通信するためのもの。

**所見**:
- 1Password が最優先で Passkey 登録を処理する
- 1Password が処理しない場合、Chrome が複数の保存先を提示するフォールバック UI を表示
- transports に "hybrid" が含まれており、クロスデバイス認証にも対応

### 22b. Passkey 認証（基本）

`navigator.credentials.get()` を `allowCredentials: []`（discoverable credentials）で呼び出した結果:

**1Password の挙動**:
- 22a で登録した2つのパスキーが「パスキーでサインイン」ダイアログに表示される
- 選択すると以下の assertion 情報が返される:
  - type: public-key
  - authenticatorAttachment: platform
  - clientDataJSON.type: webauthn.get
  - clientDataJSON.origin: https://sandbox-autocomplete.oreore.net:8443
  - signature: ECDSA 署名（ES256）
  - userHandle: 登録時の user.id に対応

**1Password ダイアログを閉じた場合（Chrome のフォールバック）**:
- QR コード + セキュリティキーメッセージのダイアログが表示される（22a のフォールバックとは異なり、Chrome プロフィール等の選択肢はなし）

**所見**:
- 1Password が discoverable credentials を正しく管理し、rpId (`oreore.net`) に紐づくパスキーを一覧表示する
- 登録で2回実行した結果、2つのパスキーが候補に出る（重複登録が可能）
- 認証時のフォールバック UI は登録時より簡素（QR + セキュリティキーのみ）

### 22c. Passkey 条件付き認証（Conditional UI）

`autocomplete="username webauthn"` + `mediation: "conditional"` でページロード時に呼び出した結果:

**1Password の挙動**:
- ページロード時に「Conditional Mediation 利用可能」と判定される
- フォームにフォーカスしなくても 1Password が自動的にパスキー候補を表示
- 選択すると認証成功し、assertion が返される

**所見**:
- Conditional UI は正常に動作する
- `isConditionalMediationAvailable()` が true を返す
- フォームフォーカス不要で 1Password が候補を提示する（通常のパスワード補完とは異なる挙動）
- 実際のサイトでは、ログインフォームのページロード時にこれを呼び出し、パスキー登録済みユーザーには自動的に認証 UI を表示するのが推奨パターン

### 22d. Passkey 登録（attestation: direct）

`attestation: "direct"` を指定して登録を呼び出した結果:

**1Password の挙動**:
- UI は 22a（基本）と同じ。視覚的な違いはない
- attestationObject の `fmt` は `"none"` のまま（direct を要求しても attestation 証明書は提供されない）

**所見**:
- 1Password は attestation タイプに関係なく self-attestation（`fmt: "none"`）のみ対応
- デバイス製造元の証明書は提供しない
- attestation: "direct" を要求するサイトでも 1Password でのパスキー登録は可能だが、サーバーが attestation 検証を必須とする場合は失敗する

### 22e. Passkey 登録（excludeCredentials 付き）

2段階テスト: まず登録 → 登録した credential ID を excludeCredentials に含めて再登録:

**1Password の挙動**:
- 1回目: 正常に登録成功
- 2回目（excludeCredentials に1回目の ID を含む）: **既にそのパスキーを持つエントリが候補から除外**され、パスキーを持たない別のログインエントリ（oreore.net 用）が更新候補として提示される
- 3回目以降: 更新済みエントリも除外され、さらに別のエントリが候補に出る
- 何度実行しても InvalidStateError にはならず、別のエントリに新しいパスキーとして登録される

**所見**:
- 1Password は excludeCredentials を正しく実装している: 指定された credential ID を持つアイテムを候補から除外する
- ただし 1Password は複数のアイテム（ログインエントリ）を持てるため、別のアイテムに新しいパスキーを登録できてしまう
- 実質的にパスキーの重複登録を完全には防げない（同一サービスの複数ログインエントリに別々のパスキーが登録される）
- InvalidStateError が発生するのは「全ての候補が excludeCredentials に含まれる」場合のみだが、1Password では新規アイテム作成もできるため事実上発生しない

### 19. フリガナ検出テスト

autocomplete 仕様にフリガナ用トークンはない。1Password がヒューリスティック（name/id/label）でフリガナを検出するかの検証。
given-name で補完を発動し、フリガナ系フィールドが連動するか確認。

1Password の Identity フィールド構成（確認済み）: kana-sei=かわず, kana-mei=よしあき, furigana=フリガナ, sei=かわずず

| ページ | name / id / label | 連動で入った値 | 後者単独で補完 | 分析 |
|---|---|---|---|---|
| 19a | `name="family-name-kana"` | 河津 | — | `family-name` 部分でマッチ。kana は無視 |
| 19b | `name="given-name-kana"` | null | 佳章 | `given-name` でマッチ。先着ルールで1つ目(given-name)だけ埋まる |
| 19c | `name="kana_sei"` | かわず | 反応せず | `sei` → 1P の kana-sei フィールドにマッチ |
| 19d | `name="kana_mei"` | よしあき | 反応せず | `mei` → 1P の kana-mei フィールドにマッチ |
| 19e | `id="furigana-sei"` | null | — | id 属性の furigana-sei はマッチせず |
| 19f | `id="furigana-mei"` | フリガナ | — | 1P の furigana フィールドにマッチ（mei ではなく furigana） |
| 19g | `label="姓（フリガナ）"` | 河津 | 両方反応 | label の「姓」でマッチ |
| 19h | `label="名（フリガナ）"` | — | given-name だけ | 先着ルール。label「名」が given-name とかぶる |
| 19i | `name="phonetic-name"` | 電話番号 | 反応せず | **`phone` プレフィックスマッチで誤検出** |
| 19j | `name="x-phonetic-family-name"` | 電話番号 | 反応せず | 同上 |
| 19k | `name="x-phonetic-given-name"` | 電話番号 | 反応せず | 同上 |
| 19l | `name="name_kana"` | null | 反応せず | マッチせず |
| 19m | `name="name_hiragana"` | null | 反応せず | マッチせず |
| 19n | `name="sei_kana"` | かわずず | 反応せず | `sei` → 1P の sei フィールドにマッチ |
| 19o | `name="mei_kana"` | null | 反応せず | マッチせず |
| 19p | `name="lastname_kana"` | 河津 | 両方反応 | `lastname` → family-name にマッチ |
| 19q | `name="firstname_kana"` | null | 反応せず | `firstname` が given-name とかぶり先着ルール |

**所見**:

- **1Password は `kana` を特別なキーワードとして認識していない**。name 属性をトークン分割（`-` や `_`）してキーワードマッチしている
- **マッチするキーワード**: `family-name`, `given-name`, `sei`, `mei`, `lastname`, `firstname` → 対応する 1P フィールドにマッチ
- **`phone` プレフィックスマッチによる誤検出**: `phonetic-*` → `phone` にマッチして電話番号が入る
- **フリガナ専用の検出ロジックは存在しない**: kana-sei/kana-mei に値が入るのは `sei`/`mei` キーワードマッチの結果であり、フリガナ認識ではない
- **id 属性もマッチ対象**: `id="furigana-mei"` で 1P の furigana フィールドにマッチ
- **label テキストもマッチ対象**: 「姓」「名」でマッチ。ただし given-name の先着ルールとかぶる
- **先着ルール**: 同じカテゴリ（given-name 系）のフィールドが複数ある場合、DOM 上で先のフィールドだけが埋まる

### OTP トリガー切り分けテスト

詳細は [2026-04-07-1password-otp-detection.md](./2026-04-07-1password-otp-detection.md) を参照。

---

## 発見事項まとめ

### 1Password の autocomplete 対応状況（全カテゴリ）

| カテゴリ | 対応 | 補完動作 | 備考 |
|---|---|---|---|
| 1. キーワード (on/off) | — | on/off 単体では反応なし | 具体的なフィールドトークンが必要 |
| 2. 氏名 (Name) | ✅ | 単独で補完 UI 表示 | name は単独、given/family/additional はグループ連動 |
| 3. 認証情報 (Credentials) | ✅ | Login カテゴリ | username+password 連動、自動 submit、new-password でジェネレーター起動 |
| 4. 組織 (Organization) | ❌ | 無反応 | Identity にデータがない可能性 |
| 5. 住所 (Address) | ✅ | 単独で補完 UI 表示 | コアグループ連動、select 対応、shipping/billing 対応 |
| 6. 住所 (billing) | ✅ | 同上 | |
| 7. クレジットカード | ✅ | 単独で補完 UI 表示 | コアグループ連動、名前の自動スプリット |
| 8. 取引 (Transaction) | ❌ | 無反応 | 1Password にデータフィールドなし |
| 9-13. 電話番号 | △ | 単独不可 | name/address と同じフォームにあれば連動 |
| 14. 連絡先 (email) | ✅ | 各フィールド独立 | 空の全 email に同一値。impp は非対応 |
| 15. 誕生日 | △ | 単独不可 | name/address と同じフォームにあれば連動 |
| 16. その他 | ❌ | 無反応 | 1Password にデータフィールドなし |
| 17. section- プレフィックス | ❌ | プレフィックス無視 | section-blue/red を区別しない |
| 18. WebAuthn | ✅ | Login カテゴリ | Identity ではなく Login エントリが候補に出る |
| 19. フリガナ | ❌(標準) | ヒューリスティック依存 | カスタムフィールド追加で name マッチ可能 |

### 1Password のフィールドグルーピング

#### 先着ルール（排他的フィールド）

同じカテゴリに属するフィールドが同一フォームに複数ある場合、**DOM 順で先に現れる空フィールドだけ**が補完される:

- `name` vs `given-name`/`family-name` — 排他
- `cc-name` vs `cc-given-name`/`cc-family-name` — 排他
- `cc-exp` vs `cc-exp-month`/`cc-exp-year` — 排他
- `country` vs `country-name` — 排他
- 同一 autocomplete 値が2つ（例: postal-code × 2）— 1つ目のみ

例外: email は先着ルールではなく**空の全フィールドに同一値**を入力する。既存値は上書きしない。

#### 連動グループ

- **Name グループ**: given-name + additional-name + family-name（常に連動）
- **Address コアグループ**: address-level2 + address-level1 + country + postal-code（常に連動）
- **Credit Card コアグループ**: cc-number + cc-exp-month + cc-exp-year + cc-csc（常に連動）
- **Login グループ**: username + current-password（連動 + 自動 submit）

#### 従属フィールド（単独で補完 UI が出ない）

- **tel 系**: name/address 等と同じフォームにあれば連動
- **bday 系**: 同上

#### select 要素の補完

- `<select>` でも `<input>` と同様に補完される
- option の **label（表示テキスト）でマッチ**する（value がコード番号でも label に名前があれば正しく選択）

#### section- プレフィックスの扱い

- 1Password は `section-*` プレフィックスを**無視**する
- section-blue / section-red を区別しない

#### maxlength の扱い

- 1Password は `maxlength` を**無視**して値全体を入力する（例: 郵便番号 xxx-xxxx が maxlength="3" のフィールドにそのまま入る）

#### クレジットカードの名前スプリット

- 1Password にフルネーム（"YOSHIAKI KAWAZU"）だけ登録しても、cc-given-name / cc-family-name で補完時にスペースで分割して振り分ける

#### type="password" の影響

- `type="password"` でも autocomplete 属性が優先され、正しく補完される（例: cc-csc）

### ヒューリスティック検出（name/id/label マッチ）

1Password は autocomplete 属性だけでなく、**name, id, label のテキストをトークン分割してキーワードマッチ**する:

- マッチキーワード: `family-name`, `given-name`, `sei`, `mei`, `lastname`, `firstname`, `phone`, `telephone`, `mobile`, `birthday`, `date_of_birth` 等
- `kana` は特別扱いされない（フリガナ専用ロジックなし）
- `phonetic-*` は `phone` にプレフィックスマッチして電話番号が**誤入力**される
- label テキスト「姓」「名」もマッチ対象（ただし日本語の「電話番号」はマッチしない）
- **カスタムフィールド名もマッチ対象**: Identity にカスタムフィールドを追加すれば、そのフィールド名でもマッチする
- `tel` はマッチしない（短すぎる）が `phone`, `telephone`, `mobile` はマッチする

### 1Password のログインフォーム自動送信

- username + current-password のペアが揃った状態でプロファイルを選択すると、フォームが**自動的に submit される**
- 同じフォーム内の one-time-code フィールドには入力の機会がない
- OTP は通常、ログイン後の別画面で入力を求められる

### パスワード確認フィールド (confirm password)

- 専用の autocomplete トークンは存在しない
- 確認用フィールドにも `autocomplete="new-password"` を指定するのが標準
- 1Password は同一フォーム内に new-password が2つあるとき、両方に同じ生成パスワードを入力する

### パスワードジェネレーターの制御

- **`minlength` / `maxlength`**: 対応。生成パスワードの文字数を制御可能
- **`pattern`**: 非対応。完全に無視される
- **`passwordrules`（Apple 提唱仕様）**: 対応。文字種と文字数を詳細に制御可能
  - `required: upper, lower, digit, special` — 必須文字種
  - `allowed: digit` — 使用可能文字種の制限（PIN 生成等）
  - passwordrules で `special` を required にも allowed にもしなければ記号なし
- **confirm password**: `new-password` が2つあると同じ値が両方に入る

### 補完 UI 表示の条件

- プロファイルにデータがないフィールドでも、同グループの他フィールドにデータがあれば補完 UI は表示される（例: additional-name）
- プロファイルにデータがなく、かつ独立したフィールドの場合は補完 UI が表示されない（例: honorific-prefix）

### 1Password OTP 登録ダイアログのトリガー条件

詳細は [2026-04-07-1password-otp-detection.md](./2026-04-07-1password-otp-detection.md) を参照。

### alt 属性とテキストシグナルの役割

詳細は [2026-04-07-1password-otp-detection.md](./2026-04-07-1password-otp-detection.md) を参照。

### 1Password 拡張のクラッシュ/無応答問題

詳細は [2026-04-07-1password-otp-detection.md](./2026-04-07-1password-otp-detection.md) を参照。
