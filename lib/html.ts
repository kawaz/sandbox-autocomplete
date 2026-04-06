import { CSS } from "./css.ts";
import type { Field, Category, OtpVariant } from "./types.ts";

export function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function fieldCount(cat: Category): number {
  if (cat.keywordDemo) return 2; // on / off
  return cat.fields.length;
}

export function renderIndex(categories: Category[], otpVariants: OtpVariant[]): string {
  const items = categories.map((cat) => {
    const count = fieldCount(cat);
    return `      <li><a href="/${esc(cat.id)}">${esc(cat.title)}<span class="field-count">(${count} fields)</span></a></li>`;
  }).join("\n");

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>autocomplete 属性テストページ</title>
  <style>${CSS}</style>
</head>
<body>

<h1>autocomplete 属性テストページ</h1>
<p class="intro">
  HTML の <code>autocomplete</code> 属性で指定できる全トークンを網羅したフォームです。<br>
  1Password などのパスワードマネージャーや、ブラウザの自動補完が各フィールドを正しく認識するか確認できます。<br>
  カテゴリごとに独立したページに分かれています。
</p>

<ul class="category-list">
${items}
</ul>

<h2 style="margin-top:2rem;">特殊テスト</h2>
<ul class="category-list">
  <li><a href="/otp-trigger-test">OTP トリガー切り分けテスト<span class="field-count">(${otpVariants.length} variants)</span></a></li>
</ul>

</body>
</html>`;
}

export function renderField(field: Field, index: number): string {
  const nameAttr = `${field.autocomplete.replace(/ /g, "-")}-${index}`;
  const extras: string[] = [];
  if (field.inputmode) extras.push(`inputmode="${esc(field.inputmode)}"`);
  if (field.maxlength) extras.push(`maxlength="${esc(field.maxlength)}"`);
  if (field.placeholder) extras.push(`placeholder="${esc(field.placeholder)}"`);

  let input: string;
  if (field.rawHtml) {
    input = field.rawHtml;
  } else if (field.tag === "textarea") {
    input = `<textarea name="${esc(nameAttr)}" autocomplete="${esc(field.autocomplete)}" ${extras.join(" ")}></textarea>`;
  } else if (field.tag === "select") {
    const opts = (field.options || []).map(o =>
      `<option value="${esc(o)}">${esc(o)}</option>`
    ).join("");
    input = `<select name="${esc(nameAttr)}" autocomplete="${esc(field.autocomplete)}" ${extras.join(" ")}><option value="">--</option>${opts}</select>`;
  } else {
    input = `<input type="${esc(field.type)}" name="${esc(nameAttr)}" autocomplete="${esc(field.autocomplete)}" ${extras.join(" ")}>`;
  }

  let noteHtml = "";
  if (field.note) {
    noteHtml = `\n      <p class="note">${esc(field.note)}</p>`;
  }

  return `    <div class="field">
      <label><code>${esc(field.autocomplete)}</code></label>
      ${input}${noteHtml}
    </div>`;
}

export function renderPage(cat: Category, index: number, categories: Category[]): string {
  const prev = index > 0 ? categories[index - 1] : null;
  const next = index < categories.length - 1 ? categories[index + 1] : null;

  const navParts: string[] = [];
  if (prev) {
    navParts.push(`<a href="/${esc(prev.id)}">&larr; 前</a>`);
  } else {
    navParts.push("<span></span>");
  }
  navParts.push('<a href="/">&uarr; 一覧</a>');
  if (next) {
    navParts.push(`<a href="/${esc(next.id)}">次 &rarr;</a>`);
  } else {
    navParts.push("<span></span>");
  }

  const nav = `<nav class="page-nav">\n    ${navParts.join("\n    ")}\n  </nav>`;

  let body: string;

  if (cat.keywordDemo) {
    // keywords: 2つの独立フォームを横並び
    body = `
  <div class="keyword-demo">
    <form action="/${esc(cat.id)}" method="post">
      <fieldset>
        <legend>autocomplete="on"</legend>
        <div class="field">
          <label><code>on</code> &mdash; フォーム全体に autocomplete="on"</label>
          <input type="text" name="demo-on" autocomplete="on" placeholder="ブラウザの自動補完が有効">
        </div>
        <div class="submit-row">
          <button type="submit">送信 (Submit)</button>
        </div>
      </fieldset>
    </form>
    <form action="/${esc(cat.id)}" method="post" autocomplete="off">
      <fieldset>
        <legend>autocomplete="off"</legend>
        <div class="field">
          <label><code>off</code> &mdash; フォーム全体に autocomplete="off"</label>
          <input type="text" name="demo-off" autocomplete="off" placeholder="ブラウザの自動補完が無効">
        </div>
        <div class="submit-row">
          <button type="submit">送信 (Submit)</button>
        </div>
      </fieldset>
    </form>
  </div>`;
  } else {
    // 通常カテゴリ: 1フォーム
    const noteHtml = cat.note ? `\n    <p class="note">${cat.note}</p>` : "";

    const fieldsHtml = cat.fields.map((field, i) => {
      let html = renderField(field, i);
      if (cat.separatorAfter !== undefined && i === cat.separatorAfter) {
        html += '\n    <hr style="border:none; border-top:1px dashed #ccc; margin:16px 0;">';
      }
      return html;
    }).join("\n");

    const footerHtml = cat.footer ? `\n  ${cat.footer}` : "";

    body = `
  <form action="/${esc(cat.id)}" method="post">
    <fieldset>
      <legend>${esc(cat.title)}</legend>${noteHtml}
${fieldsHtml}
    </fieldset>
    <div class="submit-row">
      <button type="submit">送信 (Submit)</button>
    </div>
  </form>${footerHtml}`;
  }

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(cat.title)} - autocomplete 属性テスト</title>
  <style>${CSS}</style>
</head>
<body>

  <h1>${esc(cat.title)}</h1>
  ${cat.description ? `<p class="intro">${esc(cat.description)}</p>` : ""}
  ${nav}
${body}

  <br>
  ${nav}

</body>
</html>`;
}

export function renderOtpTriggerIndex(otpVariants: OtpVariant[]): string {
  const items = otpVariants.map((v) =>
    `      <li><a href="/otp-trigger-test/${esc(v.id)}">${esc(v.title)}</a><br><span class="note">${esc(v.description)}</span></li>`
  ).join("\n");

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OTP トリガー切り分けテスト</title>
  <style>${CSS}</style>
</head>
<body>

<h1>OTP トリガー切り分けテスト</h1>
<p class="intro">
  1Password の OTP 登録ダイアログがどの要素に反応して表示されるかを切り分けるテストページ群です。<br>
  各バリアントを個別に開いて、ダイアログが表示されるか確認してください。
</p>
<p><a href="/">← autocomplete テスト一覧に戻る</a></p>

<ul class="category-list">
${items}
</ul>

</body>
</html>`;
}

export function renderOtpTriggerVariant(variantId: string, otpVariants: OtpVariant[]): string | null {
  const variant = otpVariants.find((v) => v.id === variantId);
  if (!variant) return null;

  const idx = otpVariants.indexOf(variant);
  const prev = idx > 0 ? otpVariants[idx - 1] : null;
  const next = idx < otpVariants.length - 1 ? otpVariants[idx + 1] : null;

  const navParts: string[] = [];
  if (prev) navParts.push(`<a href="/otp-trigger-test/${esc(prev.id)}">&larr; 前</a>`);
  else navParts.push("<span></span>");
  navParts.push('<a href="/otp-trigger-test">&uarr; 一覧</a>');
  if (next) navParts.push(`<a href="/otp-trigger-test/${esc(next.id)}">次 &rarr;</a>`);
  else navParts.push("<span></span>");

  const nav = `<nav class="page-nav">${navParts.join(" ")}</nav>`;

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(variant.title)} - OTP トリガーテスト</title>
  <style>${CSS}</style>
</head>
<body>

  <h1>${esc(variant.title)}</h1>
  <p class="intro">${esc(variant.description)}</p>
  ${nav}

${variant.render()}

  <br>
  ${nav}

</body>
</html>`;
}
