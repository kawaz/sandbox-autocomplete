import type { Category } from "../lib/types.ts";

// 全パターン共通: postal-code で補完を発動し、他フィールドの連動を観察

export const addressOrderTest: Category = {
  id: "address-order-test",
  title: "5c. country + country-name 両方（country が先）",
  description: "postal-code で補完 → country と country-name のどちらが埋まるか",
  fields: [
    { autocomplete: "shipping postal-code", type: "text", note: "← ここで補完を発動" },
    { autocomplete: "shipping country", type: "text", note: "country（先）" },
    { autocomplete: "shipping country-name", type: "text", note: "country-name（後）" },
  ],
};

export const addressOrderTest2: Category = {
  id: "address-order-test-2",
  title: "5d. country-name + country 両方（country-name が先）",
  description: "postal-code で補完 → 順序逆転時の挙動",
  fields: [
    { autocomplete: "shipping postal-code", type: "text", note: "← ここで補完を発動" },
    { autocomplete: "shipping country-name", type: "text", note: "country-name（先）" },
    { autocomplete: "shipping country", type: "text", note: "country（後）" },
  ],
};

export const addressOrderTest3: Category = {
  id: "address-order-test-3",
  title: "5e. country のみ",
  description: "postal-code で補完 → country だけある場合",
  fields: [
    { autocomplete: "shipping postal-code", type: "text", note: "← ここで補完を発動" },
    { autocomplete: "shipping country", type: "text", note: "country のみ" },
  ],
};

export const addressOrderTest4: Category = {
  id: "address-order-test-4",
  title: "5f. country-name のみ",
  description: "postal-code で補完 → country-name だけある場合",
  fields: [
    { autocomplete: "shipping postal-code", type: "text", note: "← ここで補完を発動" },
    { autocomplete: "shipping country-name", type: "text", note: "country-name のみ" },
  ],
};

export const addressOrderTest5: Category = {
  id: "address-order-test-5",
  title: "5g. address-level1 select(value=code) + postal-code",
  description: "postal-code で補完 → 都道府県 select の value vs label",
  fields: [
    { autocomplete: "shipping postal-code", type: "text", note: "← ここで補完を発動" },
    {
      autocomplete: "shipping address-level1",
      type: "text",
      rawHtml: `<select name="pref-code" autocomplete="shipping address-level1">
        <option value="">--</option>
        <option value="01">北海道</option><option value="02">青森県</option><option value="03">岩手県</option>
        <option value="04">宮城県</option><option value="05">秋田県</option><option value="06">山形県</option>
        <option value="07">福島県</option><option value="08">茨城県</option><option value="09">栃木県</option>
        <option value="10">群馬県</option><option value="11">埼玉県</option><option value="12">千葉県</option>
        <option value="13">東京都</option><option value="14">神奈川県</option><option value="15">新潟県</option>
        <option value="16">富山県</option><option value="17">石川県</option><option value="18">福井県</option>
        <option value="19">山梨県</option><option value="20">長野県</option><option value="21">岐阜県</option>
        <option value="22">静岡県</option><option value="23">愛知県</option><option value="24">三重県</option>
        <option value="25">滋賀県</option><option value="26">京都府</option><option value="27">大阪府</option>
        <option value="28">兵庫県</option><option value="29">奈良県</option><option value="30">和歌山県</option>
        <option value="31">鳥取県</option><option value="32">島根県</option><option value="33">岡山県</option>
        <option value="34">広島県</option><option value="35">山口県</option><option value="36">徳島県</option>
        <option value="37">香川県</option><option value="38">愛媛県</option><option value="39">高知県</option>
        <option value="40">福岡県</option><option value="41">佐賀県</option><option value="42">長崎県</option>
        <option value="43">熊本県</option><option value="44">大分県</option><option value="45">宮崎県</option>
        <option value="46">鹿児島県</option><option value="47">沖縄県</option>
      </select>`,
      note: "select value=コード(01-47), label=都道府県名",
    },
  ],
};

export const addressOrderTest6: Category = {
  id: "address-order-test-6",
  title: "5h. country select(value=code) + postal-code",
  description: "postal-code で補完 → 国 select の value vs label",
  fields: [
    { autocomplete: "shipping postal-code", type: "text", note: "← ここで補完を発動" },
    {
      autocomplete: "shipping country",
      type: "text",
      rawHtml: `<select name="country-code" autocomplete="shipping country">
        <option value="">--</option>
        <option value="JP">日本</option><option value="US">アメリカ合衆国</option>
        <option value="GB">イギリス</option><option value="DE">ドイツ</option>
        <option value="FR">フランス</option><option value="CN">中国</option>
        <option value="KR">韓国</option><option value="TW">台湾</option>
      </select>`,
      note: "select value=ISO コード, label=国名",
    },
  ],
};

export const addressOrderTest7: Category = {
  id: "address-order-test-7",
  title: "5i. address-level1 select(value=name) + postal-code",
  description: "postal-code で補完 → 都道府県 select で value=label の場合（対照）",
  fields: [
    { autocomplete: "shipping postal-code", type: "text", note: "← ここで補完を発動" },
    {
      autocomplete: "shipping address-level1",
      type: "text",
      tag: "select",
      options: [
        "北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県",
        "茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県",
        "新潟県","富山県","石川県","福井県","山梨県","長野県",
        "岐阜県","静岡県","愛知県","三重県",
        "滋賀県","京都府","大阪府","兵庫県","奈良県","和歌山県",
        "鳥取県","島根県","岡山県","広島県","山口県",
        "徳島県","香川県","愛媛県","高知県",
        "福岡県","佐賀県","長崎県","熊本県","大分県","宮崎県","鹿児島県","沖縄県",
      ],
      note: "select value=label=都道府県名（対照用）",
    },
  ],
};
