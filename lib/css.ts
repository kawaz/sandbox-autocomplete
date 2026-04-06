export const CSS = `
    *, *::before, *::after {
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Hiragino Sans", "Noto Sans JP", sans-serif;
      max-width: 960px;
      margin: 0 auto;
      padding: 24px 16px;
      background: #fafafa;
      color: #1a1a1a;
      line-height: 1.6;
    }
    h1 {
      font-size: 1.8rem;
      margin-bottom: 0.25em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .intro {
      color: #555;
      margin-bottom: 2rem;
      font-size: 0.95rem;
    }
    fieldset {
      border: 1px solid #d0d0d0;
      border-radius: 8px;
      padding: 20px 24px;
      margin-bottom: 24px;
      background: #fff;
    }
    legend {
      font-weight: 700;
      font-size: 1.15rem;
      padding: 0 8px;
      color: #333;
    }
    .field {
      margin-bottom: 14px;
    }
    label {
      display: block;
      margin-bottom: 4px;
      font-size: 0.9rem;
    }
    label code {
      font-family: "SF Mono", "Fira Code", "Fira Mono", "Roboto Mono", Menlo, Consolas, monospace;
      background: #eef2f7;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.85rem;
      color: #0055aa;
    }
    input, textarea, select {
      width: 100%;
      padding: 8px 12px;
      font-size: 1rem;
      border: 1px solid #c0c0c0;
      border-radius: 6px;
      background: #fff;
      transition: border-color 0.15s, box-shadow 0.15s;
      font-family: inherit;
    }
    input:focus, textarea:focus, select:focus {
      outline: none;
      border-color: #4a90d9;
      box-shadow: 0 0 0 3px rgba(74, 144, 217, 0.15);
    }
    textarea {
      resize: vertical;
      min-height: 60px;
    }
    .keyword-demo {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
    }
    .keyword-demo form {
      flex: 1;
      min-width: 240px;
    }
    .keyword-demo fieldset {
      margin-bottom: 0;
    }
    .submit-row {
      text-align: center;
      padding: 16px 0;
    }
    button[type="submit"] {
      background: #4a90d9;
      color: #fff;
      border: none;
      padding: 12px 40px;
      font-size: 1rem;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.15s;
    }
    button[type="submit"]:hover {
      background: #357abd;
    }
    .note {
      font-size: 0.82rem;
      color: #888;
      margin-top: 4px;
    }
    nav.page-nav {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      margin-bottom: 20px;
      gap: 4px;
    }
    nav.page-nav a, nav.page-nav span {
      color: #4a90d9;
      text-decoration: none;
      font-size: 0.85rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    nav.page-nav a:hover {
      text-decoration: underline;
    }
    nav.page-nav :nth-child(1) { text-align: left; }
    nav.page-nav :nth-child(2) { text-align: center; }
    nav.page-nav :nth-child(3) { text-align: right; }
    .category-list {
      list-style: none;
      padding: 0;
    }
    .category-list li {
      margin-bottom: 8px;
    }
    .category-list a {
      display: block;
      padding: 12px 20px;
      background: #fff;
      border: 1px solid #d0d0d0;
      border-radius: 8px;
      color: #1a1a1a;
      text-decoration: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .category-list a:hover {
      border-color: #4a90d9;
      box-shadow: 0 0 0 3px rgba(74, 144, 217, 0.15);
    }
    .category-list .field-count {
      color: #888;
      font-size: 0.85rem;
      margin-left: 8px;
    }
    @media (max-width: 600px) {
      body { padding: 16px 10px; }
      fieldset { padding: 14px 12px; }
    }
`;
