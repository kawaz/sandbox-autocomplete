import type { OtpVariant } from "../lib/types.ts";
import { OTPAUTH_URI, QR_SCRIPT } from "../lib/constants.ts";

export const imgSourceVariants: OtpVariant[] = [
  {
    id: "v-img-data-uri",
    title: "V: <img> data URI (= M の再確認)",
    description: "M と同じ。クライアント側で生成した SVG を base64 data URI として <img> に設定。ベースライン。",
    render: () => `
<fieldset>
  <legend>&lt;img&gt; data URI</legend>
  <div style="text-align:center;padding:16px;">
    <img id="v-qr" style="max-width:200px;" alt="QR Code (data URI)">
  </div>
  <p class="note">src = <code>data:image/svg+xml;base64,...</code></p>
  ${QR_SCRIPT}
  <script>
    var qr = qrcode(0, 'M');
    qr.addData(${JSON.stringify(OTPAUTH_URI)});
    qr.make();
    var svg = qr.createSvgTag(6, 0);
    document.getElementById('v-qr').src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
  <\/script>
</fieldset>`,
  },
  {
    id: "w-img-same-origin",
    title: "W: <img> same-origin URL",
    description: "同一 origin (sandbox-autocomplete.oreore.net:8443) から /qr.svg を <img> で読み込み。data URI との比較。",
    render: () => `
<fieldset>
  <legend>&lt;img&gt; same-origin URL</legend>
  <div style="text-align:center;padding:16px;">
    <img src="/qr.svg" style="max-width:200px;" alt="QR Code (same-origin)">
  </div>
  <p class="note">src = <code>/qr.svg</code>（同一 origin）</p>
</fieldset>`,
  },
  {
    id: "x-img-cross-origin",
    title: "X: <img> cross-origin URL (CORS なし)",
    description: "別 origin (qr-cdn.oreore.net:8443) から /qr.svg を <img> で読み込み。crossorigin 属性なし。",
    render: () => `
<fieldset>
  <legend>&lt;img&gt; cross-origin (CORS なし)</legend>
  <p>画像は <code>qr-cdn.oreore.net:8443</code>（別 origin）から配信。<code>crossorigin</code> 属性なし。</p>
  <div style="text-align:center;padding:16px;">
    <img src="https://qr-cdn.oreore.net:8443/qr.svg" style="max-width:200px;" alt="QR Code (cross-origin)">
  </div>
  <p class="note">Canvas に描画しても tainted 扱いでピクセルデータ読み取り不可。</p>
</fieldset>`,
  },
  {
    id: "y-img-cross-origin-cors",
    title: "Y: <img> cross-origin URL + crossorigin 属性",
    description: "別 origin から /qr.svg を読み込み + crossorigin='anonymous'。サーバーは CORS ヘッダー付きで返す。",
    render: () => `
<fieldset>
  <legend>&lt;img&gt; cross-origin + CORS</legend>
  <p>画像は <code>qr-cdn.oreore.net:8443</code>（別 origin）から配信。<code>crossorigin="anonymous"</code> 属性付き + CORS ヘッダーあり。</p>
  <div style="text-align:center;padding:16px;">
    <img src="https://qr-cdn.oreore.net:8443/qr.svg" crossorigin="anonymous" style="max-width:200px;" alt="QR Code (cross-origin + CORS)">
  </div>
  <p class="note">Canvas でピクセルデータ読み取り可能な状態。</p>
</fieldset>`,
  },
  {
    id: "z-img-blob-url",
    title: "Z: <img> blob URL",
    description: "fetch で取得した SVG を Blob URL に変換して <img> に設定。data URI でも通常 URL でもないパターン。",
    render: () => {
      const setNote = "document.getElementById('z-note').innerHTML";
      return `
<fieldset>
  <legend>&lt;img&gt; blob URL</legend>
  <div style="text-align:center;padding:16px;">
    <img id="z-qr" style="max-width:200px;" alt="QR Code (blob URL)">
  </div>
  <p class="note" id="z-note">src = <code>blob:...</code>（読み込み中...）</p>
  <script>
    fetch('/qr.svg')
      .then(function(r) { return r.blob(); })
      .then(function(blob) {
        var url = URL.createObjectURL(blob);
        document.getElementById('z-qr').src = url;
        ${setNote} = 'src = <code>' + url + '</code>';
      });
  <\/script>
</fieldset>`;
    },
  },
];
