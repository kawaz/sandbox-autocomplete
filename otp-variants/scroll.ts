import type { OtpVariant } from "../lib/types.ts";
import { OTPAUTH_URI, QR_SCRIPT, qrBlock } from "../lib/constants.ts";
import { esc } from "../lib/html.ts";

export const scrollVariants: OtpVariant[] = [
  {
    id: "q-scroll-img-qr",
    title: "Q: スクロール検証 — <img> QR (M の発展型)",
    description: "M で反応した <img> QR の上下に大きなスペーサーを配置。上端・下端の表示タイミングを切り分けられる。スクロール位置インジケーター付き。",
    render: () => `
<fieldset>
  <legend>スクロール検証 — &lt;img&gt; QR コード</legend>
  <p>下にスクロールすると QR コードがあります。上端・下端がどの時点でダイアログを誘発するか確認してください。</p>
  <div style="position:fixed;top:10px;right:10px;background:rgba(0,0,0,0.75);color:#fff;padding:8px 12px;border-radius:6px;font-size:0.8rem;z-index:9999;" id="scroll-indicator">
    QR: 画面外（上方）
  </div>
  <div style="height:150vh;background:repeating-linear-gradient(180deg,#f8f8f8 0px,#f8f8f8 40px,#f0f0f0 40px,#f0f0f0 80px);display:flex;align-items:center;justify-content:center;">
    <span style="color:#aaa;font-size:1.2rem;">↓ スクロールしてください ↓</span>
  </div>
  <div id="qr-top-marker" style="height:1px;"></div>
  <div style="text-align:center;padding:20px;border:2px dashed #4a90d9;border-radius:8px;margin:4px 0;">
    <p style="margin:0 0 8px;font-weight:bold;">QR コード (<code>&lt;img&gt;</code> SVG data URI)</p>
    <img id="scroll-qr" style="max-width:200px;" alt="QR Code">
  </div>
  <div id="qr-bottom-marker" style="height:1px;"></div>
  <div style="height:150vh;background:repeating-linear-gradient(180deg,#f0f0f0 0px,#f0f0f0 40px,#f8f8f8 40px,#f8f8f8 80px);display:flex;align-items:center;justify-content:center;">
    <span style="color:#aaa;font-size:1.2rem;">↑ QR コードは上にあります ↑</span>
  </div>
  ${QR_SCRIPT}
  <script>
    (function() {
      var qr = qrcode(0, 'M');
      qr.addData(${JSON.stringify(OTPAUTH_URI)});
      qr.make();
      var svg = qr.createSvgTag(6, 0);
      document.getElementById('scroll-qr').src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));

      var indicator = document.getElementById('scroll-indicator');
      var img = document.getElementById('scroll-qr');
      function updateIndicator() {
        var rect = img.getBoundingClientRect();
        var vh = window.innerHeight;
        if (rect.bottom < 0) {
          indicator.textContent = 'QR: 画面外（上方） ↓' + Math.abs(Math.round(rect.bottom)) + 'px';
          indicator.style.background = 'rgba(200,0,0,0.75)';
        } else if (rect.top > vh) {
          indicator.textContent = 'QR: 画面外（下方） ↑' + Math.round(rect.top - vh) + 'px';
          indicator.style.background = 'rgba(200,0,0,0.75)';
        } else if (rect.top >= 0 && rect.bottom <= vh) {
          indicator.textContent = 'QR: 完全に表示中 ✓';
          indicator.style.background = 'rgba(0,150,0,0.75)';
        } else if (rect.top < 0) {
          indicator.textContent = 'QR: 上端が画面外（' + Math.abs(Math.round(rect.top)) + 'px 隠れ）';
          indicator.style.background = 'rgba(200,150,0,0.85)';
        } else {
          indicator.textContent = 'QR: 下端が画面外（' + Math.round(rect.bottom - vh) + 'px 隠れ）';
          indicator.style.background = 'rgba(200,150,0,0.85)';
        }
      }
      window.addEventListener('scroll', updateIndicator, { passive: true });
      updateIndicator();
    })();
  <\/script>
</fieldset>`,
  },
  {
    id: "r-scroll-svg-text",
    title: "R: スクロール検証 — SVG QR + テキスト (I の発展型)",
    description: "I で反応した QR+テキストの組み合わせの上下にスペーサー配置。スクロール位置インジケーター付き。",
    render: () => `
<fieldset>
  <legend>スクロール検証 — SVG QR + テキスト</legend>
  <p>下にスクロールすると QR コードとテキストがあります。</p>
  <div style="position:fixed;top:10px;right:10px;background:rgba(0,0,0,0.75);color:#fff;padding:8px 12px;border-radius:6px;font-size:0.8rem;z-index:9999;" id="scroll-indicator-r">
    コンテンツ: 画面外（下方）
  </div>
  <div style="height:150vh;background:repeating-linear-gradient(180deg,#f8f8f8 0px,#f8f8f8 40px,#f0f0f0 40px,#f0f0f0 80px);display:flex;align-items:center;justify-content:center;">
    <span style="color:#aaa;font-size:1.2rem;">↓ スクロールしてください ↓</span>
  </div>
  <div id="content-area-r" style="border:2px dashed #4a90d9;border-radius:8px;padding:20px;">
    <p style="font-weight:bold;">QR コード + otpauth テキスト</p>
    <p><code style="word-break:break-all;">${esc(OTPAUTH_URI)}</code></p>
    ${qrBlock(OTPAUTH_URI)}
  </div>
  <div style="height:150vh;background:repeating-linear-gradient(180deg,#f0f0f0 0px,#f0f0f0 40px,#f8f8f8 40px,#f8f8f8 80px);display:flex;align-items:center;justify-content:center;">
    <span style="color:#aaa;font-size:1.2rem;">↑ コンテンツは上にあります ↑</span>
  </div>
  <script>
    (function() {
      var indicator = document.getElementById('scroll-indicator-r');
      var area = document.getElementById('content-area-r');
      function update() {
        var rect = area.getBoundingClientRect();
        var vh = window.innerHeight;
        if (rect.bottom < 0) {
          indicator.textContent = 'コンテンツ: 画面外（上方） ↓' + Math.abs(Math.round(rect.bottom)) + 'px';
          indicator.style.background = 'rgba(200,0,0,0.75)';
        } else if (rect.top > vh) {
          indicator.textContent = 'コンテンツ: 画面外（下方） ↑' + Math.round(rect.top - vh) + 'px';
          indicator.style.background = 'rgba(200,0,0,0.75)';
        } else if (rect.top >= 0 && rect.bottom <= vh) {
          indicator.textContent = 'コンテンツ: 完全に表示中 ✓';
          indicator.style.background = 'rgba(0,150,0,0.75)';
        } else if (rect.top < 0) {
          indicator.textContent = 'コンテンツ: 上端が画面外（' + Math.abs(Math.round(rect.top)) + 'px 隠れ）';
          indicator.style.background = 'rgba(200,150,0,0.85)';
        } else {
          indicator.textContent = 'コンテンツ: 下端が画面外（' + Math.round(rect.bottom - vh) + 'px 隠れ）';
          indicator.style.background = 'rgba(200,150,0,0.85)';
        }
      }
      window.addEventListener('scroll', update, { passive: true });
      update();
    })();
  <\/script>
</fieldset>`,
  },
  {
    id: "s-scroll-svg-only",
    title: "S: スクロール検証 — SVG QR のみ (C の発展型)",
    description: "C では反応しなかった SVG QR 単体。スクロールで viewport に入った時に反応するか。テキスト併記なし。",
    render: () => `
<fieldset>
  <legend>スクロール検証 — SVG QR のみ（テキストなし）</legend>
  <p>下にスクロールすると QR コードがあります（テキスト併記なし）。</p>
  <div style="position:fixed;top:10px;right:10px;background:rgba(0,0,0,0.75);color:#fff;padding:8px 12px;border-radius:6px;font-size:0.8rem;z-index:9999;" id="scroll-indicator-s">
    QR: 画面外（下方）
  </div>
  <div style="height:150vh;background:repeating-linear-gradient(180deg,#f8f8f8 0px,#f8f8f8 40px,#f0f0f0 40px,#f0f0f0 80px);display:flex;align-items:center;justify-content:center;">
    <span style="color:#aaa;font-size:1.2rem;">↓ スクロールしてください ↓</span>
  </div>
  <div id="content-area-s" style="border:2px dashed #4a90d9;border-radius:8px;padding:20px;text-align:center;">
    <p style="font-weight:bold;">QR コード（SVG DOM 直接挿入、テキストなし）</p>
    ${qrBlock(OTPAUTH_URI)}
  </div>
  <div style="height:150vh;background:repeating-linear-gradient(180deg,#f0f0f0 0px,#f0f0f0 40px,#f8f8f8 40px,#f8f8f8 80px);display:flex;align-items:center;justify-content:center;">
    <span style="color:#aaa;font-size:1.2rem;">↑ コンテンツは上にあります ↑</span>
  </div>
  <script>
    (function() {
      var indicator = document.getElementById('scroll-indicator-s');
      var area = document.getElementById('content-area-s');
      function update() {
        var rect = area.getBoundingClientRect();
        var vh = window.innerHeight;
        if (rect.bottom < 0) {
          indicator.textContent = 'QR: 画面外（上方） ↓' + Math.abs(Math.round(rect.bottom)) + 'px';
          indicator.style.background = 'rgba(200,0,0,0.75)';
        } else if (rect.top > vh) {
          indicator.textContent = 'QR: 画面外（下方） ↑' + Math.round(rect.top - vh) + 'px';
          indicator.style.background = 'rgba(200,0,0,0.75)';
        } else if (rect.top >= 0 && rect.bottom <= vh) {
          indicator.textContent = 'QR: 完全に表示中 ✓';
          indicator.style.background = 'rgba(0,150,0,0.75)';
        } else if (rect.top < 0) {
          indicator.textContent = 'QR: 上端が画面外（' + Math.abs(Math.round(rect.top)) + 'px 隠れ）';
          indicator.style.background = 'rgba(200,150,0,0.85)';
        } else {
          indicator.textContent = 'QR: 下端が画面外（' + Math.round(rect.bottom - vh) + 'px 隠れ）';
          indicator.style.background = 'rgba(200,150,0,0.85)';
        }
      }
      window.addEventListener('scroll', update, { passive: true });
      update();
    })();
  <\/script>
</fieldset>`,
  },
  {
    id: "t-delayed-then-scroll",
    title: "T: JS 遅延生成 + スクロール検証",
    description: "ボタンクリックで QR を動的生成した後、スクロールで viewport に入ったら反応するか。J + スクロールの複合テスト。",
    render: () => {
      const setAreaContent = "area.innerHTML";
      return `
<fieldset>
  <legend>遅延生成 + スクロール検証</legend>
  <p>1. まずボタンを押して QR を生成（画面外に生成されます）<br>2. スクロールして viewport に入ったら反応するか確認</p>
  <button type="button" id="delayed-scroll-btn" style="padding:8px 20px;font-size:1rem;cursor:pointer;">QR コードを生成（画面外）</button>
  <div style="position:fixed;top:10px;right:10px;background:rgba(0,0,0,0.75);color:#fff;padding:8px 12px;border-radius:6px;font-size:0.8rem;z-index:9999;" id="scroll-indicator-t">
    QR: 未生成
  </div>
  <div style="height:150vh;background:repeating-linear-gradient(180deg,#f8f8f8 0px,#f8f8f8 40px,#f0f0f0 40px,#f0f0f0 80px);display:flex;align-items:center;justify-content:center;">
    <span style="color:#aaa;font-size:1.2rem;">↓ QR 生成後にスクロール ↓</span>
  </div>
  <div id="delayed-scroll-qr" style="border:2px dashed #ccc;border-radius:8px;padding:20px;text-align:center;min-height:100px;">
    <p style="color:#aaa;">QR コード未生成</p>
  </div>
  <div style="height:150vh;background:repeating-linear-gradient(180deg,#f0f0f0 0px,#f0f0f0 40px,#f8f8f8 40px,#f8f8f8 80px);"></div>
  ${QR_SCRIPT}
  <script>
    (function() {
      var generated = false;
      var indicator = document.getElementById('scroll-indicator-t');
      var area = document.getElementById('delayed-scroll-qr');

      document.getElementById('delayed-scroll-btn').addEventListener('click', function() {
        var qr = qrcode(0, 'M');
        qr.addData(${JSON.stringify(OTPAUTH_URI)});
        qr.make();
        // <img> パターン（M と同じ方式）で生成
        var svg = qr.createSvgTag(6, 0);
        var encoded = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
        ${setAreaContent} = '<p style="font-weight:bold;">動的生成された QR (&lt;img&gt;)</p><img src="' + encoded + '" style="max-width:200px;" alt="QR">';
        area.style.borderColor = '#4a90d9';
        this.disabled = true;
        this.textContent = '生成済み — スクロールして確認';
        generated = true;
        update();
      });

      function update() {
        if (!generated) { indicator.textContent = 'QR: 未生成'; return; }
        var rect = area.getBoundingClientRect();
        var vh = window.innerHeight;
        if (rect.bottom < 0) {
          indicator.textContent = 'QR: 画面外（上方） ↓' + Math.abs(Math.round(rect.bottom)) + 'px';
          indicator.style.background = 'rgba(200,0,0,0.75)';
        } else if (rect.top > vh) {
          indicator.textContent = 'QR: 画面外（下方） ↑' + Math.round(rect.top - vh) + 'px';
          indicator.style.background = 'rgba(200,0,0,0.75)';
        } else if (rect.top >= 0 && rect.bottom <= vh) {
          indicator.textContent = 'QR: 完全に表示中 ✓';
          indicator.style.background = 'rgba(0,150,0,0.75)';
        } else if (rect.top < 0) {
          indicator.textContent = 'QR: 上端が画面外（' + Math.abs(Math.round(rect.top)) + 'px 隠れ）';
          indicator.style.background = 'rgba(200,150,0,0.85)';
        } else {
          indicator.textContent = 'QR: 下端が画面外（' + Math.round(rect.bottom - vh) + 'px 隠れ）';
          indicator.style.background = 'rgba(200,150,0,0.85)';
        }
      }
      window.addEventListener('scroll', update, { passive: true });
    })();
  <\/script>
</fieldset>`;
    },
  },
  {
    id: "u-text-only-scroll",
    title: "U: スクロール検証 — otpauth テキストのみ",
    description: "B では反応しなかったテキスト単体。スクロールで viewport に入った時に反応するか。",
    render: () => `
<fieldset>
  <legend>スクロール検証 — otpauth テキストのみ</legend>
  <p>下にスクロールすると otpauth URI テキストがあります（QR なし）。</p>
  <div style="position:fixed;top:10px;right:10px;background:rgba(0,0,0,0.75);color:#fff;padding:8px 12px;border-radius:6px;font-size:0.8rem;z-index:9999;" id="scroll-indicator-u">
    テキスト: 画面外（下方）
  </div>
  <div style="height:150vh;background:repeating-linear-gradient(180deg,#f8f8f8 0px,#f8f8f8 40px,#f0f0f0 40px,#f0f0f0 80px);display:flex;align-items:center;justify-content:center;">
    <span style="color:#aaa;font-size:1.2rem;">↓ スクロールしてください ↓</span>
  </div>
  <div id="content-area-u" style="border:2px dashed #4a90d9;border-radius:8px;padding:20px;">
    <p style="font-weight:bold;">otpauth URI テキスト（QR なし）</p>
    <p><code style="word-break:break-all;">${esc(OTPAUTH_URI)}</code></p>
  </div>
  <div style="height:150vh;background:repeating-linear-gradient(180deg,#f0f0f0 0px,#f0f0f0 40px,#f8f8f8 40px,#f8f8f8 80px);"></div>
  <script>
    (function() {
      var indicator = document.getElementById('scroll-indicator-u');
      var area = document.getElementById('content-area-u');
      function update() {
        var rect = area.getBoundingClientRect();
        var vh = window.innerHeight;
        if (rect.bottom < 0) {
          indicator.textContent = 'テキスト: 画面外（上方）';
          indicator.style.background = 'rgba(200,0,0,0.75)';
        } else if (rect.top > vh) {
          indicator.textContent = 'テキスト: 画面外（下方）';
          indicator.style.background = 'rgba(200,0,0,0.75)';
        } else if (rect.top >= 0 && rect.bottom <= vh) {
          indicator.textContent = 'テキスト: 完全に表示中 ✓';
          indicator.style.background = 'rgba(0,150,0,0.75)';
        } else {
          indicator.textContent = 'テキスト: 一部表示中';
          indicator.style.background = 'rgba(200,150,0,0.85)';
        }
      }
      window.addEventListener('scroll', update, { passive: true });
      update();
    })();
  <\/script>
</fieldset>`,
  },
];
