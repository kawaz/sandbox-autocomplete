import type { OtpVariant } from "../lib/types.ts";
import { OTPAUTH_URI, QR_SCRIPT } from "../lib/constants.ts";

// CSS 可視性変化テスト: ボタンクリックで QR を表示する各パターン
// 全て alt="QR Code" を使用（検出に必要なキーワード）
// スクロール不要な画面で、動的に QR を表示して 1Password に検出させる方法の検証

function makeScript(id: string, extra?: string): string {
  return '<scr' + 'ipt>\n' +
    '(function() {\n' +
    '  var qr = qrcode(0, "M");\n' +
    '  qr.addData(' + JSON.stringify(OTPAUTH_URI) + ');\n' +
    '  qr.make();\n' +
    '  var svg = qr.createSvgTag(6, 0);\n' +
    '  var encoded = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));\n' +
    '  document.getElementById("' + id + '-qr").src = encoded;\n' +
    (extra || '') +
    '})();\n' +
    '</scr' + 'ipt>';
}

export const visibilityChangeVariants: OtpVariant[] = [
  {
    id: "vis-1",
    title: "VIS1: display:none → display:block",
    description: "初期 display:none、ボタンで display:block に変更。",
    render: () => {
      const toggle = '<scr' + 'ipt>\n' +
        'document.getElementById("vis-1-btn").addEventListener("click", function() {\n' +
        '  document.getElementById("vis-1-qr").style.display = "block";\n' +
        '  this.disabled = true; this.textContent = "表示済み";\n' +
        '});\n' +
        '</scr' + 'ipt>';
      return `
<fieldset>
  <legend>display:none → display:block</legend>
  <button type="button" id="vis-1-btn" style="padding:8px 20px;font-size:1rem;cursor:pointer;">QR を表示</button>
  <div style="text-align:center;padding:16px;">
    <img id="vis-1-qr" style="max-width:200px;display:none;" alt="QR Code">
  </div>
  ${QR_SCRIPT}
  ${makeScript("vis-1")}
  ${toggle}
</fieldset>`;
    },
  },
  {
    id: "vis-2",
    title: "VIS2: visibility:hidden → visibility:visible",
    description: "初期 visibility:hidden、ボタンで visibility:visible に変更。",
    render: () => {
      const toggle = '<scr' + 'ipt>\n' +
        'document.getElementById("vis-2-btn").addEventListener("click", function() {\n' +
        '  document.getElementById("vis-2-qr").style.visibility = "visible";\n' +
        '  this.disabled = true; this.textContent = "表示済み";\n' +
        '});\n' +
        '</scr' + 'ipt>';
      return `
<fieldset>
  <legend>visibility:hidden → visibility:visible</legend>
  <button type="button" id="vis-2-btn" style="padding:8px 20px;font-size:1rem;cursor:pointer;">QR を表示</button>
  <div style="text-align:center;padding:16px;">
    <img id="vis-2-qr" style="max-width:200px;visibility:hidden;" alt="QR Code">
  </div>
  ${QR_SCRIPT}
  ${makeScript("vis-2")}
  ${toggle}
</fieldset>`;
    },
  },
  {
    id: "vis-3",
    title: "VIS3: opacity:0 → opacity:1",
    description: "初期 opacity:0、ボタンで opacity:1 に変更。",
    render: () => {
      const toggle = '<scr' + 'ipt>\n' +
        'document.getElementById("vis-3-btn").addEventListener("click", function() {\n' +
        '  document.getElementById("vis-3-qr").style.opacity = "1";\n' +
        '  this.disabled = true; this.textContent = "表示済み";\n' +
        '});\n' +
        '</scr' + 'ipt>';
      return `
<fieldset>
  <legend>opacity:0 → opacity:1</legend>
  <button type="button" id="vis-3-btn" style="padding:8px 20px;font-size:1rem;cursor:pointer;">QR を表示</button>
  <div style="text-align:center;padding:16px;">
    <img id="vis-3-qr" style="max-width:200px;opacity:0;" alt="QR Code">
  </div>
  ${QR_SCRIPT}
  ${makeScript("vis-3")}
  ${toggle}
</fieldset>`;
    },
  },
  {
    id: "vis-4",
    title: "VIS4: off-screen → on-screen (position)",
    description: "初期 position:absolute;left:-9999px、ボタンで position:static に変更。",
    render: () => {
      const toggle = '<scr' + 'ipt>\n' +
        'document.getElementById("vis-4-btn").addEventListener("click", function() {\n' +
        '  var img = document.getElementById("vis-4-qr");\n' +
        '  img.style.position = "static";\n' +
        '  img.style.left = "";\n' +
        '  this.disabled = true; this.textContent = "表示済み";\n' +
        '});\n' +
        '</scr' + 'ipt>';
      return `
<fieldset>
  <legend>off-screen → on-screen</legend>
  <button type="button" id="vis-4-btn" style="padding:8px 20px;font-size:1rem;cursor:pointer;">QR を表示</button>
  <div style="text-align:center;padding:16px;">
    <img id="vis-4-qr" style="max-width:200px;position:absolute;left:-9999px;" alt="QR Code">
  </div>
  ${QR_SCRIPT}
  ${makeScript("vis-4")}
  ${toggle}
</fieldset>`;
    },
  },
  {
    id: "vis-5",
    title: "VIS5: createElement + appendChild（ベースライン）",
    description: "ボタンクリックで createElement('img') + src 設定 + appendChild。T3 と同じだが alt='QR Code' を使用。",
    render: () => {
      const toggle = '<scr' + 'ipt>\n' +
        'document.getElementById("vis-5-btn").addEventListener("click", function() {\n' +
        '  var qr = qrcode(0, "M");\n' +
        '  qr.addData(' + JSON.stringify(OTPAUTH_URI) + ');\n' +
        '  qr.make();\n' +
        '  var svg = qr.createSvgTag(6, 0);\n' +
        '  var encoded = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));\n' +
        '  var img = document.createElement("img");\n' +
        '  img.src = encoded;\n' +
        '  img.alt = "QR Code";\n' +
        '  img.style.maxWidth = "200px";\n' +
        '  document.getElementById("vis-5-container").appendChild(img);\n' +
        '  this.disabled = true; this.textContent = "追加済み";\n' +
        '});\n' +
        '</scr' + 'ipt>';
      return `
<fieldset>
  <legend>createElement + appendChild</legend>
  <button type="button" id="vis-5-btn" style="padding:8px 20px;font-size:1rem;cursor:pointer;">QR を追加</button>
  <div id="vis-5-container" style="text-align:center;padding:16px;"></div>
  ${QR_SCRIPT}
  ${toggle}
</fieldset>`;
    },
  },
  {
    id: "vis-6",
    title: "VIS6: 親要素の display:none → display:block",
    description: "img 自体は visible だが、親 div が display:none。ボタンで親を display:block に。",
    render: () => {
      const toggle = '<scr' + 'ipt>\n' +
        'document.getElementById("vis-6-btn").addEventListener("click", function() {\n' +
        '  document.getElementById("vis-6-wrapper").style.display = "block";\n' +
        '  this.disabled = true; this.textContent = "表示済み";\n' +
        '});\n' +
        '</scr' + 'ipt>';
      return `
<fieldset>
  <legend>親要素の display:none → display:block</legend>
  <button type="button" id="vis-6-btn" style="padding:8px 20px;font-size:1rem;cursor:pointer;">QR を表示</button>
  <div id="vis-6-wrapper" style="display:none;text-align:center;padding:16px;">
    <img id="vis-6-qr" style="max-width:200px;" alt="QR Code">
  </div>
  ${QR_SCRIPT}
  ${makeScript("vis-6")}
  ${toggle}
</fieldset>`;
    },
  },
  {
    id: "vis-7",
    title: "VIS7: DOM 除去 → 再追加",
    description: "ページロード時に img を DOM から remove。ボタンで appendChild で再追加。",
    render: () => {
      const script = '<scr' + 'ipt>\n' +
        '(function() {\n' +
        '  var qr = qrcode(0, "M");\n' +
        '  qr.addData(' + JSON.stringify(OTPAUTH_URI) + ');\n' +
        '  qr.make();\n' +
        '  var svg = qr.createSvgTag(6, 0);\n' +
        '  var encoded = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));\n' +
        '  var img = document.getElementById("vis-7-qr");\n' +
        '  img.src = encoded;\n' +
        '  var container = document.getElementById("vis-7-container");\n' +
        '  var removed = container.removeChild(img);\n' +
        '  document.getElementById("vis-7-btn").addEventListener("click", function() {\n' +
        '    container.appendChild(removed);\n' +
        '    this.disabled = true; this.textContent = "再追加済み";\n' +
        '  });\n' +
        '})();\n' +
        '</scr' + 'ipt>';
      return `
<fieldset>
  <legend>DOM 除去 → 再追加</legend>
  <button type="button" id="vis-7-btn" style="padding:8px 20px;font-size:1rem;cursor:pointer;">QR を再追加</button>
  <div id="vis-7-container" style="text-align:center;padding:16px;">
    <img id="vis-7-qr" style="max-width:200px;" alt="QR Code">
  </div>
  ${QR_SCRIPT}
  ${script}
</fieldset>`;
    },
  },
  {
    id: "vis-8",
    title: "VIS8: height:0;overflow:hidden → height:auto",
    description: "初期 height:0;overflow:hidden で視覚的に隠す。ボタンで height:auto に。IntersectionObserver の検出を騙せるか。",
    render: () => {
      const toggle = '<scr' + 'ipt>\n' +
        'document.getElementById("vis-8-btn").addEventListener("click", function() {\n' +
        '  var wrapper = document.getElementById("vis-8-wrapper");\n' +
        '  wrapper.style.height = "auto";\n' +
        '  wrapper.style.overflow = "visible";\n' +
        '  this.disabled = true; this.textContent = "表示済み";\n' +
        '});\n' +
        '</scr' + 'ipt>';
      return `
<fieldset>
  <legend>height:0;overflow:hidden → height:auto</legend>
  <button type="button" id="vis-8-btn" style="padding:8px 20px;font-size:1rem;cursor:pointer;">QR を表示</button>
  <div id="vis-8-wrapper" style="height:0;overflow:hidden;text-align:center;padding:0 16px;">
    <img id="vis-8-qr" style="max-width:200px;" alt="QR Code">
  </div>
  ${QR_SCRIPT}
  ${makeScript("vis-8")}
  ${toggle}
</fieldset>`;
    },
  },
  {
    id: "vis-9",
    title: "VIS9: transform:scale(0) → transform:scale(1)",
    description: "初期 transform:scale(0) で視覚的に消す。ボタンで scale(1) に。",
    render: () => {
      const toggle = '<scr' + 'ipt>\n' +
        'document.getElementById("vis-9-btn").addEventListener("click", function() {\n' +
        '  document.getElementById("vis-9-qr").style.transform = "scale(1)";\n' +
        '  this.disabled = true; this.textContent = "表示済み";\n' +
        '});\n' +
        '</scr' + 'ipt>';
      return `
<fieldset>
  <legend>transform:scale(0) → scale(1)</legend>
  <button type="button" id="vis-9-btn" style="padding:8px 20px;font-size:1rem;cursor:pointer;">QR を表示</button>
  <div style="text-align:center;padding:16px;">
    <img id="vis-9-qr" style="max-width:200px;transform:scale(0);" alt="QR Code">
  </div>
  ${QR_SCRIPT}
  ${makeScript("vis-9")}
  ${toggle}
</fieldset>`;
    },
  },
  {
    id: "vis-10",
    title: "VIS10: clip-path:inset(100%) → clip-path:none",
    description: "初期 clip-path:inset(100%) で完全クリップ。ボタンで clip-path:none に。",
    render: () => {
      const toggle = '<scr' + 'ipt>\n' +
        'document.getElementById("vis-10-btn").addEventListener("click", function() {\n' +
        '  document.getElementById("vis-10-qr").style.clipPath = "none";\n' +
        '  this.disabled = true; this.textContent = "表示済み";\n' +
        '});\n' +
        '</scr' + 'ipt>';
      return `
<fieldset>
  <legend>clip-path:inset(100%) → none</legend>
  <button type="button" id="vis-10-btn" style="padding:8px 20px;font-size:1rem;cursor:pointer;">QR を表示</button>
  <div style="text-align:center;padding:16px;">
    <img id="vis-10-qr" style="max-width:200px;clip-path:inset(100%);" alt="QR Code">
  </div>
  ${QR_SCRIPT}
  ${makeScript("vis-10")}
  ${toggle}
</fieldset>`;
    },
  },
  {
    id: "vis-11",
    title: "VIS11: 固定サイズ親 div 内で display:none → block",
    description: "親 div が固定サイズ (width:300px;height:300px) でスペース確保済み。その中で img が display:none → block に。親のレイアウトは変化しない。",
    render: () => {
      const toggle = '<scr' + 'ipt>\n' +
        'document.getElementById("vis-11-btn").addEventListener("click", function() {\n' +
        '  document.getElementById("vis-11-qr").style.display = "block";\n' +
        '  this.disabled = true; this.textContent = "表示済み";\n' +
        '});\n' +
        '</scr' + 'ipt>';
      return `
<fieldset>
  <legend>固定サイズ親 div 内で display:none → block</legend>
  <p class="note">親 div は 300x300px 固定。img の display 変化で親のサイズは変わらない。</p>
  <button type="button" id="vis-11-btn" style="padding:8px 20px;font-size:1rem;cursor:pointer;">QR を表示</button>
  <div style="width:300px;height:300px;border:2px dashed #4a90d9;border-radius:8px;margin:12px auto;display:flex;align-items:center;justify-content:center;">
    <img id="vis-11-qr" style="max-width:200px;display:none;" alt="QR Code">
  </div>
  ${QR_SCRIPT}
  ${makeScript("vis-11")}
  ${toggle}
</fieldset>`;
    },
  },
  {
    id: "vis-12",
    title: "VIS12: 固定サイズ親 + visibility:hidden → visible",
    description: "VIS2 の再テスト。親 div が固定サイズの中で visibility:hidden → visible。VIS2 との違いは親のサイズ固定のみ。",
    render: () => {
      const toggle = '<scr' + 'ipt>\n' +
        'document.getElementById("vis-12-btn").addEventListener("click", function() {\n' +
        '  document.getElementById("vis-12-qr").style.visibility = "visible";\n' +
        '  this.disabled = true; this.textContent = "表示済み";\n' +
        '});\n' +
        '</scr' + 'ipt>';
      return `
<fieldset>
  <legend>固定サイズ親 + visibility:hidden → visible</legend>
  <p class="note">VIS2 の再確認。親 div は 300x300px 固定。</p>
  <button type="button" id="vis-12-btn" style="padding:8px 20px;font-size:1rem;cursor:pointer;">QR を表示</button>
  <div style="width:300px;height:300px;border:2px dashed #4a90d9;border-radius:8px;margin:12px auto;display:flex;align-items:center;justify-content:center;">
    <img id="vis-12-qr" style="max-width:200px;visibility:hidden;" alt="QR Code">
  </div>
  ${QR_SCRIPT}
  ${makeScript("vis-12")}
  ${toggle}
</fieldset>`;
    },
  },
  {
    id: "vis-13",
    title: "VIS13: 固定サイズ親 + opacity:0 → 1",
    description: "VIS3 の再テスト。親 div が固定サイズの中で opacity:0 → 1。",
    render: () => {
      const toggle = '<scr' + 'ipt>\n' +
        'document.getElementById("vis-13-btn").addEventListener("click", function() {\n' +
        '  document.getElementById("vis-13-qr").style.opacity = "1";\n' +
        '  this.disabled = true; this.textContent = "表示済み";\n' +
        '});\n' +
        '</scr' + 'ipt>';
      return `
<fieldset>
  <legend>固定サイズ親 + opacity:0 → 1</legend>
  <p class="note">VIS3 の再確認。親 div は 300x300px 固定。</p>
  <button type="button" id="vis-13-btn" style="padding:8px 20px;font-size:1rem;cursor:pointer;">QR を表示</button>
  <div style="width:300px;height:300px;border:2px dashed #4a90d9;border-radius:8px;margin:12px auto;display:flex;align-items:center;justify-content:center;">
    <img id="vis-13-qr" style="max-width:200px;opacity:0;" alt="QR Code">
  </div>
  ${QR_SCRIPT}
  ${makeScript("vis-13")}
  ${toggle}
</fieldset>`;
    },
  },
  // ---------- スケールテスト ----------
  {
    id: "vis-14",
    title: "VIS14: transform:scale(0.1) で縮小表示",
    description: "img を transform:scale(0.1) で極小表示。レイアウト上のサイズは元のまま（200px）だが視覚的に小さい。QR がデコード可能な閾値の検証。",
    render: () => `
<fieldset>
  <legend>transform:scale(0.1) で縮小</legend>
  <p class="note">視覚的には極小だがレイアウト上は 200px のまま。</p>
  <div style="text-align:center;padding:16px;">
    <img id="vis-14-qr" style="max-width:200px;transform:scale(0.1);" alt="QR Code">
  </div>
  ${QR_SCRIPT}
  ${makeScript("vis-14")}
</fieldset>`,
  },
  {
    id: "vis-15",
    title: "VIS15: CSS width/height で 20x20px に縮小",
    description: "img を width:20px;height:20px に。レイアウト上も視覚的にも小さい。viewport には収まる。",
    render: () => `
<fieldset>
  <legend>width:20px;height:20px</legend>
  <p class="note">レイアウト上も 20x20px。viewport に完全に収まる。</p>
  <div style="text-align:center;padding:16px;">
    <img id="vis-15-qr" style="width:20px;height:20px;" alt="QR Code">
  </div>
  ${QR_SCRIPT}
  ${makeScript("vis-15")}
</fieldset>`,
  },
  {
    id: "vis-16",
    title: "VIS16: CSS width/height で 1x1px",
    description: "img を 1x1px に。事実上見えない。IntersectionObserver 的には viewport 内。",
    render: () => `
<fieldset>
  <legend>width:1px;height:1px</legend>
  <p class="note">1x1px。viewport 内だが事実上不可視。</p>
  <div style="text-align:center;padding:16px;">
    <img id="vis-16-qr" style="width:1px;height:1px;" alt="QR Code">
  </div>
  ${QR_SCRIPT}
  ${makeScript("vis-16")}
</fieldset>`,
  },
  {
    id: "vis-17",
    title: "VIS17: object-fit:contain + 小コンテナ (50x50px)",
    description: "50x50px のコンテナに object-fit:contain で QR を収める。viewport が小さくても QR 全体が映る実用パターン。",
    render: () => `
<fieldset>
  <legend>50x50px + object-fit:contain</legend>
  <p class="note">50x50px コンテナに object-fit:contain。QR 全体が小さく表示される。</p>
  <div style="text-align:center;padding:16px;">
    <img id="vis-17-qr" style="width:50px;height:50px;object-fit:contain;" alt="QR Code">
  </div>
  ${QR_SCRIPT}
  ${makeScript("vis-17")}
</fieldset>`,
  },
  {
    id: "vis-18",
    title: "VIS18: max-width:100%;max-height:100vh で viewport に収める",
    description: "max-width:100% と max-height:100vh で viewport に必ず収まるようにする。どんな画面サイズでも QR 全体が表示される実用パターン。",
    render: () => `
<fieldset>
  <legend>max-width:100%;max-height:100vh</legend>
  <p class="note">viewport に必ず収まるスタイル。</p>
  <div style="text-align:center;padding:16px;">
    <img id="vis-18-qr" style="max-width:100%;max-height:100vh;" alt="QR Code">
  </div>
  ${QR_SCRIPT}
  ${makeScript("vis-18")}
</fieldset>`,
  },
  // ---------- ドットサイズ閾値テスト ----------
  // QR は 45x45 モジュール。cellSize を変えてレンダリングサイズを調整
  ...([1, 2, 3, 4, 5, 6].map((cellSize): OtpVariant => {
    const px = 45 * cellSize;
    const id = "vis-dot-" + cellSize;
    const script = '<scr' + 'ipt>\n' +
      '(function() {\n' +
      '  var qr = qrcode(0, "L");\n' +
      '  qr.addData(' + JSON.stringify(OTPAUTH_URI) + ');\n' +
      '  qr.make();\n' +
      '  var svg = qr.createSvgTag(' + cellSize + ', 0);\n' +
      '  document.getElementById("' + id + '-qr").src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));\n' +
      '})();\n' +
      '</scr' + 'ipt>';
    return {
      id,
      title: "DOT" + cellSize + ": " + cellSize + "px/dot (" + px + "x" + px + "px)",
      description: "QR 45x45 モジュール、1ドット=" + cellSize + "px → 画像 " + px + "x" + px + "px",
      render: () => `
<fieldset>
  <legend>${cellSize}px/dot (${px}x${px}px)</legend>
  <p class="note">QR: 45x45 モジュール、cellSize=${cellSize} → ${px}x${px}px</p>
  <div style="text-align:center;padding:16px;">
    <img id="${id}-qr" style="width:${px}px;height:${px}px;" alt="QR Code">
  </div>
  ${QR_SCRIPT}
  ${script}
</fieldset>`,
    };
  })),
];
