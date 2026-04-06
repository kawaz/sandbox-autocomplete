import type { OtpVariant } from "../lib/types.ts";
import { OTPAUTH_URI, QR_SCRIPT } from "../lib/constants.ts";

// MX が全滅する原因を切り分けるためのバリアント群
// V（動く）と MX3（動かない）の差分を1つずつ検証

export const mxDebugVariants: OtpVariant[] = [
  {
    // MX3 と同じだが script を fieldset 内に移動（V と同じ構造）
    id: "mxd-1-script-inside",
    title: "MXD1: script を fieldset 内に配置",
    description: "MX3 と同じ data URI だが、<script> を fieldset 内に配置（V と同じ構造）。",
    render: () => `
<fieldset>
  <legend>MXD1: script を fieldset 内に</legend>
  <div style="text-align:center;padding:20px;">
    <img id="mxd1-qr" class="mxd1-uri" style="max-width:200px;" alt="QR">
  </div>
  ${QR_SCRIPT}
  <script>
    var qr = qrcode(0, 'M');
    qr.addData(${JSON.stringify(OTPAUTH_URI)});
    qr.make();
    var svg = qr.createSvgTag(6, 0);
    document.getElementById('mxd1-qr').src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
  <\/script>
</fieldset>`,
  },
  {
    // V と同じだが script を fieldset 外に配置（MX と同じ構造）
    id: "mxd-2-script-outside",
    title: "MXD2: script を fieldset 外に配置",
    description: "V と同じ data URI だが、<script> を fieldset 外に配置（MX と同じ構造）。",
    render: () => `
<fieldset>
  <legend>MXD2: script を fieldset 外に</legend>
  <div style="text-align:center;padding:20px;">
    <img id="mxd2-qr" style="max-width:200px;" alt="QR">
  </div>
</fieldset>
${QR_SCRIPT}
<script>
  var qr = qrcode(0, 'M');
  qr.addData(${JSON.stringify(OTPAUTH_URI)});
  qr.make();
  var svg = qr.createSvgTag(6, 0);
  document.getElementById('mxd2-qr').src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
<\/script>`,
  },
  {
    // MX と同じだが IIFE なし（V と同じグローバルスコープ）
    id: "mxd-3-no-iife",
    title: "MXD3: IIFE なし + script 外",
    description: "MX と同じ script 外配置だが IIFE で囲まない（V と同じグローバルスコープ実行）。",
    render: () => `
<fieldset>
  <legend>MXD3: IIFE なし + script 外</legend>
  <div style="text-align:center;padding:20px;">
    <img id="mxd3-qr" style="max-width:200px;" alt="QR">
  </div>
</fieldset>
${QR_SCRIPT}
<script>
  var qr = qrcode(0, 'M');
  qr.addData(${JSON.stringify(OTPAUTH_URI)});
  qr.make();
  var svg = qr.createSvgTag(6, 0);
  document.getElementById('mxd3-qr').src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
<\/script>`,
  },
  {
    // querySelectorAll ではなく getElementById（V と同じ）+ script 外
    id: "mxd-4-getbyid-outside",
    title: "MXD4: getElementById + script 外",
    description: "getElementById を使用（V と同じ）だが script は fieldset 外（MX と同じ）。",
    render: () => `
<fieldset>
  <legend>MXD4: getElementById + script 外</legend>
  <div style="text-align:center;padding:20px;">
    <img id="mxd4-qr" style="max-width:200px;" alt="QR">
  </div>
</fieldset>
${QR_SCRIPT}
<script>
(function() {
  var qr = qrcode(0, 'M');
  qr.addData(${JSON.stringify(OTPAUTH_URI)});
  qr.make();
  var svg = qr.createSvgTag(6, 0);
  document.getElementById('mxd4-qr').src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
})();
<\/script>`,
  },
  {
    // V を完全コピー（ベースライン確認用）
    id: "mxd-5-v-clone",
    title: "MXD5: V の完全コピー（ベースライン）",
    description: "V と全く同じ HTML。MXD 系テスト中の拡張正常性確認用。",
    render: () => `
<fieldset>
  <legend>&lt;img&gt; data URI (V clone)</legend>
  <div style="text-align:center;padding:16px;">
    <img id="mxd5-qr" style="max-width:200px;" alt="QR Code (data URI)">
  </div>
  <p class="note">src = <code>data:image/svg+xml;base64,...</code></p>
  ${QR_SCRIPT}
  <script>
    var qr = qrcode(0, 'M');
    qr.addData(${JSON.stringify(OTPAUTH_URI)});
    qr.make();
    var svg = qr.createSvgTag(6, 0);
    document.getElementById('mxd5-qr').src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
  <\/script>
</fieldset>`,
  },
  // ---------- テキストの有無による切り分け ----------
  {
    // MXD5 から <p class="note"> だけを削除
    id: "mxd-6-no-note",
    title: "MXD6: V から note テキストを削除",
    description: "MXD5(=V) と同じだが <p class='note'>src = data:image/svg+xml;base64,...</p> を削除。テキストの存在がトリガー条件かの検証。",
    render: () => `
<fieldset>
  <legend>&lt;img&gt; data URI (note なし)</legend>
  <div style="text-align:center;padding:16px;">
    <img id="mxd6-qr" style="max-width:200px;" alt="QR Code (data URI)">
  </div>
  ${QR_SCRIPT}
  <script>
    var qr = qrcode(0, 'M');
    qr.addData(${JSON.stringify(OTPAUTH_URI)});
    qr.make();
    var svg = qr.createSvgTag(6, 0);
    document.getElementById('mxd6-qr').src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
  <\/script>
</fieldset>`,
  },
  {
    // MXD1 に <p class="note"> を追加（MXD5 と同じテキスト）
    id: "mxd-7-add-note",
    title: "MXD7: MXD1 に note テキストを追加",
    description: "MXD1（不反応）に MXD5 と同じ <p class='note'> を追加。これで反応すればテキストがトリガー条件。",
    render: () => `
<fieldset>
  <legend>MXD7: MXD1 + note テキスト</legend>
  <div style="text-align:center;padding:20px;">
    <img id="mxd7-qr" style="max-width:200px;" alt="QR">
  </div>
  <p class="note">src = <code>data:image/svg+xml;base64,...</code></p>
  ${QR_SCRIPT}
  <script>
    var qr = qrcode(0, 'M');
    qr.addData(${JSON.stringify(OTPAUTH_URI)});
    qr.make();
    var svg = qr.createSvgTag(6, 0);
    document.getElementById('mxd7-qr').src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
  <\/script>
</fieldset>`,
  },
  {
    // テキストを変えてみる: "data:image" では���く無関係なテキスト
    id: "mxd-8-irrelevant-note",
    title: "MXD8: 無関係なテキストの note",
    description: "MXD1 に無関係なテキスト（'Hello World'）の note を追加。特定のキーワードが必要かの検証。",
    render: () => `
<fieldset>
  <legend>MXD8: 無関係テキスト note</legend>
  <div style="text-align:center;padding:20px;">
    <img id="mxd8-qr" style="max-width:200px;" alt="QR">
  </div>
  <p class="note">Hello World - this is just a test paragraph</p>
  ${QR_SCRIPT}
  <script>
    var qr = qrcode(0, 'M');
    qr.addData(${JSON.stringify(OTPAUTH_URI)});
    qr.make();
    var svg = qr.createSvgTag(6, 0);
    document.getElementById('mxd8-qr').src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
  <\/script>
</fieldset>`,
  },
  {
    // otpauth テキストを note に入れる
    id: "mxd-9-otpauth-note",
    title: "MXD9: otpauth テキストの note",
    description: "MXD1 に otpauth:// URI テキストの note を追加。I���QR+otpauth text）と同じパターンかの検証。",
    render: () => `
<fieldset>
  <legend>MXD9: otpauth テキスト note</legend>
  <div style="text-align:center;padding:20px;">
    <img id="mxd9-qr" style="max-width:200px;" alt="QR">
  </div>
  <p class="note"><code>${OTPAUTH_URI}</code></p>
  ${QR_SCRIPT}
  <script>
    var qr = qrcode(0, 'M');
    qr.addData(${JSON.stringify(OTPAUTH_URI)});
    qr.make();
    var svg = qr.createSvgTag(6, 0);
    document.getElementById('mxd9-qr').src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
  <\/script>
</fieldset>`,
  },
  {
    // alt 属性の違いを検証: MXD1 は alt="QR"、MXD5 は alt="QR Code (data URI)"
    id: "mxd-10-alt-attr",
    title: "MXD10: alt 属性を V と同じに",
    description: "MXD1 の alt を 'QR Code (data URI)' に変更（MXD5/V と同じ）。alt 属性がトリガーに影響するかの検証。",
    render: () => `
<fieldset>
  <legend>MXD10: alt 属性変更</legend>
  <div style="text-align:center;padding:20px;">
    <img id="mxd10-qr" style="max-width:200px;" alt="QR Code (data URI)">
  </div>
  ${QR_SCRIPT}
  <script>
    var qr = qrcode(0, 'M');
    qr.addData(${JSON.stringify(OTPAUTH_URI)});
    qr.make();
    var svg = qr.createSvgTag(6, 0);
    document.getElementById('mxd10-qr').src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
  <\/script>
</fieldset>`,
  },
];
