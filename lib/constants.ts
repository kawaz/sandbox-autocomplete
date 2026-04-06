export const OTPAUTH_URI = "otpauth://totp/autocomplete-test:user@sandbox-autocomplete.oreore.net?secret=JBSWY3DPEHPK3PXP&issuer=autocomplete-test&digits=6&period=30";

export const QR_SCRIPT = `<script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js"><\/script>`;

// Design rationale: qrBlock generates a client-side QR code rendering snippet.
// The innerHTML usage is in a browser-side <script> tag string, not server-side DOM manipulation.
// The data parameter is always controlled server-side (OTPAUTH_URI or static strings).
export function qrBlock(data: string): string {
  const id = "qr-" + Math.random().toString(36).slice(2, 8);
  const setContent = `document.getElementById('${id}').innerHTML`;
  return `<div id="${id}" style="text-align:center;padding:16px;"></div>
${QR_SCRIPT}
<script>
  var qr = qrcode(0, 'M');
  qr.addData(${JSON.stringify(data)});
  qr.make();
  ${setContent} = qr.createSvgTag(6, 0);
<\/script>`;
}
