import type { Category } from "../lib/types.ts";

// Design rationale: The footer contains a client-side QR code rendering script.
// The script uses qrcode-generator library to create SVG and insert it into the DOM.
// This is safe because the data is a static TOTP URI, not user input.
const qrInsert = "document.getElementById('qr-code').innerHTML";

export const credentials: Category = {
  id: "credentials",
  title: "3. 認証情報 (Credentials)",
  description: "ログイン情報と OTP のテスト。one-time-code のテストには、1Password にこのホスト名用の OTP エントリを事前登録してください。",
  fields: [
    { autocomplete: "username", type: "text" },
    { autocomplete: "current-password", type: "password" },
    { autocomplete: "new-password", type: "password", note: "1Password はパスワードジェネレーターを表示する" },
    { autocomplete: "new-password", type: "password", note: "確認用: 同じ autocomplete=\"new-password\" を2つ並べるのが標準パターン" },
    { autocomplete: "one-time-code", type: "text", inputmode: "numeric", note: "下の QR コードで 1Password にテスト用 OTP を登録してからテスト" },
  ],
  footer: `
<fieldset>
  <legend>OTP テスト用セットアップ</legend>
  <p>以下の TOTP URI を 1Password に登録すると、one-time-code フィールドのテストができます:</p>
  <p><code style="word-break:break-all;">otpauth://totp/autocomplete-test:user@sandbox-autocomplete.oreore.net?secret=JBSWY3DPEHPK3PXP&issuer=autocomplete-test&digits=6&period=30</code></p>
  <p class="note">1Password の該当エントリの「ワンタイムパスワード」フィールドにこの URI を貼り付けてください。<br>
  または以下の QR コードをスキャンしてください:</p>
  <div id="qr-code" style="text-align:center;padding:16px;"></div>
  <script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js"><\/script>
  <script>
    var qr = qrcode(0, 'M');
    qr.addData('otpauth://totp/autocomplete-test:user@sandbox-autocomplete.oreore.net?secret=JBSWY3DPEHPK3PXP&issuer=autocomplete-test&digits=6&period=30');
    qr.make();
    ${qrInsert} = qr.createSvgTag(6, 0);
  <\/script>
</fieldset>
`,
};
