# scripts：開發與部署腳本

這個資料夾放 `npm run` 指令呼叫的 Node.js 腳本（ES Module）。

| 檔案 | 對應指令 | 說明 |
| :-- | :-- | :-- |
| `dev.js` | `npm run dev` | 依序啟動 Netlify 本機伺服器與 Vite |
| `deploy.js` | `npm run deploy` | 互動式部署選單 |
| `misc.js` | — | 部署腳本使用的共用函式 |

## dev.js：開發伺服器

為什麼不直接同時啟動兩者？因為 Vite 的 `/api` 代理需要 Netlify 伺服器已經準備好，所以腳本會等待。

流程：

1. 執行 `npx netlify dev --dir=dist`，啟動 Netlify 本機伺服器（預設 `localhost:8888`），處理 Functions 與 `/api/*` 轉發。
2. 監聽它的輸出，出現 `Local dev server ready` 就代表準備完成。
3. 啟動 `vite --host`，Vite 開在 `5173`，並把 `/api` 代理到 `http://localhost:8888`。
4. Netlify 的輸出會原樣顯示在同一個終端機；Netlify 結束時，腳本也會一併結束。

啟動前請確認：

- 已全域安裝 `netlify-cli`。
- 已建立根目錄 `.env.local` 與 `src/pages/.env.local`。

如果卡住不動，通常是 Netlify CLI 沒有印出 `Local dev server ready`（例如 CLI 版本改了輸出文字、或需要登入／連結站台）。可以單獨執行 `npx netlify dev --dir=dist` 看錯誤訊息。

## deploy.js：部署

執行 `npm run deploy` 後會跳出選單：

| 選項 | 實際執行 | 結果 |
| :-- | :-- | :-- |
| `gh-pages` | `npx gh-pages -d dist` | 把 `dist/` 推到 `gh-pages` 分支，然後開啟 `VITE_URL` |
| `netlify-draft` | `netlify deploy --dir=dist --json` | 建立預覽部署，開啟預覽網址 |
| `netlify-prod` | `netlify deploy --prod --dir=dist --json` | 部署到正式網址，開啟網址 |

注意事項：

- 腳本**不會**自動建置。部署前請先執行 `npm run build`，否則會上傳舊的 `dist/`。
- 腳本會用 `loadEnv('production', './src/pages')` 讀取前端環境變數，主要用到 `VITE_URL`。
- 部署失敗時會用紅字印出錯誤，不會中斷其他操作。
- `gh-pages` 只能發佈靜態檔案，沒有後端 API，所以後台會無法運作。需要完整功能請選 Netlify。
- 部署前需要先用 `netlify login` 登入，並用 `netlify link` 或 `netlify sites:create` 連結站台。

## misc.js：共用函式

| 函式 | 說明 |
| :-- | :-- |
| `openUrl(hostname, url)` | 在終端機印出網址並用 `open` 指令在瀏覽器開啟；`url` 為空時什麼都不做。`open` 是 macOS 指令，Windows 或 Linux 需要改成 `start`／`xdg-open` |
| `deployToNetlify(options)` | 執行 `netlify deploy <options> --json`，解析輸出的 JSON，並開啟 `deploy_url`（或 `ssl_url`、`url`） |

## 使用到的套件

`chalk`（彩色輸出）、`inquirer`（互動選單）、`vite`（`loadEnv`）。
