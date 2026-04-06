import type { OtpVariant } from "../lib/types.ts";
import { OTPAUTH_URI, QR_SCRIPT } from "../lib/constants.ts";

// alt 属性の境界値テスト: "QR Code" のどの部分が検出に必要か

function makeVariant(id: string, altValue: string, note?: string): OtpVariant {
  const desc = 'alt="' + altValue + '"' + (note ? " — " + note : "");
  const script = '<scr' + 'ipt>\n' +
    '    var qr = qrcode(0, "M");\n' +
    '    qr.addData(' + JSON.stringify(OTPAUTH_URI) + ');\n' +
    '    qr.make();\n' +
    '    var svg = qr.createSvgTag(6, 0);\n' +
    '    document.getElementById("' + id + '-qr").src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));\n' +
    '  </scr' + 'ipt>';
  return {
    id,
    title: id.toUpperCase() + ': alt="' + altValue + '"',
    description: desc,
    render: () => `
<fieldset>
  <legend>${desc}</legend>
  <div style="text-align:center;padding:16px;">
    <img id="${id}-qr" style="max-width:200px;" alt="${altValue}">
  </div>
  ${QR_SCRIPT}
  ${script}
</fieldset>`,
  };
}

export const altBoundaryVariants: OtpVariant[] = [
  // ベースライン
  makeVariant("alt-1", "QR Code", "ベースライン（反応するはず）"),
  makeVariant("alt-2", "QR", "最小（反応しないはず）"),
  // 大文字小文字
  makeVariant("alt-3", "qr code", "全小文字"),
  makeVariant("alt-4", "Qr Code", "先頭大文字"),
  makeVariant("alt-5", "QR CODE", "全大文字"),
  makeVariant("alt-6", "qrcode", "スペースなし小文字"),
  makeVariant("alt-7", "QRCode", "スペースなしパスカル"),
  // 部分一致
  makeVariant("alt-8", "QR Code for OTP setup", "QR Code + 追加テキスト"),
  makeVariant("alt-9", "Scan this QR Code", "QR Code が途中"),
  makeVariant("alt-10", "Code QR", "逆順"),
  // 他のキーワード
  makeVariant("alt-11", "QR code image", "code 小文字"),
  makeVariant("alt-12", "Two-factor authentication QR", "2FA 関連テキスト"),
  makeVariant("alt-13", "TOTP setup", "TOTP キーワード"),
  makeVariant("alt-14", "OTP QR", "OTP + QR"),
  makeVariant("alt-15", "Authenticator setup code", "Authenticator キーワード"),
  // alt なし
  {
    id: "alt-16",
    title: 'ALT-16: alt 属性なし',
    description: "alt 属性自体を省略",
    render: () => {
      const script = '<scr' + 'ipt>\n' +
        '    var qr = qrcode(0, "M");\n' +
        '    qr.addData(' + JSON.stringify(OTPAUTH_URI) + ');\n' +
        '    qr.make();\n' +
        '    var svg = qr.createSvgTag(6, 0);\n' +
        '    document.getElementById("alt-16-qr").src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));\n' +
        '  </scr' + 'ipt>';
      return `
<fieldset>
  <legend>alt 属性なし</legend>
  <div style="text-align:center;padding:16px;">
    <img id="alt-16-qr" style="max-width:200px;">
  </div>
  ${QR_SCRIPT}
  ${script}
</fieldset>`;
    },
  },
  makeVariant("alt-17", "", 'alt="" (空文字)'),
];
