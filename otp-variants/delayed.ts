import type { OtpVariant } from "../lib/types.ts";
import { OTPAUTH_URI, QR_SCRIPT } from "../lib/constants.ts";

export const delayedVariants: OtpVariant[] = [
  {
    id: "t2-img-exists-src-delayed",
    title: "T2: <img> タグ先在 + src を後から設定",
    description: "ページロード時に空の <img> タグが存在。ボタンクリックで src に data URI を設定。img タグの存在タイミングが IntersectionObserver のターゲット登録に影響するかのテスト。",
    render: () => `
<fieldset>
  <legend>&lt;img&gt; 先在 + src 後設定</legend>
  <p>空の <code>&lt;img&gt;</code> がページロード時から存在。ボタンで <code>src</code> を設定します。</p>
  <button type="button" id="t2-btn" style="padding:8px 20px;font-size:1rem;cursor:pointer;">QR の src を設定</button>
  <div style="text-align:center;padding:16px;border:2px dashed #ccc;border-radius:8px;margin-top:12px;">
    <img id="t2-qr" style="max-width:200px;" alt="QR Code (src未設定)">
    <p class="note" id="t2-status">src: (未設定)</p>
  </div>
  ${QR_SCRIPT}
  <script>
    document.getElementById('t2-btn').addEventListener('click', function() {
      var qr = qrcode(0, 'M');
      qr.addData(${JSON.stringify(OTPAUTH_URI)});
      qr.make();
      var svg = qr.createSvgTag(6, 0);
      var encoded = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
      document.getElementById('t2-qr').src = encoded;
      document.getElementById('t2-status').textContent = 'src: data URI 設定済み';
      this.disabled = true;
      this.textContent = '設定済み';
    });
  <\/script>
</fieldset>`,
  },
  {
    id: "t3-img-created-appended",
    title: "T3: <img> タグを JS で createElement + appendChild",
    description: "ページロード時に <img> なし。ボタンで createElement('img') → src 設定 → appendChild。innerHTML ではなく DOM API で追加。",
    render: () => {
      const clearContainer = "container.innerHTML";
      return `
<fieldset>
  <legend>&lt;img&gt; を createElement + appendChild</legend>
  <p>ボタンクリックで <code>createElement('img')</code> → <code>src</code> 設定 → <code>appendChild</code>。</p>
  <button type="button" id="t3-btn" style="padding:8px 20px;font-size:1rem;cursor:pointer;">img 要素を作成して追加</button>
  <div id="t3-container" style="text-align:center;padding:16px;border:2px dashed #ccc;border-radius:8px;margin-top:12px;">
    <p class="note">img 要素はまだ存在しません</p>
  </div>
  ${QR_SCRIPT}
  <script>
    document.getElementById('t3-btn').addEventListener('click', function() {
      var qr = qrcode(0, 'M');
      qr.addData(${JSON.stringify(OTPAUTH_URI)});
      qr.make();
      var svg = qr.createSvgTag(6, 0);
      var encoded = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
      var container = document.getElementById('t3-container');
      ${clearContainer} = '';
      var img = document.createElement('img');
      img.src = encoded;
      img.style.maxWidth = '200px';
      img.alt = 'QR Code';
      container.appendChild(img);
      this.disabled = true;
      this.textContent = '追加済み';
    });
  <\/script>
</fieldset>`;
    },
  },
  {
    id: "t4-delayed-with-scroll",
    title: "T4: <img> 先在 + src 後設定 + スクロール",
    description: "T2 + スクロール。空の <img> がスクロール先に存在。ボタンで src 設定 → スクロールして viewport に入れる。",
    render: () => `
<fieldset>
  <legend>&lt;img&gt; 先在 + src 後設定 + スクロール</legend>
  <p>1. ボタンで src を設定<br>2. スクロールして viewport に入れる</p>
  <button type="button" id="t4-btn" style="padding:8px 20px;font-size:1rem;cursor:pointer;">QR の src を設定（画面外）</button>
  <div style="position:fixed;top:10px;right:10px;background:rgba(0,0,0,0.75);color:#fff;padding:8px 12px;border-radius:6px;font-size:0.8rem;z-index:9999;" id="scroll-indicator-t4">
    QR: src 未設定
  </div>
  <div style="height:150vh;background:repeating-linear-gradient(180deg,#f8f8f8 0px,#f8f8f8 40px,#f0f0f0 40px,#f0f0f0 80px);display:flex;align-items:center;justify-content:center;">
    <span style="color:#aaa;font-size:1.2rem;">↓ src 設定後にスクロール ↓</span>
  </div>
  <div id="t4-area" style="border:2px dashed #ccc;border-radius:8px;padding:20px;text-align:center;">
    <img id="t4-qr" style="max-width:200px;" alt="QR Code (src未設定)">
    <p class="note" id="t4-status">src: (未設定)</p>
  </div>
  <div style="height:150vh;background:repeating-linear-gradient(180deg,#f0f0f0 0px,#f0f0f0 40px,#f8f8f8 40px,#f8f8f8 80px);"></div>
  ${QR_SCRIPT}
  <script>
    (function() {
      var srcSet = false;
      document.getElementById('t4-btn').addEventListener('click', function() {
        var qr = qrcode(0, 'M');
        qr.addData(${JSON.stringify(OTPAUTH_URI)});
        qr.make();
        var svg = qr.createSvgTag(6, 0);
        var encoded = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
        document.getElementById('t4-qr').src = encoded;
        document.getElementById('t4-status').textContent = 'src: data URI 設定済み';
        document.getElementById('t4-area').style.borderColor = '#4a90d9';
        this.disabled = true;
        this.textContent = '設定済み — スクロールして確認';
        srcSet = true;
        update();
      });

      var indicator = document.getElementById('scroll-indicator-t4');
      var area = document.getElementById('t4-area');
      function update() {
        if (!srcSet) { indicator.textContent = 'QR: src 未設定'; indicator.style.background = 'rgba(100,100,100,0.75)'; return; }
        var rect = area.getBoundingClientRect();
        var vh = window.innerHeight;
        if (rect.bottom < 0) {
          indicator.textContent = 'QR: 画面外（上方）';
          indicator.style.background = 'rgba(200,0,0,0.75)';
        } else if (rect.top > vh) {
          indicator.textContent = 'QR: 画面外（下方）';
          indicator.style.background = 'rgba(200,0,0,0.75)';
        } else if (rect.top >= 0 && rect.bottom <= vh) {
          indicator.textContent = 'QR: 完全に表示中 ✓';
          indicator.style.background = 'rgba(0,150,0,0.75)';
        } else {
          indicator.textContent = 'QR: 一部表示中';
          indicator.style.background = 'rgba(200,150,0,0.85)';
        }
      }
      window.addEventListener('scroll', update, { passive: true });
    })();
  <\/script>
</fieldset>`,
  },
  {
    id: "t5-settimeout-src",
    title: "T5: setTimeout で src を自動設定（3秒後）",
    description: "ページロード3秒後に自動で <img> の src を data URI に設定。ユーザー操作なしで遅延設定された場合にも反応するか。",
    render: () => `
<fieldset>
  <legend>setTimeout(3秒) で src 自動設定</legend>
  <p>ページロード3秒後に自動で <code>src</code> が設定されます。</p>
  <div style="text-align:center;padding:16px;border:2px dashed #ccc;border-radius:8px;">
    <img id="t5-qr" style="max-width:200px;" alt="QR Code">
    <p class="note" id="t5-status">⏳ 3秒後に src 設定...</p>
  </div>
  ${QR_SCRIPT}
  <script>
    setTimeout(function() {
      var qr = qrcode(0, 'M');
      qr.addData(${JSON.stringify(OTPAUTH_URI)});
      qr.make();
      var svg = qr.createSvgTag(6, 0);
      var encoded = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
      document.getElementById('t5-qr').src = encoded;
      document.getElementById('t5-status').textContent = 'src: data URI 設定済み ✓';
    }, 3000);
  <\/script>
</fieldset>`,
  },
];
