import type { OtpVariant } from "../lib/types.ts";
import { OTPAUTH_URI, QR_SCRIPT } from "../lib/constants.ts";
import { esc } from "../lib/html.ts";

export function generateMatrixVariants(): OtpVariant[] {
  const srcTypes = [
    { key: "nosrc", label: "src なし", makeSrc: () => "" },
    { key: "datauri", label: "data URI", makeSrc: () => "DATA_URI" },
    { key: "url", label: "same-origin URL (/qr.svg)", makeSrc: () => "/qr.svg" },
    { key: "crossurl", label: "cross-origin URL", makeSrc: () => "https://qr-cdn.oreore.net:8443/qr.svg" },
  ];
  const cssTypes = [
    { key: "visible", label: "visible（通常表示）", style: "" },
    { key: "dnone", label: "display:none", style: "display:none;" },
    { key: "vhidden", label: "visibility:hidden", style: "visibility:hidden;" },
    { key: "opacity0", label: "opacity:0", style: "opacity:0;" },
    { key: "clip", label: "clip-path:inset(100%)", style: "clip-path:inset(100%);" },
    { key: "offscreen", label: "position:absolute; left:-9999px", style: "position:absolute;left:-9999px;" },
    { key: "tiny", label: "1x1px overflow:hidden", style: "width:1px;height:1px;overflow:hidden;" },
  ];
  const viewportTypes = [
    { key: "in", label: "viewport 内" },
    { key: "out", label: "viewport 外（スクロール必要）" },
  ];
  // 追加条件
  const extraTypes = [
    { key: "none", label: "なし", wrapper: (img: string) => img },
    { key: "canvas", label: "<canvas> に描画", wrapper: (img: string) => img + '\n    <canvas id="mx-canvas" width="200" height="200" style="border:1px solid #ccc;max-width:200px;"></canvas>\n    <p class="note">img の内容を canvas に描画した状態</p>' },
    { key: "picture", label: "<picture> で囲む", wrapper: (img: string) => "<picture>" + img + "</picture>" },
    { key: "shadow", label: "Shadow DOM 内", wrapper: (img: string) => '<div id="mx-shadow-host"></div>' },
  ];

  const variants: OtpVariant[] = [];
  let num = 0;

  // メインマトリクス: src × css × viewport（extra=none のみ、組み合わせ爆発を避ける）
  for (const src of srcTypes) {
    for (const css of cssTypes) {
      for (const vp of viewportTypes) {
        // skip: src なし + hidden 系 は冗長（visible でも反応しないので）
        if (src.key === "nosrc" && css.key !== "visible") continue;
        // skip: URL 系 + hidden 系 も冗長（visible でも反応しないことが判明済み）
        if ((src.key === "url" || src.key === "crossurl") && css.key !== "visible") continue;

        num++;
        const id = "mx-" + num + "-" + src.key + "-" + css.key + "-" + vp.key;
        const title = "MX" + num + ": " + src.label + " / " + css.label + " / " + vp.label;
        const desc = "img src=" + src.label + ", CSS=" + css.label + ", " + vp.label;

        variants.push({
          id,
          title,
          description: desc,
          render: () => {
            const imgStyle = "max-width:200px;" + css.style;
            let imgHtml: string;
            if (src.key === "nosrc") {
              imgHtml = '<img id="mx-img" style="' + esc(imgStyle) + '" alt="QR">';
            } else if (src.key === "datauri") {
              imgHtml = '<img id="mx-img" class="mx-data-uri" style="' + esc(imgStyle) + '" alt="QR">';
            } else {
              imgHtml = '<img id="mx-img" src="' + esc(src.makeSrc()) + '" style="' + esc(imgStyle) + '" alt="QR">';
            }

            const content = '<div style="text-align:center;padding:20px;border:2px dashed #4a90d9;border-radius:8px;">\n' +
              '    <p><strong>src:</strong> <code>' + esc(src.label) + '</code></p>\n' +
              '    <p><strong>CSS:</strong> <code>' + esc(css.label) + '</code></p>\n' +
              '    ' + imgHtml + '\n' +
              '  </div>';

            let body: string;
            if (vp.key === "out") {
              body = '<div style="height:200vh;background:repeating-linear-gradient(180deg,#f8f8f8 0px,#f8f8f8 40px,#f0f0f0 40px,#f0f0f0 80px);display:flex;align-items:center;justify-content:center;">' +
                '<span style="color:#aaa;font-size:1.2rem;">↓ スクロール ↓</span></div>\n' +
                content + '\n' +
                '<div style="height:100vh;"></div>';
            } else {
              body = content;
            }

            const script = src.key === "datauri"
              ? '\n' + QR_SCRIPT + '\n<script>\n' +
                '(function() {\n' +
                '  var qr = qrcode(0, "M");\n' +
                '  qr.addData(' + JSON.stringify(OTPAUTH_URI) + ');\n' +
                '  qr.make();\n' +
                '  var svg = qr.createSvgTag(6, 0);\n' +
                '  var encoded = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));\n' +
                '  var imgs = document.querySelectorAll(".mx-data-uri");\n' +
                '  for (var i = 0; i < imgs.length; i++) imgs[i].src = encoded;\n' +
                '})();\n' +
                '<\/script>'
              : '';

            return '<fieldset>\n  <legend>' + esc(title) + '</legend>\n' + body + '\n</fieldset>' + script;
          },
        });
      }
    }
  }

  // 追加条件バリアント（data URI + visible のみで追加条件を変える）
  for (const extra of extraTypes) {
    if (extra.key === "none") continue; // メインマトリクスでカバー済み

    num++;
    const id = "mx-" + num + "-datauri-" + extra.key;
    const title = "MX" + num + ": data URI / " + extra.label;
    const desc = "data URI img + " + extra.label;

    variants.push({
      id,
      title,
      description: desc,
      render: () => {
        const imgHtml = '<img id="mx-img" class="mx-data-uri" style="max-width:200px;" alt="QR">';
        let content: string;
        if (extra.key === "shadow") {
          content = '<div id="mx-shadow-host" style="text-align:center;padding:20px;border:2px dashed #4a90d9;border-radius:8px;"></div>';
        } else if (extra.key === "canvas") {
          content = '<div style="text-align:center;padding:20px;border:2px dashed #4a90d9;border-radius:8px;">\n' +
            '    ' + imgHtml + '\n' +
            '    <br><br>\n' +
            '    <canvas id="mx-canvas" width="300" height="300" style="border:1px solid #ccc;max-width:200px;"></canvas>\n' +
            '    <p class="note">上: img 要素 / 下: canvas に描画したコピー</p>\n' +
            '  </div>';
        } else {
          content = '<div style="text-align:center;padding:20px;border:2px dashed #4a90d9;border-radius:8px;">\n' +
            '    ' + extra.wrapper(imgHtml) + '\n' +
            '  </div>';
        }

        let script = '\n' + QR_SCRIPT + '\n<script>\n' +
          '(function() {\n' +
          '  var qr = qrcode(0, "M");\n' +
          '  qr.addData(' + JSON.stringify(OTPAUTH_URI) + ');\n' +
          '  qr.make();\n' +
          '  var svg = qr.createSvgTag(6, 0);\n' +
          '  var encoded = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));\n';

        if (extra.key === "shadow") {
          script += '  var host = document.getElementById("mx-shadow-host");\n' +
            '  var shadow = host.attachShadow({mode: "open"});\n' +
            '  var img = document.createElement("img");\n' +
            '  img.src = encoded;\n' +
            '  img.style.maxWidth = "200px";\n' +
            '  shadow.appendChild(img);\n';
        } else if (extra.key === "canvas") {
          script += '  var imgs = document.querySelectorAll(".mx-data-uri");\n' +
            '  for (var i = 0; i < imgs.length; i++) imgs[i].src = encoded;\n' +
            '  var img = new Image();\n' +
            '  img.onload = function() {\n' +
            '    var canvas = document.getElementById("mx-canvas");\n' +
            '    var ctx = canvas.getContext("2d");\n' +
            '    ctx.drawImage(img, 0, 0, 300, 300);\n' +
            '  };\n' +
            '  img.src = encoded;\n';
        } else {
          script += '  var imgs = document.querySelectorAll(".mx-data-uri");\n' +
            '  for (var i = 0; i < imgs.length; i++) imgs[i].src = encoded;\n';
        }

        script += '})();\n<\/script>';

        return '<fieldset>\n  <legend>' + esc(title) + '</legend>\n' +
          '  <p>' + esc(desc) + '</p>\n' +
          content + '\n</fieldset>' + script;
      },
    });
  }

  return variants;
}
