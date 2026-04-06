import type { Category } from "../lib/types.ts";

export const webauthn: Category = {
  id: "webauthn",
  title: "18. WebAuthn",
  fields: [
    {
      autocomplete: "username webauthn",
      type: "text",
      note: "パスキー対応ブラウザでは WebAuthn の認証 UI がトリガーされる場合があります。",
    },
  ],
};
