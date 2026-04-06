import type { OtpVariant } from "../lib/types.ts";
import { OTPAUTH_URI, QR_SCRIPT, qrBlock } from "../lib/constants.ts";
import { esc } from "../lib/html.ts";

export const basicVariants: OtpVariant[] = [
  {
    id: "a-input-only",
    title: "A: one-time-code input のみ",
    description: "autocomplete=\"one-time-code\" の input フィールドだけ。QR コードや otpauth URI テキストなし。",
    render: () => `
<form action="#" method="post">
  <fieldset>
    <legend>one-time-code input のみ</legend>
    <div class="field">
      <label><code>one-time-code</code></label>
      <input type="text" name="otp" autocomplete="one-time-code" inputmode="numeric">
    </div>
    <div class="submit-row"><button type="submit">送信</button></div>
  </fieldset>
</form>`,
  },
  {
    id: "b-otpauth-text",
    title: "B: otpauth:// URI テキスト表示のみ",
    description: "otpauth:// URI をプレーンテキストとしてページに表示するだけ。フォームなし。",
    render: () => `
<fieldset>
  <legend>otpauth:// URI テキスト</legend>
  <p><code style="word-break:break-all;">${esc(OTPAUTH_URI)}</code></p>
</fieldset>`,
  },
  {
    id: "c-qr-otpauth",
    title: "C: QR コード (otpauth 内容) のみ",
    description: "otpauth:// URI を QR コードとして表示するだけ。テキスト表示もフォームもなし。",
    render: () => `
<fieldset>
  <legend>QR コード (otpauth://)</legend>
  ${qrBlock(OTPAUTH_URI)}
</fieldset>`,
  },
  {
    id: "d-qr-plain",
    title: "D: QR コード (通常URL) のみ — コントロール",
    description: "otpauth ではない普通の URL を QR コードとして表示。1Password が QR コード自体に反応するか、それとも otpauth スキームに反応するかの切り分け。",
    render: () => `
<fieldset>
  <legend>QR コード (通常URL) — コントロール</legend>
  ${qrBlock("https://example.com/hello")}
  <p class="note">otpauth:// ではなく https://example.com/hello の QR コード</p>
</fieldset>`,
  },
  {
    id: "e-otpauth-link",
    title: "E: otpauth:// リンク (<a>タグ) のみ",
    description: "otpauth:// URI を <a> タグのリンクとして設置。クリック可能な状態。",
    render: () => `
<fieldset>
  <legend>otpauth:// リンク</legend>
  <p><a href="${esc(OTPAUTH_URI)}" style="word-break:break-all;">${esc(OTPAUTH_URI)}</a></p>
</fieldset>`,
  },
  {
    id: "f-empty",
    title: "F: 空ページ — コントロール",
    description: "何も要素がないページ。ダイアログが出なければ、他のバリアントとの比較に使う。",
    render: () => `
<fieldset>
  <legend>空ページ（コントロール）</legend>
  <p>このページには autocomplete フィールドも QR コードも otpauth URI もありません。</p>
</fieldset>`,
  },
  {
    id: "g-otpauth-hidden",
    title: "G: otpauth:// URI を hidden input に格納",
    description: "otpauth:// URI が hidden input の value に入っている場合に反応するか。",
    render: () => `
<form action="#" method="post">
  <fieldset>
    <legend>hidden input に otpauth URI</legend>
    <input type="hidden" name="otp-setup" value="${esc(OTPAUTH_URI)}">
    <p>hidden input に otpauth:// URI が含まれています（画面上は見えません）。</p>
    <div class="submit-row"><button type="submit">送信</button></div>
  </fieldset>
</form>`,
  },
  {
    id: "h-otpauth-data-attr",
    title: "H: otpauth:// URI を data-* 属性に格納",
    description: "otpauth:// URI が div の data 属性に入っている場合に反応するか。",
    render: () => `
<fieldset>
  <legend>data-* 属性に otpauth URI</legend>
  <div data-otp-uri="${esc(OTPAUTH_URI)}">
    <p>この div の data-otp-uri 属性に otpauth:// URI が含まれています。</p>
  </div>
</fieldset>`,
  },
  {
    id: "i-qr-text-combo",
    title: "I: QR コード + テキスト (input なし)",
    description: "QR コードと otpauth テキストの両方があるが、入力フォームはない。元の credentials ページから input を除いた状態に近い。",
    render: () => `
<fieldset>
  <legend>QR + テキスト（フォームなし）</legend>
  <p><code style="word-break:break-all;">${esc(OTPAUTH_URI)}</code></p>
  ${qrBlock(OTPAUTH_URI)}
</fieldset>`,
  },
  {
    id: "j-qr-delayed-button",
    title: "J: ボタンクリックで QR コードを遅延表示",
    description: "初期状態では QR なし。ボタンを押すと JS で QR コードを動的生成。ページロード時にダイアログが出るか、ボタン押下後に出るかの切り分け。",
    render: () => {
      const setDelayedQr = "document.getElementById('delayed-qr').innerHTML";
      return `
<fieldset>
  <legend>遅延 QR 表示（ボタンクリック）</legend>
  <p>ページを開いた時点ではページ内に otpauth URI は存在しません。</p>
  <button type="button" id="show-qr-btn" style="padding:8px 20px;font-size:1rem;cursor:pointer;">QR コードを表示</button>
  <div id="delayed-qr" style="text-align:center;padding:16px;"></div>
  ${QR_SCRIPT}
  <script>
    document.getElementById('show-qr-btn').addEventListener('click', function() {
      var qr = qrcode(0, 'M');
      qr.addData(${JSON.stringify(OTPAUTH_URI)});
      qr.make();
      ${setDelayedQr} = qr.createSvgTag(6, 0);
      this.disabled = true;
      this.textContent = '表示済み';
    });
  <\/script>
</fieldset>`;
    },
  },
  {
    id: "k-clipboard-copy",
    title: "K: クリップボードにコピーボタン",
    description: "otpauth URI をボタンクリックでクリップボードにコピー。URI はボタンの data 属性に格納され、テキストとしてはページに表示されない。",
    render: () => `
<fieldset>
  <legend>クリップボードにコピー</legend>
  <p>otpauth URI はページ上に表示されていませんが、ボタンの data 属性に格納されています。</p>
  <button type="button" id="copy-btn" data-uri="${esc(OTPAUTH_URI)}" style="padding:8px 20px;font-size:1rem;cursor:pointer;">otpauth URI をコピー</button>
  <span id="copy-status" style="margin-left:8px;color:#888;"></span>
  <script>
    document.getElementById('copy-btn').addEventListener('click', function() {
      navigator.clipboard.writeText(this.dataset.uri).then(function() {
        document.getElementById('copy-status').textContent = 'コピーしました！';
      });
    });
  <\/script>
</fieldset>`,
  },
  {
    id: "l-otpauth-in-js-var",
    title: "L: otpauth URI が JS 変数にのみ存在",
    description: "otpauth URI は JS 変数にだけ格納され、DOM には一切出力されない。JS のメモリ内データにも反応するかのテスト。",
    render: () => `
<fieldset>
  <legend>JS 変数のみ (DOM に非表示)</legend>
  <p>otpauth URI は JavaScript の変数にのみ存在し、DOM 上のどこにも出力されていません。</p>
  <script>
    var _otpSecret = ${JSON.stringify(OTPAUTH_URI)};
    console.log('OTP URI is stored in _otpSecret variable');
  <\/script>
</fieldset>`,
  },
  {
    id: "m-img-qr-static",
    title: "M: QR コードを <img> タグで表示 (SVG data URI)",
    description: "QR コードを SVG data URI の <img> として埋め込み。JS による DOM 生成ではなく静的な img タグ。",
    render: () => `
<fieldset>
  <legend>QR コード (img タグ / SVG data URI)</legend>
  <div style="text-align:center;padding:16px;">
    <img id="static-qr" style="max-width:200px;" alt="QR Code">
  </div>
  ${QR_SCRIPT}
  <script>
    var qr = qrcode(0, 'M');
    qr.addData(${JSON.stringify(OTPAUTH_URI)});
    qr.make();
    var svg = qr.createSvgTag(6, 0);
    var encoded = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    document.getElementById('static-qr').src = encoded;
  <\/script>
</fieldset>`,
  },
  {
    id: "n-otpauth-comment",
    title: "N: otpauth URI が HTML コメント内にのみ存在",
    description: "otpauth URI が HTML コメント内にだけ存在。ブラウザ拡張がコメントノードもスキャンするかのテスト。",
    render: () => `
<fieldset>
  <legend>HTML コメント内 (非表示)</legend>
  <p>otpauth URI は HTML コメントの中にのみ存在します。ページ上には一切表示されていません。</p>
  <!-- ${OTPAUTH_URI} -->
</fieldset>`,
  },
  {
    id: "o-delayed-text",
    title: "O: ボタンクリックで otpauth テキストを遅延表示",
    description: "初期状態では otpauth テキストなし。ボタンで JS により DOM に挿入。QR なし。",
    render: () => `
<fieldset>
  <legend>遅延テキスト表示（ボタンクリック）</legend>
  <p>ページを開いた時点では otpauth URI はどこにも存在しません。</p>
  <button type="button" id="show-uri-btn" style="padding:8px 20px;font-size:1rem;cursor:pointer;">otpauth URI を表示</button>
  <div id="delayed-uri" style="padding:8px 0;"></div>
  <script>
    document.getElementById('show-uri-btn').addEventListener('click', function() {
      var code = document.createElement('code');
      code.style.wordBreak = 'break-all';
      code.textContent = ${JSON.stringify(OTPAUTH_URI)};
      document.getElementById('delayed-uri').appendChild(code);
      this.disabled = true;
      this.textContent = '表示済み';
    });
  <\/script>
</fieldset>`,
  },
  {
    id: "p-iframe-qr",
    title: "P: iframe 内に QR コード",
    description: "QR コードが srcdoc iframe 内に表示される。拡張が iframe 内もスキャンするかのテスト。",
    render: () => {
      const script = '<scr' + 'ipt>\n' +
        '    var qr = qrcode(0, "M");\n' +
        '    qr.addData(' + JSON.stringify(OTPAUTH_URI) + ');\n' +
        '    qr.make();\n' +
        '    var svg = qr.createSvgTag(6, 0);\n' +
        '    var encoded = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));\n' +
        '    var html = \'<!DOCTYPE html><html><body style="margin:0;text-align:center;padding:16px;"><img src="\' + encoded + \'" style="max-width:200px;" alt="QR"></body></html>\';\n' +
        '    var iframe = document.createElement("iframe");\n' +
        '    iframe.srcdoc = html;\n' +
        '    iframe.style.cssText = "width:100%;height:250px;border:1px solid #d0d0d0;border-radius:6px;";\n' +
        '    iframe.sandbox = "allow-same-origin";\n' +
        '    document.getElementById("p-iframe-container").appendChild(iframe);\n' +
        '  </scr' + 'ipt>';
      return `
<fieldset>
  <legend>iframe 内の QR コード</legend>
  <p class="note">QR 画像を親ページで生成し、iframe 内に <code>&lt;img&gt;</code> data URI として埋め込みます。</p>
  <div id="p-iframe-container"></div>
  ${QR_SCRIPT}
  ${script}
</fieldset>`;
    },
  },
];
