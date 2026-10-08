# AGENTS.md

給 AI coding agent 的專案指引。回覆與註解請使用繁體中文。

> **本檔與 README 的分工**
> - `AGENTS.md`（本檔）是給 AI 看的：只放規則、約束、陷阱與「去哪裡找細節」，力求精簡。
> - 各資料夾的 `README.md` 是給人看的：完整的說明、範例與操作步驟。
> - 兩邊的事實必須一致。改了程式行為，就要同步更新對應的 `README.md`；改了專案規則或結構，就要同步更新本檔。不要把 README 的長篇說明複製到這裡，用連結指過去。

## 專案概述

Vite + React 19 + TypeScript 前端，搭配 Netlify Functions（Express + serverless-http）後端與 MongoDB（mongoose）。Auth0 登入，Cloudinary 或 BunnyCDN 儲存圖片，Tailwind CSS 4 + daisyUI 5 與 Less 處理樣式，MSW + faker 模擬 API。路徑別名 `@/*` 對應 `src/*`。

## 文件地圖（細節請讀這些 README）

| 要做的事 | 先讀 |
| :-- | :-- |
| 了解整體、環境變數、部署、已知限制 | [README.md](README.md) |
| 頁面、路由、登入流程 | [src/pages/README.md](src/pages/README.md) |
| 全域狀態、列舉、`REST_PATH` | [src/settings/README.md](src/settings/README.md) |
| 呼叫 API 的 hooks | [src/hooks/README.md](src/hooks/README.md) |
| 共用元件總覽與撰寫規範 | [src/components/README.md](src/components/README.md) |
| 單一元件（`album`、`alert`、`button`、`confirm`、`drawer`、`loadingProcess`、`modal`、`tab`、`tiptab`、`userInfo`） | `src/components/<名稱>/README.md` |
| 後端 API、資料模型 | [netlify/functions/README.md](netlify/functions/README.md) |
| 資料表 schema 與型別推導 | [setting/README.md](setting/README.md) |
| API Mock | [src/mocks/README.md](src/mocks/README.md) |
| 開發與部署腳本 | [scripts/README.md](scripts/README.md) |

## 目錄結構

| 路徑 | 說明 |
| :-- | :-- |
| `src/pages/` | Vite root。`index.tsx`、`app.tsx`、`router.tsx` 與各頁面 |
| `src/components/` | 共用元件，一個元件一個資料夾 |
| `src/hooks/` | 呼叫後端 API 的 hooks |
| `src/settings/` | 前端全域狀態（`constant.ts`）、型別（`type.ts`）、`REST_PATH`（`config.ts`） |
| `src/mocks/` | MSW handlers |
| `netlify/functions/api/` | Express 路由與資料庫操作 |
| `netlify/functions/models.ts` | 依 schema 自動建立 mongoose model |
| `setting/` | **前後端共用**的資料表定義（注意是單數，與 `src/settings/` 不同） |
| `scripts/` | `dev.js`、`deploy.js`、`misc.js` |
| `public/` | 靜態資源，含 `_redirects` 與 `mockServiceWorker.js` |

## 常用指令

```sh
npm install        # 專案使用 npm；package-lock.json 在 .gitignore 內
npm run dev        # netlify dev（--dir=dist）就緒後再啟動 vite --host
npm run build      # tsc + vite build
npm run lint       # eslint，--max-warnings 0
npm run preview
npm run deploy     # 互動式：gh-pages / netlify-draft / netlify-prod（不會先 build）
```

- 需要全域安裝 `netlify-cli`，Node v18 以上。
- README 舊版提到的 `npm run serve`、`npm run dev:serve` 不存在，不要使用。
- 沒有測試框架。完成修改的最低驗證標準：`npm run lint` 與 `npm run build` 都通過。

## 環境變數

- 後端：根目錄 `.env.local`（範本 `.env.defaults`）。前端：`src/pages/.env.local`（範本 `src/pages/.env.defaults`），變數必須以 `VITE_` 開頭。
- **不要**讀出、輸出、複製或 commit 任何 `.env*` 檔的實際值；文件中只寫變數名稱。
- 變數清單與用途在根目錄 README 的「環境變數」章節。以下是程式碼實際使用、但容易漏掉的變數：
  - 管理員 email 變數名稱拼成 `AMIN_EMAIL`（少了 D），這是程式碼的實際名稱，不要「修正」，除非同時改完所有用到的地方與文件。
  - `CLOUD_STORAGE_TYPE`、`BUNNY_*` 在程式碼中使用，但不在 `.env.defaults` 內。
  - `VITE_AUTH0_CLIENT_ID_DEV`、`VITE_API_PATH_DEV` 在 `localhost` 時使用。

## 架構重點與陷阱

1. **前台／後台分流**：`app.tsx` 依 `location.pathname.startsWith('/admin')` 選擇 `AdminApp` 或 `UserApp`。`Alert`、`Modal` 只在 `AdminApp` 渲染。
2. **`SETTING.mongodb[0]` 是使用者資料表**：登入、使用者管理頁、導覽列都用 index 0。不要調換順序；新 collection 加在後面。`MainBar` 會略過 index 0。
3. **API 回應一律 HTTP 200**，以 body 的 `res: boolean` 判斷成功與否。
4. **資料請求一律走 hooks**（`src/hooks/`），元件內不要直接寫 `fetch` 或 `Fetcher`。大部分 hook 會自動開關全域 Loading，`useSelect` 例外。
5. **全域狀態更新是「合併」**：`setContext({ type, state })` 的 `state` 只覆蓋傳入的欄位，沒傳的欄位會保留上一次的值（Modal 的 `label`、`body` 尤其要注意）。
6. **後端目前沒有任何驗證**，token 只是 Base64 編碼，CORS 為 `*`。這是已知限制（見根目錄 README），不要在不被要求時當成 bug 順手改，但也不要假設後端會擋住未授權請求；新增 API 時如果使用者要求做權限，要明確詢問做法。
7. **`Tab` 的 radio `name` 是固定值**，同一畫面只能有一組 `Tab`。
8. `userInfo` 元件與 `ActionType.Status`、`TransitionType` 目前沒有被使用；刪除前先確認。

## 命名與風格

- 變數 camelCase；元件、全域變數／state PascalCase；常數與環境變數 SCREAMING_SNAKE_CASE。
- 型別：interface 以 `I` 開頭、type 以 `T` 開頭；enum 以 `Type` 結尾（`ActionType`）。
- CSS class 使用 kebab-case。
- Prettier：單引號、JSX 單引號、2 空格、`printWidth` 100、`trailingComma: all`、`prettier-plugin-tailwindcss` 排序。
- TypeScript `strict`、`noUnusedLocals`、`noUnusedParameters` 開啟，不留未使用的變數與參數。
- 元件用 `memo` 包裝並 `export default`；Props 型別以 `T` 開頭，子元素用 `IReactProps`；合併 class 用 `tailwind-merge` 的 `twMerge`。
- 註解與使用者介面文字沿用既有語言（程式註解多為英文，後台畫面中英文並存），不要為了統一而大範圍改寫。

## 修改程式時必須同步更新的文件

| 你改了 | 要同步更新 |
| :-- | :-- |
| 元件的 Props、行為、檔案 | `src/components/<名稱>/README.md`；新增或刪除元件時還要更新 [src/components/README.md](src/components/README.md) 的一覽表 |
| 新增或修改 hook | [src/hooks/README.md](src/hooks/README.md) |
| `REST_PATH`、全域狀態欄位、列舉 | [src/settings/README.md](src/settings/README.md) |
| API 路由、請求或回應格式 | [netlify/functions/README.md](netlify/functions/README.md)，以及對應 hook 與 mock |
| `setting/index.ts` 的 schema | [setting/README.md](setting/README.md) |
| 頁面、路由、權限 | [src/pages/README.md](src/pages/README.md) |
| 環境變數 | 根目錄 [README.md](README.md) 的環境變數表，以及 `.env.defaults`（只放變數名稱與空值或範例值） |
| `npm run` 指令、腳本 | 根目錄 README 的「常用指令」與 [scripts/README.md](scripts/README.md) |
| 專案規則、結構、陷阱 | 本檔 |

新增元件時的步驟：建立 `src/components/<名稱>/index.tsx` → 同資料夾寫 `README.md`（格式見 [src/components/README.md](src/components/README.md)）→ 更新一覽表。

撰寫文件的原則：以繁體中文撰寫、給不熟悉專案的人讀；先寫「這是什麼、怎麼用」，再寫細節；範例要能直接複製；只寫程式碼實際做到的事，不確定或沒驗證的行為要明說，不要編造。

## 新增功能的標準流程

- **新 collection**：`setting/index.ts` 加 schema（保持 `as const`）→ 後端 model 自動產生、前端型別自動推導 → 用現有 hooks 操作 → 需要頁面再依 [src/pages/README.md](src/pages/README.md) 建立。
- **新 API**：`netlify/functions/api/` 加處理函式 → `api.ts` 註冊路由 → `src/settings/config.ts` 的 `REST_PATH` 登記 → `src/hooks/` 加 hook → `src/mocks/handlers.ts` 補 mock（MSW 3.x，使用 `http` 與 `HttpResponse`，不是 `rest`）→ 更新文件。
- 前端一律呼叫 `/api/...`；`netlify.toml` 與 `public/_redirects` 會轉發到 `/.netlify/functions/api/...`。

## 依賴與資安

- `npm audit` 的警告目前都在開發與建置工具（`braces` 鏈經由 `vite-plugin-html`、`gh-pages`；`shell-quote` 經由 `concurrently`；`postcss-selector-parser` 經由 `@tailwindcss/typography`），不進入正式環境。`braces` 上游尚未有修補版。
- **不要**執行 `npm audit fix --force`，它會把套件降到更舊的版本。要修補子依賴請用 `package.json` 的 `overrides`（僅 npm 有效），並在修改後執行 `npm install`、`npm audit`、`npm run build` 驗證。
- `packageManager` 欄位寫的是 yarn，但專案實際使用 npm。

## 禁止事項

- 不要手動編輯 `package-lock.json`、`dist/`、`node_modules/`。
- 除非使用者明確要求，不要執行 `npm run rm`（會刪除 `node_modules/`、`dist/`、`package-lock.json`）。
- 修改 `netlify.toml` 的 CORS／headers、`public/_redirects`、登入與權限邏輯前，先向使用者確認。
- 不要把真實的金鑰、token、密碼寫進程式碼、文件或 commit。
