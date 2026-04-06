import type { Category } from "../lib/types.ts";

// --- Helper: 結果表示用 HTML ---
const resultArea = (id: string) =>
  `<div id="${id}" style="margin-top:12px;padding:12px;border:1px solid #d0d0d0;border-radius:6px;background:#f8f8f8;min-height:40px;font-family:monospace;font-size:0.85rem;white-space:pre-wrap;word-break:break-all;color:#555;">結果がここに表示されます</div>`;

// --- Helper: credential 情報を整形する JS 関数 ---
const formatCredentialFn = `
function formatCredential(cred) {
  var buf2hex = function(buf) {
    return Array.from(new Uint8Array(buf)).map(function(b){ return b.toString(16).padStart(2,'0'); }).join('');
  };
  var buf2b64url = function(buf) {
    var str = '';
    var bytes = new Uint8Array(buf);
    for (var i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
    return btoa(str).replace(/\\+/g,'-').replace(/\\//g,'_').replace(/=/g,'');
  };
  var lines = [];
  lines.push('type: ' + cred.type);
  lines.push('id (base64url): ' + (cred.id || buf2b64url(cred.rawId)));
  lines.push('rawId (hex): ' + buf2hex(cred.rawId));
  if (cred.authenticatorAttachment) lines.push('authenticatorAttachment: ' + cred.authenticatorAttachment);
  if (cred.response) {
    lines.push('--- response ---');
    var resp = cred.response;
    if (resp.clientDataJSON) {
      try {
        var dec = new TextDecoder();
        var json = JSON.parse(dec.decode(resp.clientDataJSON));
        lines.push('clientDataJSON.type: ' + json.type);
        lines.push('clientDataJSON.origin: ' + json.origin);
        lines.push('clientDataJSON.challenge: ' + json.challenge);
      } catch(e) {
        lines.push('clientDataJSON: (parse error)');
      }
    }
    if (resp.attestationObject) lines.push('attestationObject (hex, first 64): ' + buf2hex(resp.attestationObject).substring(0, 64) + '...');
    if (resp.authenticatorData) lines.push('authenticatorData (hex, first 64): ' + buf2hex(resp.authenticatorData).substring(0, 64) + '...');
    if (resp.signature) lines.push('signature (hex): ' + buf2hex(resp.signature));
    if (resp.userHandle) lines.push('userHandle (hex): ' + buf2hex(resp.userHandle));
    if (resp.getTransports) {
      try { lines.push('transports: ' + JSON.stringify(resp.getTransports())); } catch(e) {}
    }
    if (resp.getPublicKey) {
      try {
        var pk = resp.getPublicKey();
        if (pk) lines.push('publicKey (hex, first 64): ' + buf2hex(pk).substring(0, 64) + '...');
      } catch(e) {}
    }
    if (resp.getPublicKeyAlgorithm) {
      try { lines.push('publicKeyAlgorithm: ' + resp.getPublicKeyAlgorithm()); } catch(e) {}
    }
  }
  return lines.join('\\n');
}
`;

// --- Helper: エラーメッセージ分類 ---
const classifyErrorFn = `
function classifyError(e) {
  if (e.name === 'NotAllowedError') return 'NotAllowedError: \\u30e6\\u30fc\\u30b6\\u30fc\\u304c\\u30ad\\u30e3\\u30f3\\u30bb\\u30eb\\u3057\\u305f\\u304b\\u3001\\u64cd\\u4f5c\\u304c\\u8a31\\u53ef\\u3055\\u308c\\u307e\\u305b\\u3093\\u3067\\u3057\\u305f\\u3002';
  if (e.name === 'SecurityError') return 'SecurityError: rpId \\u304c\\u73fe\\u5728\\u306e\\u30aa\\u30ea\\u30b8\\u30f3\\u3068\\u4e00\\u81f4\\u3057\\u307e\\u305b\\u3093\\u3002';
  if (e.name === 'InvalidStateError') return 'InvalidStateError: \\u65e2\\u306b\\u767b\\u9332\\u6e08\\u307f\\u306e\\u8a8d\\u8a3c\\u5668\\u3067\\u3059\\u3002';
  if (e.name === 'NotSupportedError') return 'NotSupportedError: \\u3053\\u306e\\u30d6\\u30e9\\u30a6\\u30b6\\u3067\\u306f\\u30b5\\u30dd\\u30fc\\u30c8\\u3055\\u308c\\u3066\\u3044\\u307e\\u305b\\u3093\\u3002';
  return e.name + ': ' + e.message;
}
`;

// --- 22a. Passkey 登録（基本）---
export const passkeyRegisterBasic: Category = {
  id: "passkey-register-basic",
  title: "22a. Passkey 登録（基本）",
  description: "navigator.credentials.create() を最小限のオプションで呼び出し、1Password の Passkey 登録 UI がトリガーされるかテストします。",
  fields: [
    {
      autocomplete: "off",
      type: "text",
      rawHtml: `<div>
  <button type="button" id="btn-register" style="padding:12px 32px;font-size:1rem;cursor:pointer;background:#4a90d9;color:#fff;border:none;border-radius:6px;">Passkey を登録</button>
  <span id="status-register" style="margin-left:12px;font-size:0.9rem;color:#888;"></span>
</div>
${resultArea("result-register")}
<${"scr" + "ipt"}>
${formatCredentialFn}
${classifyErrorFn}
document.getElementById('btn-register').addEventListener('click', async function() {
  var btn = this;
  var status = document.getElementById('status-register');
  var result = document.getElementById('result-register');
  btn.disabled = true;
  status.textContent = '認証器の応答を待っています...';
  status.style.color = '#d9a04a';
  result.textContent = '';
  try {
    var publicKey = {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rp: { name: "Autocomplete Test", id: "oreore.net" },
      user: {
        id: crypto.getRandomValues(new Uint8Array(16)),
        name: "test@sandbox-autocomplete.oreore.net",
        displayName: "Test User",
      },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },
        { type: "public-key", alg: -257 },
      ],
      authenticatorSelection: {
        residentKey: "required",
        userVerification: "preferred",
      },
      timeout: 60000,
    };
    var credential = await navigator.credentials.create({ publicKey: publicKey });
    status.textContent = '\\u2705 登録成功';
    status.style.color = '#2d8a4e';
    result.textContent = formatCredential(credential);
  } catch(e) {
    status.textContent = '\\u274c エラー';
    status.style.color = '#c0392b';
    result.textContent = classifyError(e) + '\\n\\n' + e.stack;
  } finally {
    btn.disabled = false;
  }
});
</${"scr" + "ipt"}>`,
    },
  ],
};

// --- 22b. Passkey 認証（基本）---
export const passkeyAuthBasic: Category = {
  id: "passkey-auth-basic",
  title: "22b. Passkey 認証（基本）",
  description: "navigator.credentials.get() を allowCredentials 空で呼び出し、discoverable credentials（passkey）による認証をテストします。",
  fields: [
    {
      autocomplete: "off",
      type: "text",
      rawHtml: `<div>
  <button type="button" id="btn-auth" style="padding:12px 32px;font-size:1rem;cursor:pointer;background:#4a90d9;color:#fff;border:none;border-radius:6px;">Passkey で認証</button>
  <span id="status-auth" style="margin-left:12px;font-size:0.9rem;color:#888;"></span>
</div>
${resultArea("result-auth")}
<${"scr" + "ipt"}>
${formatCredentialFn}
${classifyErrorFn}
document.getElementById('btn-auth').addEventListener('click', async function() {
  var btn = this;
  var status = document.getElementById('status-auth');
  var result = document.getElementById('result-auth');
  btn.disabled = true;
  status.textContent = '認証器の応答を待っています...';
  status.style.color = '#d9a04a';
  result.textContent = '';
  try {
    var publicKey = {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rpId: "oreore.net",
      allowCredentials: [],
      userVerification: "preferred",
      timeout: 60000,
    };
    var assertion = await navigator.credentials.get({ publicKey: publicKey, mediation: "optional" });
    status.textContent = '\\u2705 認証成功';
    status.style.color = '#2d8a4e';
    result.textContent = formatCredential(assertion);
  } catch(e) {
    status.textContent = '\\u274c エラー';
    status.style.color = '#c0392b';
    result.textContent = classifyError(e) + '\\n\\n' + e.stack;
  } finally {
    btn.disabled = false;
  }
});
</${"scr" + "ipt"}>`,
    },
  ],
};

// --- 22c. Passkey 条件付き認証（Conditional UI）---
export const passkeyConditionalUI: Category = {
  id: "passkey-conditional-ui",
  title: "22c. Passkey 条件付き認証（Conditional UI）",
  description: "autocomplete=\"username webauthn\" の input にフォーカスすると、1Password が passkey 候補を表示するかテストします。ページロード時に mediation: \"conditional\" で credentials.get() を呼び出します。",
  fields: [
    {
      autocomplete: "off",
      type: "text",
      rawHtml: `<div class="field">
  <label>ユーザー名（<code>autocomplete="username webauthn"</code>）</label>
  <input type="text" name="username-webauthn" autocomplete="username webauthn" placeholder="ここにフォーカスすると passkey 候補が表示されるはず">
</div>
<div id="conditional-status" style="margin-top:8px;font-size:0.9rem;color:#888;">Conditional UI の状態を確認中...</div>
${resultArea("result-conditional")}
<${"scr" + "ipt"}>
${formatCredentialFn}
${classifyErrorFn}
(async function() {
  var statusEl = document.getElementById('conditional-status');
  var resultEl = document.getElementById('result-conditional');
  if (!window.PublicKeyCredential) {
    statusEl.textContent = '\\u274c WebAuthn API がサポートされていません。';
    statusEl.style.color = '#c0392b';
    return;
  }
  if (!PublicKeyCredential.isConditionalMediationAvailable) {
    statusEl.textContent = '\\u274c isConditionalMediationAvailable が未サポートです。';
    statusEl.style.color = '#c0392b';
    return;
  }
  var available = await PublicKeyCredential.isConditionalMediationAvailable();
  if (!available) {
    statusEl.textContent = '\\u274c Conditional Mediation はこのブラウザでは利用できません。';
    statusEl.style.color = '#c0392b';
    return;
  }
  statusEl.textContent = '\\u2705 Conditional Mediation 利用可能 \\u2014 上の入力欄にフォーカスしてください。';
  statusEl.style.color = '#2d8a4e';
  try {
    var assertion = await navigator.credentials.get({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        rpId: "oreore.net",
        allowCredentials: [],
        userVerification: "preferred",
      },
      mediation: "conditional",
    });
    statusEl.textContent = '\\u2705 Conditional UI で認証成功';
    resultEl.textContent = formatCredential(assertion);
  } catch(e) {
    statusEl.textContent = '\\u274c Conditional UI エラー';
    statusEl.style.color = '#c0392b';
    resultEl.textContent = classifyError(e) + '\\n\\n' + e.stack;
  }
})();
</${"scr" + "ipt"}>`,
    },
  ],
};

// --- 22d. Passkey 登録（attestation: direct）---
export const passkeyAttestationDirect: Category = {
  id: "passkey-attestation-direct",
  title: "22d. Passkey 登録（attestation: direct）",
  description: "attestation を \"direct\" に設定した場合に 1Password がどう反応するかテストします。一部の認証器は attestation を返さない場合があります。",
  fields: [
    {
      autocomplete: "off",
      type: "text",
      rawHtml: `<div>
  <button type="button" id="btn-attest" style="padding:12px 32px;font-size:1rem;cursor:pointer;background:#4a90d9;color:#fff;border:none;border-radius:6px;">Passkey を登録（attestation: direct）</button>
  <span id="status-attest" style="margin-left:12px;font-size:0.9rem;color:#888;"></span>
</div>
${resultArea("result-attest")}
<${"scr" + "ipt"}>
${formatCredentialFn}
${classifyErrorFn}
document.getElementById('btn-attest').addEventListener('click', async function() {
  var btn = this;
  var status = document.getElementById('status-attest');
  var result = document.getElementById('result-attest');
  btn.disabled = true;
  status.textContent = '認証器の応答を待っています...';
  status.style.color = '#d9a04a';
  result.textContent = '';
  try {
    var publicKey = {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rp: { name: "Autocomplete Test", id: "oreore.net" },
      user: {
        id: crypto.getRandomValues(new Uint8Array(16)),
        name: "test-attest@sandbox-autocomplete.oreore.net",
        displayName: "Test User (attestation)",
      },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },
        { type: "public-key", alg: -257 },
      ],
      authenticatorSelection: {
        residentKey: "required",
        userVerification: "preferred",
      },
      attestation: "direct",
      timeout: 60000,
    };
    var credential = await navigator.credentials.create({ publicKey: publicKey });
    status.textContent = '\\u2705 登録成功（attestation: direct）';
    status.style.color = '#2d8a4e';
    result.textContent = formatCredential(credential);
  } catch(e) {
    status.textContent = '\\u274c エラー';
    status.style.color = '#c0392b';
    result.textContent = classifyError(e) + '\\n\\n' + e.stack;
  } finally {
    btn.disabled = false;
  }
});
</${"scr" + "ipt"}>`,
    },
  ],
};

// --- 22e. Passkey 登録（excludeCredentials 付き）---
export const passkeyExcludeCredentials: Category = {
  id: "passkey-exclude-credentials",
  title: "22e. Passkey 登録（excludeCredentials 付き）",
  description: "excludeCredentials にダミーの credential ID を入れた場合の挙動をテストします。ページ内で登録した credential を excludeCredentials に追加して再登録を試みることもできます。",
  fields: [
    {
      autocomplete: "off",
      type: "text",
      rawHtml: `<div>
  <button type="button" id="btn-register-first" style="padding:12px 32px;font-size:1rem;cursor:pointer;background:#4a90d9;color:#fff;border:none;border-radius:6px;">1. まず Passkey を登録</button>
  <span id="status-first" style="margin-left:12px;font-size:0.9rem;color:#888;"></span>
</div>
${resultArea("result-first")}
<hr style="border:none;border-top:1px dashed #ccc;margin:16px 0;">
<div>
  <button type="button" id="btn-register-exclude" style="padding:12px 32px;font-size:1rem;cursor:pointer;background:#d9904a;color:#fff;border:none;border-radius:6px;" disabled>2. excludeCredentials 付きで再登録</button>
  <span id="status-exclude" style="margin-left:12px;font-size:0.9rem;color:#888;">先に上のボタンで登録してください</span>
</div>
${resultArea("result-exclude")}
<${"scr" + "ipt"}>
${formatCredentialFn}
${classifyErrorFn}
var registeredCredentialId = null;

document.getElementById('btn-register-first').addEventListener('click', async function() {
  var btn = this;
  var status = document.getElementById('status-first');
  var result = document.getElementById('result-first');
  btn.disabled = true;
  status.textContent = '認証器の応答を待っています...';
  status.style.color = '#d9a04a';
  result.textContent = '';
  try {
    var publicKey = {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rp: { name: "Autocomplete Test", id: "oreore.net" },
      user: {
        id: crypto.getRandomValues(new Uint8Array(16)),
        name: "test-exclude@sandbox-autocomplete.oreore.net",
        displayName: "Test User (exclude)",
      },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },
        { type: "public-key", alg: -257 },
      ],
      authenticatorSelection: {
        residentKey: "required",
        userVerification: "preferred",
      },
      timeout: 60000,
    };
    var credential = await navigator.credentials.create({ publicKey: publicKey });
    registeredCredentialId = new Uint8Array(credential.rawId);
    status.textContent = '\\u2705 登録成功 \\u2014 下の excludeCredentials テストが有効になりました';
    status.style.color = '#2d8a4e';
    result.textContent = formatCredential(credential);
    document.getElementById('btn-register-exclude').disabled = false;
    document.getElementById('status-exclude').textContent = 'excludeCredentials に上で登録した credential ID を設定して再登録を試みます';
  } catch(e) {
    status.textContent = '\\u274c エラー';
    status.style.color = '#c0392b';
    result.textContent = classifyError(e) + '\\n\\n' + e.stack;
  } finally {
    btn.disabled = false;
  }
});

document.getElementById('btn-register-exclude').addEventListener('click', async function() {
  var btn = this;
  var status = document.getElementById('status-exclude');
  var result = document.getElementById('result-exclude');
  btn.disabled = true;
  status.textContent = '認証器の応答を待っています...';
  status.style.color = '#d9a04a';
  result.textContent = '';
  try {
    var publicKey = {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rp: { name: "Autocomplete Test", id: "oreore.net" },
      user: {
        id: crypto.getRandomValues(new Uint8Array(16)),
        name: "test-exclude@sandbox-autocomplete.oreore.net",
        displayName: "Test User (exclude)",
      },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },
        { type: "public-key", alg: -257 },
      ],
      authenticatorSelection: {
        residentKey: "required",
        userVerification: "preferred",
      },
      excludeCredentials: [
        { type: "public-key", id: registeredCredentialId },
      ],
      timeout: 60000,
    };
    var credential = await navigator.credentials.create({ publicKey: publicKey });
    status.textContent = '\\u2705 登録成功（excludeCredentials にもかかわらず別の認証器で登録された可能性）';
    status.style.color = '#2d8a4e';
    result.textContent = formatCredential(credential);
  } catch(e) {
    if (e.name === 'InvalidStateError') {
      status.textContent = '\\u2705 期待通り: InvalidStateError（既存 credential が除外された）';
      status.style.color = '#2d8a4e';
    } else {
      status.textContent = '\\u274c エラー';
      status.style.color = '#c0392b';
    }
    result.textContent = classifyError(e) + '\\n\\n' + e.stack;
  } finally {
    btn.disabled = false;
  }
});
</${"scr" + "ipt"}>`,
    },
  ],
};

export const passkeyTests: Category[] = [
  passkeyRegisterBasic,
  passkeyAuthBasic,
  passkeyConditionalUI,
  passkeyAttestationDirect,
  passkeyExcludeCredentials,
];
