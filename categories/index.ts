import type { Category } from "../lib/types.ts";
import { keywords } from "./keywords.ts";
import { name } from "./name.ts";
import { credentials } from "./credentials.ts";
import { organization } from "./organization.ts";
import { addressShipping } from "./address-shipping.ts";
import { addressBilling } from "./address-billing.ts";
import { creditCard } from "./credit-card.ts";
import { transaction } from "./transaction.ts";
import { telHome } from "./tel-home.ts";
import { telWork } from "./tel-work.ts";
import { telMobile } from "./tel-mobile.ts";
import { telFax } from "./tel-fax.ts";
import { telPager } from "./tel-pager.ts";
import { contact } from "./contact.ts";
import { birthday } from "./birthday.ts";
import { misc } from "./misc.ts";
import { sectionPrefix } from "./section-prefix.ts";
import { webauthn } from "./webauthn.ts";
import { bdayWithContext } from "./bday-with-context.ts";
import { telWithContext } from "./tel-with-context.ts";
import { furiganaTests } from "./furigana.ts";
import { newPasswordRulesTests } from "./new-password-rules.ts";
import { passwordrulesSpecialCharsTests } from "./passwordrules-special-chars.ts";
import { addressVariations } from "./address-variations.ts";
import { addressOrderTest, addressOrderTest2, addressOrderTest3, addressOrderTest4, addressOrderTest5, addressOrderTest6, addressOrderTest7 } from "./address-order-test.ts";
import { passkeyTests } from "./passkey.ts";

export const categories: Category[] = [
  keywords,
  name,
  credentials,
  organization,
  addressShipping,
  addressVariations,
  addressOrderTest,
  addressOrderTest2,
  addressOrderTest3,
  addressOrderTest4,
  addressOrderTest5,
  addressOrderTest6,
  addressOrderTest7,
  addressBilling,
  creditCard,
  transaction,
  telHome,
  telWork,
  telMobile,
  telFax,
  telPager,
  ...telWithContext,
  contact,
  birthday,
  ...bdayWithContext,
  misc,
  sectionPrefix,
  webauthn,
  ...passkeyTests,
  ...furiganaTests,
  ...newPasswordRulesTests,
  ...passwordrulesSpecialCharsTests,
];
