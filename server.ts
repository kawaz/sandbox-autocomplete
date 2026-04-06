// oreore.net から TLS 証明書を取得
const { cert, key } = await fetch("https://oreore.net/all.pem.json").then(r => r.json());

import { categories } from "./categories/index.ts";
import { otpVariants } from "./otp-variants/index.ts";
import { renderIndex, renderPage, renderOtpTriggerIndex, renderOtpTriggerVariant } from "./lib/html.ts";

// ---------- ルーティング ----------

const categoryMap = new Map(categories.map((cat, i) => [cat.id, { cat, index: i }]));

Bun.serve({
  port: 8443,
  tls: { cert, key },
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    // QR SVG 画像（静的ファイル配信 + CORS）
    if (path === "/qr.svg") {
      const svg = await Bun.file(import.meta.dir + "/qr.svg").text();
      return new Response(svg, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    // POST: どのパスでも受け付ける
    if (req.method === "POST") {
      return new Response("Form submitted! (This is a demo page)", {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    // GET /  → index
    if (path === "/" || path === "/index.html") {
      return new Response(renderIndex(categories, otpVariants), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // GET /:id → カテゴリページ
    const id = path.slice(1); // remove leading "/"
    const entry = categoryMap.get(id);
    if (entry) {
      return new Response(renderPage(entry.cat, entry.index, categories), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // ---------- OTP トリガー切り分けテスト ----------
    if (path === "/otp-trigger-test") {
      return new Response(renderOtpTriggerIndex(otpVariants), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }
    if (path.startsWith("/otp-trigger-test/")) {
      const variant = path.slice("/otp-trigger-test/".length);
      const html = renderOtpTriggerVariant(variant, otpVariants);
      if (html) {
        return new Response(html, {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }
    }

    return new Response("Not Found", { status: 404 });
  },
});

const hostname = "sandbox-autocomplete.oreore.net";
console.log(`Listening on https://${hostname}:8443`);
