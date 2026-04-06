import type { Category } from "../lib/types.ts";

// 都道府県リスト
const prefectures = [
  "北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県",
  "茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県",
  "新潟県","富山県","石川県","福井県","山梨県","長野県",
  "岐阜県","静岡県","愛知県","三重県",
  "滋賀県","京都府","大阪府","兵庫県","奈良県","和歌山県",
  "鳥取県","島根県","岡山県","広島県","山口県",
  "徳島県","香川県","愛媛県","高知県",
  "福岡県","佐賀県","長崎県","熊本県","大分県","宮崎県","鹿児島県","沖縄県",
];

// 国リスト（主要国のみ）
const countries = [
  "JP", "US", "GB", "DE", "FR", "CN", "KR", "TW", "AU", "CA",
  "IT", "ES", "BR", "IN", "RU", "MX", "SG", "TH", "VN", "PH",
];

export const addressVariations: Category = {
  id: "address-variations",
  title: "5b. 住所バリエーション",
  description: "実際のフォームで使われるパターン: select、分割入力、datalist 等",
  fields: [
    // --- 郵便番号: 分割入力 ---
    {
      autocomplete: "shipping postal-code",
      type: "text",
      maxlength: "3",
      placeholder: "123",
      note: "郵便番号 前半3桁（通常の input）",
    },
    {
      autocomplete: "shipping postal-code",
      type: "text",
      maxlength: "4",
      placeholder: "4567",
      note: "郵便番号 後半4桁 — 同じ autocomplete='postal-code' を2つ並べた場合",
    },
    // --- 都道府県: select ---
    {
      autocomplete: "shipping address-level1",
      type: "text",
      tag: "select",
      options: prefectures,
      note: "<select> で都道府県を選択",
    },
    // --- 都道府県: text ---
    {
      autocomplete: "shipping address-level1",
      type: "text",
      note: "通常の <input type='text'>（比較用）",
    },
    // --- 国: select (ISO コード) ---
    {
      autocomplete: "shipping country",
      type: "text",
      tag: "select",
      options: countries,
      note: "<select> で国コード (ISO 3166-1 alpha-2) を選択",
    },
    // --- 国: text ---
    {
      autocomplete: "shipping country",
      type: "text",
      note: "通常の <input type='text'>（比較用）",
    },
    // --- 国名: select ---
    {
      autocomplete: "shipping country-name",
      type: "text",
      tag: "select",
      options: ["日本", "アメリカ合衆国", "イギリス", "ドイツ", "フランス", "中国", "韓国"],
      note: "<select> で国名を選択",
    },
    // --- 都道府県: select (value=コード, label=名前) ---
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
      note: "<select> value=コード番号(01-47), label=都道府県名 — value と label どちらで補完されるか",
    },
    // --- 国: select (value=コード, label=国名) ---
    {
      autocomplete: "shipping country",
      type: "text",
      rawHtml: `<select name="country-label" autocomplete="shipping country">
        <option value="">--</option>
        <option value="JP">日本</option><option value="US">アメリカ合衆国</option>
        <option value="GB">イギリス</option><option value="DE">ドイツ</option>
        <option value="FR">フランス</option><option value="CN">中国</option>
        <option value="KR">韓国</option><option value="TW">台湾</option>
      </select>`,
      note: "<select> value=ISO コード, label=国名 — value と label どちらで補完されるか",
    },
    // --- 国: select (value=国名, label=国名) ---
    {
      autocomplete: "shipping country",
      type: "text",
      rawHtml: `<select name="country-name-val" autocomplete="shipping country">
        <option value="">--</option>
        <option value="日本">日本</option><option value="アメリカ合衆国">アメリカ合衆国</option>
        <option value="イギリス">イギリス</option><option value="ドイツ">ドイツ</option>
      </select>`,
      note: "<select> value=国名, label=国名（value と label が同じ）— 比較用",
    },
    // --- 市区町村: text ---
    {
      autocomplete: "shipping address-level2",
      type: "text",
      note: "市区町村（通常 input）",
    },
    // --- 番地: text ---
    {
      autocomplete: "shipping address-line1",
      type: "text",
      note: "address-line1（通常 input）",
    },
    // --- 建物名等: text ---
    {
      autocomplete: "shipping address-line2",
      type: "text",
      note: "address-line2（通常 input）",
    },
  ],
};
