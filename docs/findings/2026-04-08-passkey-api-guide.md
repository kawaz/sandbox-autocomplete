# WebAuthn / Passkey API 包括ガイド

## 1. 判明した事実（まとめ）

- Passkey は WebAuthn（Web Authentication API）上に構築された、公開鍵暗号方式に基づくパスワードレス認証の仕組みである
- 秘密鍵はデバイス（またはパスワードマネージャー）に保管され、サーバーには公開鍵のみが保存される。秘密鍵がネットワーク上を流れることはない
- Passkey は Discoverable Credential（Resident Key）であり、ユーザー名の入力なしに認証を開始できる
- 認証情報は origin（ドメイン）に暗号的に紐付けられるため、フィッシング攻撃に対して本質的に耐性を持つ
- マルチデバイス対応: iCloud Keychain、Google Password Manager、1Password 等のパスワードマネージャーを通じてデバイス間で同期可能
- Conditional UI（Passkey Autofill）により、既存のパスワードフォームとシームレスに共存できる
- WebAuthn Level 3 仕様が策定中（2026年2月以降に Recommendation 予定）
- Signal API（Chrome 132+）でサーバーとパスキープロバイダー間のクレデンシャル状態を同期可能
- `getClientCapabilities()` メソッド（2025年2月〜 Baseline）で、ブラウザの WebAuthn 機能サポートを事前検出可能
- Related Origin Requests により、複数ドメイン間でパスキーを共有可能（最大5ドメイン）
- 2025年時点で全モダンブラウザ（Chrome, Safari, Firefox, Edge）が WebAuthn をネイティブサポート
- Google は8億アカウントでパスキーを利用、パスワード比で成功率30%向上・認証速度20%向上と報告
- ブラウザ側で「ユーザーが特定サイトにパスキーを登録済みかどうか」を事前に知る方法はない（プライバシー保護のため）

---

## 2. Passkey 登録フロー（Registration / Attestation）

### フロー全体図

```
ブラウザ                         サーバー                        認証器
  |                               |                              |
  |  1. 登録開始リクエスト         |                              |
  |------------------------------>|                              |
  |                               |                              |
  |  2. PublicKeyCredentialCreationOptions                        |
  |<------------------------------|                              |
  |                               |                              |
  |  3. navigator.credentials.create(options)                    |
  |------------------------------------------------------------->|
  |                               |         ユーザー検証          |
  |                               |         鍵ペア生成            |
  |  PublicKeyCredential          |         attestation 生成      |
  |<-------------------------------------------------------------|
  |                               |                              |
  |  4. 登録完了（attestation送信）|                              |
  |------------------------------>|                              |
  |                               |  5. 検証 & 保存              |
  |  成功/失敗レスポンス           |                              |
  |<------------------------------|                              |
```

### ステップ1: ブラウザ → サーバー（登録開始リクエスト）

ブラウザ側はセッション情報（Cookie やトークン）とともに登録開始を要求する。この時点でブラウザが送る情報は最小限:

- セッション識別子（ログイン済みの場合はユーザー特定に使用）
- 新規登録の場合はユーザー名・表示名

```typescript
// ブラウザ側: 登録開始リクエスト
const response = await fetch('/webauthn/register/begin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'same-origin', // セッション Cookie を送信
  body: JSON.stringify({
    // 新規登録の場合のみ必要
    username: 'user@example.com',
    displayName: 'ユーザー名',
  }),
});
const options = await response.json();
```

### ステップ2: サーバー → ブラウザ（登録オプション）

サーバーは `PublicKeyCredentialCreationOptions` を生成して返す。

```typescript
// サーバー側: SimpleWebAuthn を使用した例
import { generateRegistrationOptions } from '@simplewebauthn/server';

const options = await generateRegistrationOptions({
  rpName: 'My Application',          // RP の表示名
  rpID: 'example.com',               // RP ID（ドメイン名）
  userName: user.email,              // ユーザー名（メールアドレス等）
  userDisplayName: user.displayName, // 表示名
  userID: user.passkeyUserId,        // PII を含まないランダムID

  // 既に登録済みのクレデンシャル（重複登録防止）
  excludeCredentials: existingCredentials.map(cred => ({
    id: cred.credentialId,
    transports: cred.transports,
  })),

  // 認証器の要件
  authenticatorSelection: {
    residentKey: 'required',           // Discoverable Credential 必須
    userVerification: 'preferred',     // 生体認証等を推奨
    authenticatorAttachment: 'platform', // プラットフォーム認証器のみ（省略で制限なし）
  },

  // 許可する公開鍵アルゴリズム
  // デフォルトで ES256, RS256 等が設定される
  supportedAlgorithmIDs: [-7, -257],

  // attestation の種類
  attestationType: 'none', // 通常は 'none' で十分

  // タイムアウト（ミリ秒）
  timeout: 60000,
});

// challenge をセッションに保存（後の検証で使用）
session.currentChallenge = options.challenge;
```

**各フィールドの意味と設計判断ポイント:**

| フィールド | 説明 | 設計判断 |
|---|---|---|
| `challenge` | サーバーが生成する暗号的にランダムなバイト列（最低16バイト、推奨32バイト） | リプレイ攻撃防止。一回限り使用、60〜120秒で失効させる |
| `rp.id` | Relying Party の識別子。有効なドメイン名 | `example.com` を指定すると `sub.example.com` からも使用可能。サブドメインのみの指定は不可 |
| `rp.name` | RP の表示名 | 認証器の UI に表示される |
| `user.id` | ユーザーの一意識別子（最大64バイト） | **PII を含めてはいけない**。ランダムなバイト列を使用 |
| `user.name` | ユーザー名（メールアドレス等） | 認証器に保存され、Conditional UI で表示される |
| `user.displayName` | 表示用の名前 | 全プラットフォームで使われるとは限らない |
| `pubKeyCredParams` | 許可する公開鍵アルゴリズムのリスト | 優先順に記載。`-7`(ES256) と `-257`(RS256) を推奨 |
| `excludeCredentials` | 既に登録済みのクレデンシャルID一覧 | 同一認証器への重複登録を防止 |
| `authenticatorSelection.residentKey` | Discoverable Credential の要求レベル | Passkey には `'required'` を指定 |
| `authenticatorSelection.userVerification` | ユーザー検証（生体認証/PIN）の要求レベル | `'required'`: 必須、`'preferred'`: 可能なら（デフォルト）、`'discouraged'`: 不要 |
| `authenticatorSelection.authenticatorAttachment` | 認証器の種類制限 | `'platform'`: 内蔵認証器のみ、`'cross-platform'`: セキュリティキー等のみ、省略: 制限なし |
| `attestation` | attestation statement の要求レベル | `'none'`: 不要（推奨）、`'direct'`: 完全な attestation を要求、`'indirect'`: プライバシー保護付き、`'enterprise'`: エンタープライズ用 |
| `timeout` | タイムアウト（ミリ秒） | 通常 60,000〜300,000ms。認証の種類に応じて調整 |

**pubKeyCredParams の主要なアルゴリズム:**

| アルゴリズム | COSE 値 | 説明 |
|---|---|---|
| ES256 | -7 | ECDSA w/ SHA-256（推奨、最も広くサポート） |
| RS256 | -257 | RSASSA-PKCS1-v1_5 w/ SHA-256 |
| EdDSA | -8 | Edwards-curve DSA |
| ES384 | -35 | ECDSA w/ SHA-384 |
| ES512 | -36 | ECDSA w/ SHA-512 |
| PS256 | -37 | RSASSA-PSS w/ SHA-256 |

### ステップ3: ブラウザ（navigator.credentials.create）

ブラウザがサーバーから受け取ったオプションで `navigator.credentials.create()` を呼び出す。

```typescript
import { startRegistration } from '@simplewebauthn/browser';

try {
  // SimpleWebAuthn のブラウザライブラリが base64url のデコード等を自動処理
  const credential = await startRegistration({ optionsJSON: options });

  // 登録完了をサーバーに送信（ステップ4へ）
  const verificationResponse = await fetch('/webauthn/register/finish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(credential),
  });
} catch (error) {
  if (error.name === 'InvalidStateError') {
    // excludeCredentials に該当 → 既に登録済み
    console.error('この認証器は既に登録されています');
  } else if (error.name === 'NotAllowedError') {
    // ユーザーがキャンセル or タイムアウト
    console.error('登録がキャンセルされました');
  } else {
    console.error('登録エラー:', error);
  }
}
```

**ライブラリを使わない場合（素の WebAuthn API）:**

```typescript
// サーバーからの JSON レスポンスを WebAuthn API 用に変換
// （base64url → ArrayBuffer のデコードが必要）
const publicKeyOptions = {
  publicKey: {
    challenge: base64urlToArrayBuffer(options.challenge),
    rp: options.rp,
    user: {
      ...options.user,
      id: base64urlToArrayBuffer(options.user.id),
    },
    pubKeyCredParams: options.pubKeyCredParams,
    authenticatorSelection: options.authenticatorSelection,
    timeout: options.timeout,
    attestation: options.attestation,
    excludeCredentials: options.excludeCredentials?.map(cred => ({
      ...cred,
      id: base64urlToArrayBuffer(cred.id),
    })),
  },
};

const credential = await navigator.credentials.create(publicKeyOptions);
```

**この時点で起きること:**

1. ブラウザが `rp.id` と現在の origin を検証（origin が rp.id のサブドメインであること）
2. ブラウザが認証器（1Password、iCloud Keychain、Windows Hello 等）に要求を送信
3. 認証器がユーザーに UI を表示（生体認証、PIN 入力等）
4. ユーザーが承認すると、認証器が新しい公開鍵/秘密鍵ペアを生成
5. 秘密鍵を安全に保管し、公開鍵と attestation を含む応答を返す

### ステップ4: ブラウザ → サーバー（登録完了）

`navigator.credentials.create()` が返す `PublicKeyCredential` オブジェクトの構造:

```typescript
// PublicKeyCredential の構造
{
  id: string,              // credential ID（base64url エンコード済み）
  rawId: ArrayBuffer,      // credential ID（バイナリ）
  type: 'public-key',      // 常に 'public-key'
  authenticatorAttachment: 'platform' | 'cross-platform',
  response: {
    // AuthenticatorAttestationResponse
    clientDataJSON: ArrayBuffer,      // クライアントデータ（JSON → UTF-8 → ArrayBuffer）
    attestationObject: ArrayBuffer,   // attestation オブジェクト（CBOR エンコード）
    getTransports(): string[],        // 使用可能なトランスポート
    getPublicKey(): ArrayBuffer,      // 公開鍵（SPKI 形式）
    getPublicKeyAlgorithm(): number,  // アルゴリズム ID（COSE）
    getAuthenticatorData(): ArrayBuffer, // authenticatorData
  },
}
```

**clientDataJSON の構造（デコード後）:**

```json
{
  "type": "webauthn.create",
  "challenge": "base64url エンコードされた challenge",
  "origin": "https://example.com",
  "crossOrigin": false
}
```

**attestationObject の構造（CBOR デコード後）:**

```
{
  "fmt": "none" | "packed" | "tpm" | "android-key" | "fido-u2f" | "apple",
  "attStmt": { ... },  // fmt に応じた attestation statement
  "authData": <バイナリ>  // authenticatorData
}
```

**authenticatorData のバイナリ構造:**

```
| rpIdHash (32 bytes) | flags (1 byte) | signCount (4 bytes) | attestedCredentialData | extensions |
```

flags のビットフィールド:
- Bit 0 (UP): User Presence（ユーザーが存在する）
- Bit 2 (UV): User Verification（ユーザーが検証された = 生体認証/PIN）
- Bit 3 (BE): Backup Eligible（同期可能なクレデンシャルか）
- Bit 4 (BS): Backup State（実際に同期されているか）
- Bit 6 (AT): Attested Credential Data が含まれる
- Bit 7 (ED): Extension Data が含まれる

attestedCredentialData の構造:
```
| aaguid (16 bytes) | credentialIdLength (2 bytes) | credentialId (可変長) | credentialPublicKey (COSE 形式) |
```

### ステップ5: サーバー（検証と保存）

```typescript
import { verifyRegistrationResponse } from '@simplewebauthn/server';

try {
  const verification = await verifyRegistrationResponse({
    response: credential,               // クライアントから受け取った応答
    expectedChallenge: session.currentChallenge, // セッションに保存した challenge
    expectedOrigin: 'https://example.com',       // 期待する origin
    expectedRPID: 'example.com',                 // 期待する RP ID
    requireUserVerification: true,               // UV フラグの検証
  });

  if (verification.verified && verification.registrationInfo) {
    const {
      credential: registeredCredential,
      credentialDeviceType,   // 'singleDevice' | 'multiDevice'
      credentialBackedUp,     // 同期されているか
      aaguid,                 // 認証器の識別子
    } = verification.registrationInfo;

    // データベースに保存
    await db.credentials.create({
      credentialId: registeredCredential.id,       // base64url 文字列
      publicKey: registeredCredential.publicKey,   // Uint8Array
      counter: registeredCredential.counter,       // 初期値は通常 0
      transports: registeredCredential.transports, // ['internal', 'hybrid'] 等
      userId: user.id,                             // ユーザーとの紐付け
      passkeyUserId: user.passkeyUserId,           // WebAuthn 用のユーザーID
      deviceType: credentialDeviceType,            // デバイスタイプ
      backedUp: credentialBackedUp,                // バックアップ状態
      aaguid: aaguid,                              // 認証器プロバイダー識別子
      createdAt: new Date(),
    });
  }
} catch (error) {
  console.error('登録検証エラー:', error);
}

// challenge は使用後に必ず削除
delete session.currentChallenge;
```

**サーバーが検証すること（仕様では19項目の検証手順が定義されている）:**

1. `clientDataJSON.type` が `"webauthn.create"` であること
2. `clientDataJSON.challenge` がサーバーが発行した challenge と一致すること
3. `clientDataJSON.origin` が期待する origin と一致すること
4. `rpIdHash` が期待する RP ID の SHA-256 ハッシュと一致すること
5. UP（User Presence）フラグが立っていること
6. UV（User Verification）フラグが要求に応じて立っていること
7. 公開鍵のアルゴリズムが `pubKeyCredParams` で指定したものに含まれること
8. attestation statement の検証（`attestation: 'none'` の場合は省略可）
9. credential ID が他のユーザーに登録されていないこと

**サーバーが保存するもの:**

| フィールド | 型 | 説明 |
|---|---|---|
| credentialId | TEXT (base64url) | クレデンシャルの一意識別子。インデックス必須 |
| publicKey | BYTEA / BLOB | 公開鍵のバイナリデータ |
| counter | BIGINT | 署名カウンター（クローン検出用） |
| transports | TEXT[] | 通信方式（`'internal'`, `'hybrid'`, `'usb'`, `'ble'`, `'nfc'`） |
| userId | FK → Users | ユーザーテーブルへの外部キー |
| passkeyUserId | TEXT | WebAuthn 用ユーザーID（PII を含まない） |
| deviceType | VARCHAR | `'singleDevice'` or `'multiDevice'` |
| backedUp | BOOLEAN | 同期されているか |
| aaguid | TEXT | 認証器プロバイダーの識別子（GUID 形式） |
| createdAt | TIMESTAMP | 作成日時 |
| lastUsedAt | TIMESTAMP | 最終使用日時 |
| name | TEXT | ユーザーが付けた表示名（管理画面用） |

---

## 3. Passkey 認証フロー（Authentication / Assertion）

### フロー全体図

```
ブラウザ                         サーバー                        認証器
  |                               |                              |
  |  1. 認証開始リクエスト         |                              |
  |------------------------------>|                              |
  |                               |                              |
  |  2. PublicKeyCredentialRequestOptions                        |
  |<------------------------------|                              |
  |                               |                              |
  |  3. navigator.credentials.get(options)                       |
  |------------------------------------------------------------->|
  |                               |         ユーザー検証          |
  |                               |         署名生成             |
  |  PublicKeyCredential          |                              |
  |<-------------------------------------------------------------|
  |                               |                              |
  |  4. 認証完了（assertion送信）  |                              |
  |------------------------------>|                              |
  |                               |  5. 署名検証                 |
  |  成功/失敗レスポンス           |                              |
  |<------------------------------|                              |
```

### ステップ1: ブラウザ → サーバー（認証開始リクエスト）

**Discoverable Credential（Passkey）の場合、ユーザー名は不要:**

```typescript
// ユーザー名なしで認証開始（Passkey の標準パターン）
const response = await fetch('/webauthn/authenticate/begin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'same-origin',
  body: JSON.stringify({}), // ユーザー名不要
});
const options = await response.json();
```

**ユーザー名を指定する場合（allowCredentials を絞り込むため）:**

```typescript
// ユーザー名ありで認証開始
const response = await fetch('/webauthn/authenticate/begin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'same-origin',
  body: JSON.stringify({
    username: 'user@example.com',
  }),
});
```

### ステップ2: サーバー → ブラウザ（認証オプション）

```typescript
import { generateAuthenticationOptions } from '@simplewebauthn/server';

// パターン A: Discoverable Credential（allowCredentials 空）
// → ユーザーの認証器が保持する全パスキーから選択
const options = await generateAuthenticationOptions({
  rpID: 'example.com',
  userVerification: 'preferred',
  timeout: 60000,
  // allowCredentials を省略または空配列
});

// パターン B: 特定のクレデンシャルを指定
// → ユーザー名から DB を引いて該当ユーザーのクレデンシャル一覧を取得
const userCredentials = await db.credentials.findByUserId(user.id);
const options = await generateAuthenticationOptions({
  rpID: 'example.com',
  userVerification: 'preferred',
  timeout: 60000,
  allowCredentials: userCredentials.map(cred => ({
    id: cred.credentialId,
    transports: cred.transports,
  })),
});

// challenge をセッションに保存
session.currentChallenge = options.challenge;
```

**各フィールドの説明:**

| フィールド | 説明 |
|---|---|
| `challenge` | 暗号的にランダムなバイト列。リプレイ攻撃防止。1回限り使用 |
| `rpId` | 登録時と同じ RP ID。一致しないと認証器が応答しない |
| `allowCredentials` | 使用可能なクレデンシャルのリスト。空の場合は Discoverable Credential から選択 |
| `userVerification` | `'required'`: 生体認証/PIN 必須、`'preferred'`: 可能なら、`'discouraged'`: 不要 |
| `timeout` | タイムアウト（ミリ秒）。推奨 300,000ms（5分）、最大 600,000ms（10分） |

**allowCredentials を空にする場合 vs 指定する場合:**

- **空（Passkey 方式）**: 認証器に保存された Discoverable Credential から選択。ユーザー名入力不要。Conditional UI と組み合わせ可能
- **指定（従来方式）**: サーバーが特定のクレデンシャル ID を列挙。ユーザーの認証器にそのクレデンシャルがある場合のみ応答。transports を指定することで認証器の検索を最適化

### ステップ3: ブラウザ（navigator.credentials.get）

```typescript
import { startAuthentication } from '@simplewebauthn/browser';

try {
  const assertion = await startAuthentication({ optionsJSON: options });

  // 認証完了をサーバーに送信
  const verificationResponse = await fetch('/webauthn/authenticate/finish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(assertion),
  });
} catch (error) {
  if (error.name === 'NotAllowedError') {
    console.error('認証がキャンセルされました');
  }
}
```

**mediation オプションの違い:**

| 値 | 動作 | ユースケース |
|---|---|---|
| `'optional'`（デフォルト） | モーダル UI を即座に表示。ユーザーがクレデンシャルを選択 | 「パスキーでログイン」ボタン押下時 |
| `'conditional'` | モーダルを表示せず、フォームの autofill UI に統合。ユーザーが入力フィールドをタップすると候補が表示される | Conditional UI（パスキーオートフィル）。ページロード時に呼び出し |
| `'required'` | ユーザーの操作を必ず要求。サイレント認証を行わない | 再認証や重要操作の確認時 |
| `'silent'` | ユーザー操作なしで認証を試みる。失敗しても UI を表示しない | バックグラウンドでの認証チェック |

### ステップ4: ブラウザ → サーバー（認証完了）

`navigator.credentials.get()` が返す `PublicKeyCredential` の構造:

```typescript
{
  id: string,              // credential ID（base64url）
  rawId: ArrayBuffer,      // credential ID（バイナリ）
  type: 'public-key',
  authenticatorAttachment: 'platform' | 'cross-platform',
  response: {
    // AuthenticatorAssertionResponse
    authenticatorData: ArrayBuffer,  // 認証器データ
    clientDataJSON: ArrayBuffer,     // クライアントデータ
    signature: ArrayBuffer,          // 署名
    userHandle: ArrayBuffer | null,  // ユーザーID（Discoverable Credential の場合）
  },
}
```

**各フィールドの詳細:**

- `authenticatorData`: rpIdHash(32) + flags(1) + signCount(4) + extensions（任意）
- `clientDataJSON`: `{ type: "webauthn.get", challenge: "...", origin: "...", crossOrigin: false }`
- `signature`: `authenticatorData + SHA-256(clientDataJSON)` を秘密鍵で署名したもの
- `userHandle`: 登録時に指定した `user.id`。Discoverable Credential では必ず含まれ、ユーザーの特定に使用

### ステップ5: サーバー（検証）

```typescript
import { verifyAuthenticationResponse } from '@simplewebauthn/server';

try {
  // credential ID からデータベースのクレデンシャルを検索
  const dbCredential = await db.credentials.findByCredentialId(assertion.id);
  if (!dbCredential) {
    throw new Error('クレデンシャルが見つかりません');
  }

  // ユーザーの特定
  // 方法1: userHandle（= 登録時の user.id）から
  // 方法2: credential ID → DB → userId の外部キーから
  const user = await db.users.findByPasskeyUserId(dbCredential.passkeyUserId);

  const verification = await verifyAuthenticationResponse({
    response: assertion,
    expectedChallenge: session.currentChallenge,
    expectedOrigin: 'https://example.com',
    expectedRPID: 'example.com',
    credential: {
      id: dbCredential.credentialId,
      publicKey: dbCredential.publicKey,     // Uint8Array
      counter: dbCredential.counter,         // 現在の署名カウンター
      transports: dbCredential.transports,
    },
    requireUserVerification: true,
  });

  if (verification.verified) {
    // 署名カウンターを更新
    await db.credentials.updateCounter(
      dbCredential.credentialId,
      verification.authenticationInfo.newCounter,
    );
    await db.credentials.updateLastUsedAt(dbCredential.credentialId, new Date());

    // セッションを確立
    session.userId = user.id;
    session.signedIn = true;
  }
} catch (error) {
  console.error('認証検証エラー:', error);
} finally {
  // challenge は成功・失敗に関わらず必ず削除
  delete session.currentChallenge;
}
```

**署名の検証方法（ライブラリ内部の処理）:**

```
署名対象データ = authenticatorData + SHA-256(clientDataJSON)
検証結果 = publicKey.verify(signature, 署名対象データ)
```

1. `clientDataJSON` を SHA-256 でハッシュ化
2. `authenticatorData`（バイナリ）とハッシュを連結
3. 登録時に保存した公開鍵で `signature` を検証

**signCount（署名カウンター）の検証:**

- 認証器は認証のたびにカウンターをインクリメントする
- サーバーは受信したカウンターが保存値より大きいことを確認
- カウンターが増加していない場合、認証器のクローン（複製）の可能性がある
- ただし、マルチデバイス同期パスキーではカウンターが常に `0` の場合がある（同期時のカウンター管理が困難なため）

**userHandle からのユーザー特定:**

- `userHandle` は登録時に `user.id` として指定したバイト列
- Discoverable Credential（Passkey）では、認証応答に必ず含まれる
- `allowCredentials` を空にした場合（ユーザー名入力なし認証）、`userHandle` がユーザー特定の唯一の手段

---

## 4. Conditional UI（条件付き認証 / パスキーオートフィル）

### 概要

Conditional UI は、従来のパスワードフォームの autofill ドロップダウンにパスキーの候補を統合する機能。ユーザーがフォームフィールドをタップすると、パスワードマネージャーの候補とともにパスキーが表示される。

モーダル UI を即座に表示する通常の WebAuthn とは異なり、ユーザーの操作を待って候補を表示するため、既存のログインフローを阻害しない。

### HTML フォームの設定

```html
<form>
  <!-- autocomplete に "webauthn" トークンを追加 -->
  <input
    type="text"
    name="username"
    autocomplete="username webauthn"
    placeholder="メールアドレス"
  />
  <input
    type="password"
    name="password"
    autocomplete="current-password webauthn"
  />
  <button type="submit">ログイン</button>
</form>
```

`autocomplete="username webauthn"` の `webauthn` トークンにより、ブラウザはこのフィールドの autofill 候補にパスキーを含める。

### JavaScript 実装パターン

```typescript
// ページロード時に呼び出す（DOMContentLoaded 等）
async function initConditionalUI() {
  // 1. WebAuthn 自体のサポート確認
  if (!window.PublicKeyCredential) {
    console.log('WebAuthn はサポートされていません');
    return;
  }

  // 2. Conditional UI のサポート確認
  const isConditionalAvailable =
    await PublicKeyCredential.isConditionalMediationAvailable();
  if (!isConditionalAvailable) {
    console.log('Conditional UI はサポートされていません');
    return;
  }

  // 3. サーバーから認証オプションを取得
  const response = await fetch('/webauthn/authenticate/begin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({}), // ユーザー名不要
  });
  const options = await response.json();

  // 4. Conditional UI で認証を開始（ユーザーの操作を待つ）
  try {
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: base64urlToArrayBuffer(options.challenge),
        rpId: options.rpId,
        userVerification: options.userVerification,
        timeout: options.timeout,
        // allowCredentials は空（Discoverable Credential から自動選択）
      },
      mediation: 'conditional', // Conditional UI を有効化
    });

    // 5. 認証成功 → サーバーに送信
    const verificationResponse = await fetch('/webauthn/authenticate/finish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({
        id: assertion.id,
        rawId: arrayBufferToBase64url(assertion.rawId),
        type: assertion.type,
        response: {
          authenticatorData: arrayBufferToBase64url(assertion.response.authenticatorData),
          clientDataJSON: arrayBufferToBase64url(assertion.response.clientDataJSON),
          signature: arrayBufferToBase64url(assertion.response.signature),
          userHandle: assertion.response.userHandle
            ? arrayBufferToBase64url(assertion.response.userHandle)
            : null,
        },
      }),
    });

    if (verificationResponse.ok) {
      window.location.href = '/dashboard';
    }
  } catch (error) {
    // ユーザーがキャンセルした場合等 → パスワードフォームが引き続き使える
    if (error.name !== 'AbortError') {
      console.error('Conditional UI エラー:', error);
    }
  }
}

// ページロード時に非同期で開始
document.addEventListener('DOMContentLoaded', initConditionalUI);
```

**SimpleWebAuthn を使う場合:**

```typescript
import { startAuthentication } from '@simplewebauthn/browser';

async function initConditionalUI() {
  if (!PublicKeyCredential.isConditionalMediationAvailable) return;
  const available = await PublicKeyCredential.isConditionalMediationAvailable();
  if (!available) return;

  const optionsResponse = await fetch('/webauthn/authenticate/begin', {
    method: 'POST',
    credentials: 'same-origin',
  });
  const options = await optionsResponse.json();

  try {
    // useBrowserAutofill: true で Conditional UI を有効化
    const assertion = await startAuthentication({
      optionsJSON: options,
      useBrowserAutofill: true,
    });

    const verifyResponse = await fetch('/webauthn/authenticate/finish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(assertion),
    });

    const result = await verifyResponse.json();
    if (result.verified) {
      window.location.href = '/dashboard';
    }
  } catch (error) {
    // Conditional UI のエラーは静かに処理
    // パスワードフォームが引き続き機能する
  }
}
```

### 既存パスワードフォームとの共存

Conditional UI の要点は、既存のログインフォームを変更せずにパスキー認証を追加できること:

1. ページロード時に `conditional` な `get()` を非同期で呼び出す
2. ユーザーが入力フィールドをタップすると、パスワードとパスキーの両方が autofill 候補に表示される
3. パスキーを選択 → WebAuthn 認証が完了
4. パスワードを選択 → 通常のパスワード認証フォームとして機能
5. パスキーを選択しなかった場合、フォームは通常通り送信可能

**注意点:**

- `mediation: 'conditional'` の `get()` は、ユーザーがパスキーを選択するまで Promise が resolve しない（長時間 pending）
- ページ遷移やフォーム送信で自動的にキャンセルされる
- 同時に複数の `get()` を呼び出すことはできない（2つ目の呼び出しで最初の呼び出しが abort される）
- AbortController を使って明示的にキャンセルすることも可能

```typescript
const abortController = new AbortController();

const assertion = await navigator.credentials.get({
  publicKey: { /* ... */ },
  mediation: 'conditional',
  signal: abortController.signal,
});

// 別の認証方法に切り替える場合等
abortController.abort();
```

### `PublicKeyCredential.isConditionalMediationAvailable()`

```typescript
// Conditional UI のサポート確認
if (PublicKeyCredential.isConditionalMediationAvailable) {
  const available = await PublicKeyCredential.isConditionalMediationAvailable();
  // available === true: Conditional UI が使える
}
```

ブラウザサポート状況（2025年時点）:
- Chrome 108+
- Safari 16+
- Firefox 122+
- Edge 108+

---

## 5. パスキー登録済みかどうかの事前判定

### ブラウザ側で判定できること

**1. プラットフォーム認証器の有無:**

```typescript
// 生体認証等に対応したプラットフォーム認証器があるか
const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
// true: Touch ID, Face ID, Windows Hello 等が使える
```

**2. Conditional UI のサポート:**

```typescript
const conditionalAvailable = await PublicKeyCredential.isConditionalMediationAvailable();
// true: Conditional UI（パスキーオートフィル）が使える
```

**3. getClientCapabilities() による包括的な能力検出（2025年2月〜 Baseline）:**

```typescript
if (PublicKeyCredential.getClientCapabilities) {
  const capabilities = await PublicKeyCredential.getClientCapabilities();

  // 各能力の確認
  console.log('Conditional UI:', capabilities.conditionalGet);
  console.log('プラットフォーム認証器:', capabilities.userVerifyingPlatformAuthenticator);
  console.log('パスキー対応認証器:', capabilities.passkeyPlatformAuthenticator);
  console.log('ハイブリッドトランスポート:', capabilities.hybridTransport);
  console.log('Related Origins:', capabilities.relatedOrigins);
  console.log('Signal API:', capabilities.signalAllAcceptedCredentials);
  console.log('Conditional Create:', capabilities.conditionalCreate);
}
```

**getClientCapabilities() で返されるキー一覧:**

| キー | 意味 |
|---|---|
| `conditionalCreate` | Discoverable Credential を作成可能か |
| `conditionalGet` | Conditional UI（autofill）対応か |
| `hybridTransport` | Hybrid トランスポート（Bluetooth/NFC/USB）対応か |
| `passkeyPlatformAuthenticator` | パスキー対応のプラットフォーム認証器があるか |
| `userVerifyingPlatformAuthenticator` | ユーザー検証対応のプラットフォーム認証器があるか |
| `relatedOrigins` | Related Origin Requests 対応か |
| `signalAllAcceptedCredentials` | Signal API (allAccepted) 対応か |
| `signalCurrentUserDetails` | Signal API (userDetails) 対応か |
| `signalUnknownCredential` | Signal API (unknown) 対応か |
| `extension:*` | 各拡張のサポート状況 |

### 重要な制限事項: 登録済みパスキーの存在確認はできない

**ブラウザ側で「このユーザーがこのサイトにパスキーを登録済みか」を事前に知る方法は存在しない。** これはプライバシー保護のための意図的な設計:

- 悪意のあるサイトがユーザーのアカウント存在を確認できてしまうため
- ユーザーが特定のサービスを利用しているかどうかを推測されるため
- WebAuthn API は `navigator.credentials.get()` を呼び出して初めて、認証器にクレデンシャルがあるかが判明する

### サーバー側での判定

```typescript
// ログイン試行時にユーザー名から DB を検索
async function checkPasskeyAvailability(username: string) {
  const user = await db.users.findByUsername(username);
  if (!user) return { hasPasskey: false };

  const credentials = await db.credentials.findByUserId(user.id);
  return {
    hasPasskey: credentials.length > 0,
    credentialCount: credentials.length,
  };
}
```

サーバー側での判定は可能だが、ユーザー名の入力が前提となる。Conditional UI を使えばこの問題を回避できる（認証器が保持するクレデンシャルから直接選択するため）。

### Signal API（WebAuthn Level 3）

Signal API はサーバーとパスキープロバイダー間でクレデンシャルの状態を同期する仕組み。「登録済みかどうかの判定」ではなく、「サーバー側の状態をパスキープロバイダーに通知する」もの:

```typescript
// サーバーで削除されたクレデンシャルをプロバイダーに通知
if (PublicKeyCredential.signalUnknownCredential) {
  await PublicKeyCredential.signalUnknownCredential({
    rpId: 'example.com',
    credentialId: 'base64url-encoded-credential-id',
  });
}

// ユーザーの有効なクレデンシャル一覧をプロバイダーに通知
if (PublicKeyCredential.signalAllAcceptedCredentials) {
  await PublicKeyCredential.signalAllAcceptedCredentials({
    rpId: 'example.com',
    userId: 'base64url-encoded-user-id',
    allAcceptedCredentialIds: [
      'credential-id-1',
      'credential-id-2',
    ],
  });
}

// ユーザー情報の更新をプロバイダーに通知
if (PublicKeyCredential.signalCurrentUserDetails) {
  await PublicKeyCredential.signalCurrentUserDetails({
    rpId: 'example.com',
    userId: 'base64url-encoded-user-id',
    name: 'new-username@example.com',
    displayName: '新しい表示名',
  });
}
```

Signal API のブラウザサポート（2026年4月時点）:
- Chrome 132+, Edge 132+: 対応済み
- Safari 26+: 対応表明（実装進行中）
- Firefox: 未対応

---

## 6. UI ベストプラクティス

### FIDO Alliance デザインガイドライン

FIDO Alliance は毎年 UX Working Group による調査に基づいたガイドラインを公開している。主要な原則:

**10の UX 原則:**

1. パスキーを主要な認証オプションとして提示する
2. FIDO Alliance の公式パスキーアイコンを一貫して使用する
3. OS ダイアログの前後にコンテキストを示すメッセージを表示する（RP サイトと OS ダイアログの「ハンドシェイク」）
4. アカウント管理の文脈（作成、設定、リカバリ後）でパスキー作成を促す
5. パスキーの作成には「作成」という動詞を使用する（「変更」「更新」ではない）
6. 削除には「削除」を使用する（「取り消し」ではない）
7. パスキーのソースを明確にラベル付けする（Google Password Manager、iCloud Keychain 等）
8. 同一エコシステムの複数パスキーには番号を付ける
9. 失敗時は明確なフィードバックと再試行パスを提供する
10. セキュリティ設定でパスキーを他の認証方法と同列に表示する

### Google のパスキー UX ガイドライン

**パスキー作成を促す4つのタイミング:**

1. **サインイン時**: ユーザーが既にセキュリティを意識している
2. **アカウントセキュリティ設定**: 認証設定の管理中
3. **アカウントリカバリ後**: セキュリティ意識が高まっている
4. **再認証後**: 重要操作の確認後

**ログインページの設計:**

```
推奨フロー:
1. ページロード時に Conditional UI を開始（バックグラウンド）
2. ユーザー名フィールドにパスキー候補が autofill で表示
3. パスキーを選択 → 即座に認証完了
4. パスワードを入力 → 従来のパスワード認証
5. パスワード認証成功後にパスキー作成を促す
```

### 実装事例

**GitHub:**
- 約140万のパスキーが登録済み
- ソフトウェア開発者をターゲットにパスキーを推進
- セキュリティ設定ページからパスキーを管理

**Google:**
- 8億アカウントで利用、25億回以上のパスキー認証
- パスワード比で認証成功率30%向上、速度20%向上
- 個人アカウントでパスキーをデフォルトのサインイン方法に設定

**Microsoft:**
- 2025年5月に新規アカウントのデフォルトをパスキーに変更
- パスキー認証が120%増加

**eBay:**
- 自動トリガーの生体認証プロンプトでパスキー採用率が102%向上
- 新規パスキーの75%がインフロー体験で作成

**Uber:**
- パスキー登録の90%以上がログイン/サインアップ時のインラインナッジから
- デバイスとコンテキストに応じてコンバージョン率10〜50%

### エラーハンドリング

```typescript
try {
  const credential = await navigator.credentials.create({ publicKey: options });
} catch (error) {
  switch (error.name) {
    case 'NotAllowedError':
      // ユーザーがキャンセルした、またはタイムアウト
      showMessage('パスキーの作成がキャンセルされました。後からでも作成できます。');
      break;

    case 'InvalidStateError':
      // excludeCredentials に該当（既に登録済み）
      showMessage('このデバイスには既にパスキーが登録されています。');
      break;

    case 'NotSupportedError':
      // pubKeyCredParams に対応するアルゴリズムがない
      showMessage('このデバイスはパスキーに対応していません。');
      break;

    case 'SecurityError':
      // RP ID が origin と一致しない等
      console.error('セキュリティエラー:', error.message);
      break;

    case 'AbortError':
      // AbortController で明示的にキャンセルされた
      break;

    default:
      showMessage('予期しないエラーが発生しました。もう一度お試しください。');
      console.error('WebAuthn エラー:', error);
  }
}
```

### Progressive Enhancement パターン

```typescript
async function setupAuthenticationUI() {
  // レベル1: WebAuthn サポートなし → パスワードのみ
  if (!window.PublicKeyCredential) {
    showPasswordOnlyForm();
    return;
  }

  // レベル2: getClientCapabilities が使える場合（2025年2月〜）
  if (PublicKeyCredential.getClientCapabilities) {
    const caps = await PublicKeyCredential.getClientCapabilities();

    if (caps.conditionalGet) {
      // レベル4: Conditional UI 対応 → パスキーオートフィル + パスワード
      initConditionalUI();
      showPasswordFormWithPasskeyHint();
    } else if (caps.passkeyPlatformAuthenticator) {
      // レベル3: パスキー対応 → 「パスキーでログイン」ボタン + パスワード
      showPasskeyButtonAndPasswordForm();
    } else {
      // レベル2: WebAuthn はあるがパスキー非対応 → パスワードのみ
      showPasswordOnlyForm();
    }
    return;
  }

  // フォールバック: 古い API で確認
  const conditionalAvailable =
    PublicKeyCredential.isConditionalMediationAvailable &&
    (await PublicKeyCredential.isConditionalMediationAvailable());

  if (conditionalAvailable) {
    initConditionalUI();
    showPasswordFormWithPasskeyHint();
  } else {
    const platformAvailable =
      await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    if (platformAvailable) {
      showPasskeyButtonAndPasswordForm();
    } else {
      showPasswordOnlyForm();
    }
  }
}
```

### ユーザーへの説明テキスト例

**パスキー作成の促進:**
```
パスキーを作成すると、次回からパスワードなしでログインできます。
Face ID、Touch ID、Windows Hello など、お使いのデバイスの生体認証で
安全かつ素早くサインインできます。
```

**パスキーの説明:**
```
パスキーは、パスワードに代わる新しいサインイン方法です。
フィッシング詐欺に強く、パスワードの記憶や入力が不要になります。
お使いのデバイスやパスワードマネージャーに安全に保管されます。
```

---

## 7. セキュリティ考慮事項

### origin の検証

WebAuthn の認証情報はドメイン（origin）に暗号的に紐付けられる:

- 認証器は `rp.id` のハッシュ（rpIdHash）を authenticatorData に含める
- サーバーは `clientDataJSON.origin` が期待する origin と一致するか検証する
- `rp.id` に `example.com` を指定した場合、`https://example.com` と `https://sub.example.com` からは使用可能だが、`https://evil.com` からは使用不可能
- これにより、フィッシングサイトが正規サイトの認証情報を取得することは不可能

### challenge の一意性とタイムアウト

```typescript
// challenge の要件:
// - 暗号的にランダム（crypto.getRandomValues 等）
// - 最低16バイト（SimpleWebAuthn は32バイトを使用）
// - 1回限り使用（使用後は即座に削除）
// - 有効期限を設定（60〜120秒推奨）

// サーバー側の challenge 管理例
class ChallengeStore {
  private store = new Map<string, { challenge: string; expiresAt: number }>();

  generate(sessionId: string): string {
    const challenge = crypto.randomBytes(32).toString('base64url');
    this.store.set(sessionId, {
      challenge,
      expiresAt: Date.now() + 120_000, // 120秒後に失効
    });
    return challenge;
  }

  verify(sessionId: string, challenge: string): boolean {
    const stored = this.store.get(sessionId);
    this.store.delete(sessionId); // 1回限り使用
    if (!stored) return false;
    if (Date.now() > stored.expiresAt) return false;
    return stored.challenge === challenge;
  }
}
```

### リプレイ攻撃防止（signCount）

```typescript
// 署名カウンターの検証
function verifySignCount(storedCounter: number, receivedCounter: number): boolean {
  if (receivedCounter > storedCounter) {
    // 正常: カウンターが増加している
    return true;
  }
  if (receivedCounter === 0 && storedCounter === 0) {
    // マルチデバイス同期パスキーの場合、カウンターが常に 0 の場合がある
    // この場合はカウンター検証をスキップするか、別の検出手段を用いる
    return true;
  }
  // 異常: カウンターが増加していない → 認証器のクローンの可能性
  console.warn('署名カウンターの不整合を検出: クローンデバイスの可能性');
  return false;
}
```

### フィッシング耐性の仕組み

WebAuthn がフィッシングに耐性を持つ理由:

1. **origin バインディング**: クレデンシャルは作成時の origin に紐付けられる。`evil-example.com` のフィッシングサイトでは `example.com` のクレデンシャルをトリガーできない
2. **challenge-response**: 毎回異なる challenge が使われるため、過去のやり取りを再生しても無効
3. **ブラウザによる検証**: RP ID と origin の整合性はブラウザが自動的に検証する。JavaScript コードの介入余地がない
4. **秘密鍵の不送信**: 秘密鍵がネットワーク上を流れることがないため、中間者攻撃で傍受されても秘密鍵は漏洩しない

### cross-origin iframe での制限

```html
<!-- デフォルトでは cross-origin iframe 内で WebAuthn は使用不可 -->

<!-- 認証（get）を許可する場合 -->
<iframe
  src="https://auth.provider.com/login"
  allow="publickey-credentials-get *"
></iframe>

<!-- 登録（create）を許可する場合 -->
<iframe
  src="https://auth.provider.com/register"
  allow="publickey-credentials-create *"
></iframe>
```

サーバー側の HTTP ヘッダーでも制御可能:

```
Permissions-Policy: publickey-credentials-get=("https://auth.provider.com")
Permissions-Policy: publickey-credentials-create=("https://auth.provider.com")
```

**制限事項:**

- デフォルトでは `self`（同一 origin のみ）
- cross-origin iframe で `create()` を使うには、ユーザーの明示的な操作（transient user activation）が必要
- Safari はウィンドウがフォーカスされていないと認証器へのアクセスをブロックする

**Related Origin Requests（複数ドメインでのパスキー共有）:**

```json
// https://example.com/.well-known/webauthn に配置
{
  "origins": [
    "https://shop.example.com",
    "https://blog.example.com",
    "https://app.example.com"
  ]
}
```

- `rp.id` を `example.com` としつつ、`shop.example.com` 等の別ドメインからもパスキーを使用可能にする
- 最大5つの registrable domain まで（ブラウザの制限）
- Chrome/Edge 128+, Safari 18+ でサポート

### attestation の信頼モデル

attestation は認証器の真正性を検証する仕組みだが、実運用では限界がある:

- **`attestation: 'none'`（推奨）**: attestation を要求しない。ほとんどのコンシューマー向けサービスで十分
- **`attestation: 'direct'`**: 認証器が attestation statement を提供するが、iOS 16 以降の Safari はプラットフォームキーの attestation を生成しないため、プラットフォーム認証器の真正性は検証できない
- **`attestation: 'enterprise'`**: エンタープライズ環境で、組織が管理する認証器のみを許可する場合に使用

**attestation を要求する場合の注意:**
- ブラウザはユーザーに追加の同意を求める場合がある
- 一部の認証器は attestation をサポートしていない
- Apple のプラットフォーム認証器は attestation を提供しない（プライバシー保護のため）

---

## 8. サーバーサイド実装

### 主要ライブラリ

| 言語 | ライブラリ | 特徴 |
|---|---|---|
| **Node.js / TypeScript** | [SimpleWebAuthn](https://simplewebauthn.dev/) | TypeScript ファースト。ブラウザ/サーバー両方のパッケージ。最も広く使われている |
| **Python** | [py_webauthn](https://github.com/duo-labs/py_webauthn) | Duo Security 製。Django/Flask 等と統合しやすい |
| **Rust** | [webauthn-rs](https://github.com/kanidm/webauthn-rs) | 包括的なドキュメント。パスキーの基礎から解説 |
| **Java** | [java-webauthn-server](https://github.com/Yubico/java-webauthn-server) | Yubico 製。セキュリティ監査済み。認証メカニズムに特化 |
| **Java** | [webauthn4j](https://github.com/webauthn4j/webauthn4j) | ポータブルな Java ライブラリ。Spring Security と統合可能 |
| **Go** | [go-webauthn](https://github.com/go-webauthn/webauthn) | Go 向けの WebAuthn 実装 |
| **.NET** | [FIDO2 .NET Library](https://github.com/passwordless-lib/fido2-net-lib) | .NET / ASP.NET Core 向け |

### SimpleWebAuthn を使った完全な実装例

```typescript
// server.ts
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/types';

const RP_NAME = 'My Application';
const RP_ID = 'example.com';
const ORIGIN = 'https://example.com';

// --- 登録 ---

// POST /webauthn/register/begin
async function handleRegistrationBegin(userId: string) {
  const user = await db.users.findById(userId);
  const existingCredentials = await db.credentials.findByUserId(userId);

  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: RP_ID,
    userName: user.email,
    userDisplayName: user.displayName,
    attestationType: 'none',
    excludeCredentials: existingCredentials.map(cred => ({
      id: cred.credentialId,
      transports: cred.transports,
    })),
    authenticatorSelection: {
      residentKey: 'required',
      userVerification: 'preferred',
    },
  });

  // challenge をセッションに保存
  await session.set('currentChallenge', options.challenge);

  return options;
}

// POST /webauthn/register/finish
async function handleRegistrationFinish(
  userId: string,
  response: RegistrationResponseJSON,
) {
  const expectedChallenge = await session.get('currentChallenge');
  await session.delete('currentChallenge');

  const verification = await verifyRegistrationResponse({
    response,
    expectedChallenge,
    expectedOrigin: ORIGIN,
    expectedRPID: RP_ID,
    requireUserVerification: true,
  });

  if (!verification.verified || !verification.registrationInfo) {
    throw new Error('Registration verification failed');
  }

  const { credential, credentialDeviceType, credentialBackedUp } =
    verification.registrationInfo;

  await db.credentials.create({
    credentialId: credential.id,
    publicKey: Buffer.from(credential.publicKey),
    counter: credential.counter,
    transports: credential.transports ?? [],
    userId,
    deviceType: credentialDeviceType,
    backedUp: credentialBackedUp,
    createdAt: new Date(),
    lastUsedAt: new Date(),
  });

  return { verified: true };
}

// --- 認証 ---

// POST /webauthn/authenticate/begin
async function handleAuthenticationBegin() {
  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    userVerification: 'preferred',
    // allowCredentials を省略 → Discoverable Credential から選択
  });

  await session.set('currentChallenge', options.challenge);

  return options;
}

// POST /webauthn/authenticate/finish
async function handleAuthenticationFinish(
  response: AuthenticationResponseJSON,
) {
  const expectedChallenge = await session.get('currentChallenge');
  await session.delete('currentChallenge');

  // credential ID でデータベースを検索
  const dbCredential = await db.credentials.findByCredentialId(response.id);
  if (!dbCredential) {
    throw new Error('Credential not found');
  }

  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge,
    expectedOrigin: ORIGIN,
    expectedRPID: RP_ID,
    credential: {
      id: dbCredential.credentialId,
      publicKey: new Uint8Array(dbCredential.publicKey),
      counter: dbCredential.counter,
      transports: dbCredential.transports,
    },
    requireUserVerification: true,
  });

  if (!verification.verified) {
    throw new Error('Authentication verification failed');
  }

  // カウンターと最終使用日時を更新
  await db.credentials.update(dbCredential.credentialId, {
    counter: verification.authenticationInfo.newCounter,
    lastUsedAt: new Date(),
  });

  // ユーザーを特定してセッションを確立
  const user = await db.users.findById(dbCredential.userId);
  await session.set('userId', user.id);
  await session.set('signedIn', true);

  return { verified: true, user };
}
```

### データベーススキーマ例

```sql
-- ユーザーテーブル
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT NOT NULL UNIQUE,
  display_name    TEXT,
  passkey_user_id TEXT NOT NULL UNIQUE,  -- WebAuthn user.id（PII を含まないランダム値）
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- パスキークレデンシャルテーブル
CREATE TABLE passkey_credentials (
  credential_id   TEXT PRIMARY KEY,       -- base64url エンコードされた credential ID
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  public_key      BYTEA NOT NULL,         -- 公開鍵のバイナリデータ
  counter         BIGINT NOT NULL DEFAULT 0,  -- 署名カウンター
  device_type     VARCHAR(32) NOT NULL,   -- 'singleDevice' | 'multiDevice'
  backed_up       BOOLEAN NOT NULL DEFAULT false,  -- 同期されているか
  transports      TEXT[] DEFAULT '{}',    -- '{internal,hybrid}' 等
  aaguid          TEXT,                   -- 認証器プロバイダーの GUID
  name            TEXT,                   -- ユーザーが付けた名前（管理用）
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at    TIMESTAMPTZ
);

-- credential_id でのインデックス（既にPKだが明示）
-- user_id でのインデックス（ユーザーのクレデンシャル一覧取得用）
CREATE INDEX idx_passkey_credentials_user_id ON passkey_credentials(user_id);
```

---

## 9. 参考リンク

### 仕様・標準

- [Web Authentication: An API for accessing Public Key Credentials - Level 3 (W3C)](https://www.w3.org/TR/webauthn-3/)
- [Web Authentication API - MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API)
- [PublicKeyCredential.getClientCapabilities() - MDN](https://developer.mozilla.org/en-US/docs/Web/API/PublicKeyCredential/getClientCapabilities_static)
- [CredentialsContainer: create() method - MDN](https://developer.mozilla.org/en-US/docs/Web/API/CredentialsContainer/create)

### 開発者ガイド

- [Server-side passkey registration - Google for Developers](https://developers.google.com/identity/passkeys/developer-guides/server-registration)
- [Server-side passkey authentication - Google for Developers](https://developers.google.com/identity/passkeys/developer-guides/server-authentication)
- [Passwordless sign-in on forms with WebAuthn passkey autofill - Chrome for Developers](https://developer.chrome.com/docs/identity/webauthn-conditional-ui)
- [WebAuthn Signal API - Chrome for Developers](https://developer.chrome.com/docs/identity/webauthn-signal-api)
- [Allow passkey reuse across your sites with Related Origin Requests - web.dev](https://web.dev/articles/webauthn-related-origin-requests)
- [Simpler WebAuthn feature detection - web.dev](https://web.dev/articles/webauthn-client-capabilities)
- [WebAuthn Guide](https://webauthn.guide/)

### UX ガイドライン

- [Design Guidelines - Passkey Central (FIDO Alliance)](https://www.passkeycentral.org/design-guidelines/)
- [Passkeys user interface design - Google for Developers](https://developers.google.com/identity/passkeys/ux/user-interface-design)
- [Passkeys user journeys - Google for Developers](https://developers.google.com/identity/passkeys/ux/user-journeys)
- [FIDO Alliance UX Guidelines for Passkey Creation and Sign-ins (PDF)](https://fidoalliance.org/wp-content/uploads/2023/05/FIDO-Alliance-UX-Guidelines-for-Passkey-Creation-and-Sign-ins.pdf)

### ライブラリ

- [SimpleWebAuthn (TypeScript/JavaScript)](https://simplewebauthn.dev/)
- [py_webauthn (Python)](https://github.com/duo-labs/py_webauthn)
- [webauthn-rs (Rust)](https://github.com/kanidm/webauthn-rs)
- [java-webauthn-server (Java)](https://github.com/Yubico/java-webauthn-server)
- [Libraries - passkeys.dev](https://passkeys.dev/docs/tools-libraries/libraries/)

### セキュリティ

- [Passkeys - Threat modeling and implementation considerations - SlashID](https://www.slashid.dev/blog/passkeys-security-implementation/)
- [WebAuthn Logic Flaws - InstaTunnel Blog](https://instatunnel.my/blog/the-webauthn-loop-common-logic-flaws-in-the-passwordless-handshake)

### 実装事例・動向

- [Passkey Adoption Case Studies - Authenticate 2025](https://www.corbado.com/blog/passkey-adoption-case-studies-authenticate-2025)
- [GitHub Passkeys Analysis](https://www.corbado.com/blog/github-passkeys-best-practices-analysis)
- [World Passkey Day: The State of Passkeys in 2025](https://www.authsignal.com/blog/articles/world-passkey-day-the-state-of-passkeys-in-2025)
- [awesome-webauthn - GitHub](https://github.com/yackermann/awesome-webauthn)

### デモ・テスト

- [WebAuthn.io - デモサイト](https://webauthn.io/)
- [WebAuthn.me - 入門](https://www.webauthn.me/introduction)
- [Passkeys autocomplete / conditional mediation demo](https://webauthn.passwordless.id/demos/conditional-ui)
