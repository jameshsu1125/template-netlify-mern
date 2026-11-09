# AGENTS.md

給 AI 代理（Claude Code、Codex、Cursor 等）閱讀的專案規則與規格。動手前先讀完「必守規則」與「陷阱」，再依任務查閱對應章節。

- 回覆與註解使用繁體中文（台灣用語）；程式碼、指令、檔名維持原文。
- 本檔是**速查規格**；各資料夾的 `README.md` 是給人看的完整說明與範例（本檔會指向它們）。程式與本檔不一致時，先確認哪邊正確，再**同一次修改**兩邊都更新，並同步對應的 `README.md`（見 [第 15 章](#15-修改後必須同步更新的文件)）。
- 姊妹專案 `template-vite-react` 的全域狀態（`ActionType`、`IAction`、`Reducer`）寫法與本專案**刻意保持一致**；改這一塊時兩邊要一起改（見 [6.4](#64-與-template-vite-react-的對應)）。

## 目錄

1. [專案概覽](#1-專案概覽)
2. [必守規則](#2-必守規則)
3. [指令](#3-指令)
4. [目錄結構](#4-目錄結構)
5. [環境變數](#5-環境變數)
6. [全域狀態（Context / Reducer）](#6-全域狀態context--reducer)
7. [頁面與路由](#7-頁面與路由)
8. [元件規格](#8-元件規格)
9. [Hooks 規格](#9-hooks-規格)
10. [後端 API（Netlify Functions）](#10-後端-apinetlify-functions)
11. [資料表定義（`setting/`）](#11-資料表定義setting)
12. [Mock（MSW）](#12-mockmsw)
13. [樣式（Tailwind v4 + daisyUI + Less）](#13-樣式tailwind-v4--daisyui--less)
14. [部署與腳本](#14-部署與腳本)
15. [修改後必須同步更新的文件](#15-修改後必須同步更新的文件)
16. [常見任務步驟](#16-常見任務步驟)
17. [已知問題](#17-已知問題)
18. [完成前檢查清單](#18-完成前檢查清單)

---

## 1. 專案概覽

Vite + React 19 + TypeScript 前端，搭配 Netlify Functions（Express + serverless-http）後端與 MongoDB（mongoose）的後台管理模板。Auth0 登入，Cloudinary 或 BunnyCDN 儲存圖片，Tiptap 富文字編輯。

| 領域    | 技術                                                                                    |
| :------ | :-------------------------------------------------------------------------------------- |
| Bundler | Vite 8（`root` 是 `src/pages`，不是專案根目錄；`outDir` 為根目錄 `dist/`）              |
| UI      | React 19、`react-router-dom` 7、`react-icons`、Tiptap 3                                 |
| 語言    | TypeScript 5.9（`strict`、`noUnusedLocals`、`noUnusedParameters`）                      |
| 樣式    | Tailwind CSS 4（`@tailwindcss/postcss`）+ daisyUI 5 + Less；`tailwind-merge` 合併 class |
| 登入    | `@auth0/auth0-react`（只用於後台 `/admin`）                                             |
| API     | 前端 `lesca-fetcher`；後端 Express 5 + `serverless-http`，部署成單一 Netlify Function   |
| 資料庫  | MongoDB + mongoose 9（model 由 `setting/index.ts` 自動產生）                            |
| 圖片    | Cloudinary 或 BunnyCDN（`lesca-node-bunnycdn`），上傳前用 `sharp` 轉 WebP               |
| Mock    | `msw` 3 + `@faker-js/faker`                                                             |
| 其他    | `lesca-react-capture-button`（選圖壓縮）、`lesca-local-storage`、`lesca-atobtoa`        |
| 部署    | Netlify（`netlify-cli`）、`gh-pages`（只有靜態前端，沒有 API）                          |

模組為 ESM（`package.json` 的 `"type": "module"`）。`scripts/` 內的 `.js` 是 Node ESM，用 `import`，不用 `require`。路徑別名 `@/*` → `src/*`（`tsconfig.json`、`vite.config.ts`）。

> `package.json` 的 `name` 仍是 `template-vite-react`、`packageManager` 寫 yarn，但專案**實際使用 npm**（`package-lock.json` 在 `.gitignore`）。這是範本遺留，不要「修正」。

## 2. 必守規則

### 2.1 命名

| 對象                          | 規則                                                             | 範例                                    |
| :---------------------------- | :--------------------------------------------------------------- | :-------------------------------------- |
| 一般變數、函式、屬性          | camelCase                                                        | `currentTarget`、`getTodos`             |
| React 元件、class             | PascalCase                                                       | `LoadingProcess`、`DrawerPage`          |
| 全域變數、全域 state、Context | PascalCase                                                       | `Context`、`InitialState`、`AlbumState` |
| 常數、環境變數                | SCREAMING_SNAKE_CASE                                             | `REST_PATH`、`VITE_TITLE`               |
| interface                     | `I` 開頭                                                         | `IState`、`IAction`、`IReactProps`      |
| type                          | `T` 開頭                                                         | `TContext`、`TModalState`               |
| enum                          | PascalCase，名稱以 `Type` 結尾                                   | `ActionType`、`AlertType`               |
| CSS class（自訂）             | kebab-case（`.button-group`）；其餘用 Tailwind / daisyUI utility |                                         |
| 元件資料夾                    | camelCase 資料夾 + `index.tsx`                                   | `components/loadingProcess/index.tsx`   |
| 非 `index` 的子檔案           | 小寫 / camelCase                                                 | `mainBar.tsx`、`tr.tsx`                 |

> 本專案的自訂 class 用 **kebab-case**（與姊妹專案 `template-vite-react` 的 PascalCase 根節點不同）。沿用本專案現況。

### 2.2 TypeScript

- 以 alias `@/` 匯入 `src` 內的檔案；同資料夾用 `./`。後端（`netlify/functions/`）不能用 `@/`，只能用相對路徑（如 `'../../../setting'`）。
- 元件 props 型別以 `T` 開頭（`TProps`）；需要 `children` 時用 `IReactProps`（`src/settings/type.ts`）。
- enum / type / interface 依 2.1 命名；全域共用型別放 `src/settings/type.ts`。
- `any` 在 ESLint 設為 `off`，但新程式碼優先寫明確型別。
- 提交前 `npm run build`（先跑 `tsc`）必須零錯誤；未使用的 import、變數、參數會直接報錯，要刪掉。

### 2.3 格式（Prettier）

- 單引號、`jsxSingleQuote: true`（JSX 屬性也用單引號）、`printWidth: 100`、2 空格、`trailingComma: all`。
- Tailwind class 排序由 `prettier-plugin-tailwindcss` 處理，不手動排。
- Markdown 用空格縮排，不用 tab。
- `.prettierrc` 有 `pluginSearchDirs: false`，新版 Prettier 會印警告 `Ignored unknown option`，可忽略。

### 2.4 React 慣例

- 元件用 `memo` 包裝並 `export default`（純展示、無內部狀態的簡單元件可不包）。
- 全域狀態一律 `useContext(Context)`（`@/settings/constant`）；只屬於某個元件的狀態用該元件自己的 Context（例：`album/config.tsx` 的 `AlbumContext`），不要塞進全域 `IState`。
- **資料請求一律走 `src/hooks/`**，元件內不要直接寫 `fetch` 或 `Fetcher`。
- 合併動態 class 用 `twMerge`（`tailwind-merge`）。
- 註解與介面文字沿用既有語言（程式註解多為英文，後台畫面中英文並存），不要為了統一而大範圍改寫。

### 2.5 檔案與文件同步

- 新增或修改元件、hook、API、設定時，**同一次修改**更新對應文件（見 [第 15 章](#15-修改後必須同步更新的文件)）。
- 不手動編輯 `public/mockServiceWorker.js`（由 `msw` 產生，`package.json` 的 `msw.workerDirectory` 指向 `public`）。
- 不提交 `.env*.local`、`dist/`、`package-lock.json`。
- **不要讀出、輸出、複製或 commit 任何 `.env*` 檔的實際值**；文件與回覆中只寫變數名稱。
- 不要把真實的金鑰、token、密碼寫進程式碼、文件或 commit。
- `typescript` 在 `.ncurc.json` 的 `reject` 清單內，升級依賴時不升 TypeScript。

### 2.6 禁止事項

- 不要手動編輯 `package-lock.json`、`dist/`、`node_modules/`。
- 除非使用者明確要求，不要執行 `npm run rm`（會刪除 `node_modules/`、`dist/`、`package-lock.json`）。
- 修改 `netlify.toml` 的 CORS / headers、`public/_redirects`、登入與權限邏輯前，先向使用者確認。
- 不要執行 `npm audit fix --force`（會把套件降到更舊的版本）；要修補子依賴請用 `package.json` 的 `overrides`，修改後執行 `npm install`、`npm audit`、`npm run build` 驗證。

## 3. 指令

| 指令              | 作用                                                                                                                                                                              |
| :---------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm install`     | 安裝依賴（用 npm）                                                                                                                                                                |
| `npm run dev`     | `node scripts/dev.js`：先跑 `netlify dev --dir=dist`（`localhost:8888`），等出現 `Local dev server ready` 再跑 `vite --host`（`5173`，HTTPS，自動開瀏覽器），`/api` 代理到 `8888` |
| `npm run build`   | `tsc && vite build`，輸出到 `dist/`                                                                                                                                               |
| `npm run preview` | 預覽 `dist/`                                                                                                                                                                      |
| `npm run lint`    | `eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0`（**目前無法執行**，見 17.1）                                                                          |
| `npm run deploy`  | 互動式選單：`gh-pages` / `netlify-draft` / `netlify-prod`（**不會先 build**）                                                                                                     |
| `npm run rm`      | 刪 `node_modules/`、`dist/`、`package-lock.json`（需使用者明確要求）                                                                                                              |

- 需要全域安裝 `netlify-cli`，Node v18 以上。
- 舊文件提過的 `npm run serve`、`npm run dev:serve` **不存在**，不要使用。
- 專案沒有測試框架。**目前可用的驗證**：`npx tsc --noEmit`（或 `npm run build`）+ 手動在瀏覽器確認；`npm run lint` 修好之前無法當驗證手段。

## 4. 目錄結構

```text
.
├── AGENTS.md                      # 本檔
├── README.md                      # 人類入口文件（環境變數、部署、已知限制）
├── netlify.toml                   # functions 設定、/api/* 轉發、CORS header、dev
├── tailwind.config.css            # Tailwind v4 + daisyUI
├── postcss.config.mjs
├── vite.config.ts
├── tsconfig.json / tsconfig.node.json
├── .env.defaults                  # 後端環境變數範本（只放變數名稱）
├── setting/                       # ★ 前後端共用：資料表定義（注意是單數）
│   ├── index.ts                   # SETTING、TType、IRespond、TUploadResult
│   ├── type.ts                    # IType、TUploadRespond、UploadBunnyCDNRespond…
│   └── README.md
├── netlify/functions/             # 後端
│   ├── api/                       # api.ts（Express 路由）、connect/select/insert/update/delete.ts
│   ├── models.ts                  # 依 SETTING 自動建立 mongoose model
│   ├── config.ts                  # messages、limit（10mb）
│   ├── type.ts                    # MongoServerStateType
│   └── README.md
├── scripts/                       # dev.js、deploy.js、misc.js、README.md
├── public/                        # 原樣複製到 dist/（含 _redirects、mockServiceWorker.js）
└── src/
    ├── components/                # 共用元件，一個元件一個資料夾，各有 README.md
    │   ├── album/ alert/ button/ confirm/ drawer/
    │   ├── loadingProcess/ modal/ tab/ tiptab/ userInfo/
    │   └── README.md              # 元件一覽表與撰寫規範
    ├── hooks/                     # useConnect/Login/Select/Insert/Update/Delete/Upload/Search/Remove/RemoveMany
    ├── mocks/                     # browser.ts、handlers.ts、README.md
    ├── pages/                     # ★ Vite root
    │   ├── index.html             # 模板：<%= title %> 由 vite-plugin-html 注入
    │   ├── index.tsx              # 進入點：Fetcher.install、MSW、掛載 <App />
    │   ├── app.tsx                # AdminApp / UserApp
    │   ├── router.tsx             # 登入流程與路由
    │   ├── home/ login/ user/ album/ editor/ error/
    │   └── .env.defaults          # 前端環境變數範本
    ├── settings/                  # ★ 前端全域設定（注意是複數）
    │   ├── constant.ts            # 初始值、Context、Reducer
    │   ├── type.ts                # ActionType、各 state 型別、IState、IAction、TContext
    │   ├── type-unity.ts          # 工具型別（Debug、Equal、ReadyOnly…）
    │   ├── config.ts              # REST_PATH、CAPTURE_PROPERTY
    │   ├── config.less            # 斷點變數 @SM/@MD/@LG
    │   └── global.css             # 引入 tailwind.config.css
    └── vite-env.d.ts              # ImportMetaEnv 型別
```

> **`setting/`（單數，資料表定義，前後端共用）與 `src/settings/`（複數，前端全域狀態與設定）是兩個不同的資料夾**，很容易搞混。

文件地圖（要做什麼先讀哪份 README）：

| 要做的事                       | 先讀                                                       |
| :----------------------------- | :--------------------------------------------------------- |
| 整體、環境變數、部署、已知限制 | [README.md](README.md)                                     |
| 頁面、路由、登入流程           | [src/pages/README.md](src/pages/README.md)                 |
| 全域狀態、列舉、`REST_PATH`    | [src/settings/README.md](src/settings/README.md)           |
| 呼叫 API 的 hooks              | [src/hooks/README.md](src/hooks/README.md)                 |
| 元件總覽與撰寫規範             | [src/components/README.md](src/components/README.md)       |
| 單一元件                       | `src/components/<名稱>/README.md`                          |
| 後端 API、資料模型             | [netlify/functions/README.md](netlify/functions/README.md) |
| 資料表 schema 與型別推導       | [setting/README.md](setting/README.md)                     |
| API Mock                       | [src/mocks/README.md](src/mocks/README.md)                 |
| 開發與部署腳本                 | [scripts/README.md](scripts/README.md)                     |

## 5. 環境變數

兩份獨立的 env：

| 位置                   | 範本                      | 讀取者                                                                                                   |
| :--------------------- | :------------------------ | :------------------------------------------------------------------------------------------------------- |
| 根目錄 `.env.local`    | 根目錄 `.env.defaults`    | **後端**：`api.ts` 的 `dotenv.config({ path: '.env.${NODE_ENV}' })`（`NODE_ENV=local` 讀 `.env.local`）  |
| `src/pages/.env.local` | `src/pages/.env.defaults` | **前端**：Vite 的 env 目錄是 `src/pages`（`loadEnv(mode, './src/pages')`）；只有 `VITE_` 前綴會進 bundle |

- 範本（`.env.defaults`）會提交，**Vite 與 dotenv 都不會自動載入它**；使用前複製成 `.env.local` 再改值。
- 前端以 `import.meta.env.VITE_XXX` 讀取。新增 `VITE_` 變數時同步 `src/vite-env.d.ts` 的 `ImportMetaEnv`、`src/pages/.env.defaults`、根目錄 README。
- 後端變數（無 `VITE_` 前綴）**不得在 `src/` 使用**。
- 正式環境的後端變數設在 Netlify 後台。

### 後端變數

| 變數                                                                                          | 必填            | 說明                                                                                                              |
| :-------------------------------------------------------------------------------------------- | :-------------- | :---------------------------------------------------------------------------------------------------------------- |
| `URI`                                                                                         | 是              | MongoDB 連線字串前半段。後端把 `URI` 與 `DATABASE` **直接相接**，所以 `URI` 結尾要有 `/`                          |
| `DATABASE`                                                                                    | 是              | 資料庫名稱                                                                                                        |
| `AMIN_EMAIL`                                                                                  | 是              | 超級管理員 email。**名稱拼成 `AMIN`（少了 D），是程式碼實際名稱，不要「修正」**，除非同時改完所有用到的地方與文件 |
| `CLOUD_STORAGE_TYPE`                                                                          | 否              | `cloudinary` 使用 Cloudinary，其他值或不填使用 BunnyCDN                                                           |
| `CLOUDINARY_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` / `CLOUDINARY_BASE_FOLDER` | Cloudinary 模式 | Cloudinary 設定                                                                                                   |
| `BUNNY_PASSWORD`                                                                              | BunnyCDN 模式   | Storage Zone 密碼，預設 `unset`                                                                                   |
| `BUNNY_STORAGE_ZONE`                                                                          | BunnyCDN 模式   | Storage Zone 名稱，預設 `demo`                                                                                    |
| `BUNNY_FOLDER_NAME`                                                                           | 否              | 根資料夾，預設空                                                                                                  |
| `BUNNY_REGION`                                                                                | 否              | 區域代碼，預設 `SG`                                                                                               |

### 前端變數

| 變數                       | 用途                                       |
| :------------------------- | :----------------------------------------- |
| `VITE_TITLE`               | `<title>`、og:title，同時顯示在後台導覽列  |
| `VITE_SUBSCRIPTION`        | og:description                             |
| `VITE_URL`                 | og:url；`gh-pages` 部署後開啟的網址        |
| `VITE_FACEBOOK_ID`         | `fb:app_id`                                |
| `VITE_DEFAULT_THEME`       | 預設 daisyUI 主題（注入 `index.html`）     |
| `VITE_404_CONTACT_ADDRESS` | 404 頁「Contact support」連結的 email      |
| `VITE_MOCKING`             | `'true'` 時啟動 MSW                        |
| `VITE_API_PATH`            | 正式環境 API 位址；未設定退回 `./api`      |
| `VITE_API_PATH_DEV`        | `location.hostname === 'localhost'` 時使用 |
| `VITE_AUTH0_DOMAIN`        | Auth0 網域                                 |
| `VITE_AUTH0_CLIENT_ID`     | 正式環境 Auth0 Client ID                   |
| `VITE_AUTH0_CLIENT_ID_DEV` | `localhost` 使用的 Client ID               |

Auth0 後台要把 `https://localhost:5173/admin` 與 `https://<網域>/admin` 加進 Allowed Callback URLs / Logout URLs / Web Origins。

## 6. 全域狀態（Context / Reducer）

檔案：`src/settings/type.ts`、`src/settings/constant.ts`。`app.tsx` 的 `AdminApp` 與 `UserApp` **各自**以 `useReducer(Reducer, InitialState)` 建立，經 `Context.Provider` 提供 `[state, dispatch]`。

### 6.1 型別

```ts
enum ActionType {
  LoadingProcess = 'loadingProcess',
  Status = 'status',
  Alert = 'alert',
  Modal = 'modal',
  User = 'user',
  Album = 'album',
}

// 注意：欄位全為必填（與姊妹專案 vite-react 的選填不同），讀取時不需要 ?.
interface IState {
  [ActionType.LoadingProcess]: TLoadingProcessState;
  [ActionType.Status]: TStatusState;
  [ActionType.Alert]: TAlertState;
  [ActionType.Modal]: TModalState;
  [ActionType.User]: TUserState;
  [ActionType.Album]: TAlbumState;
}

type TActionStateMap = IState; // 每個 ActionType 對應的 state 型別

// discriminated union：選了 type，state 只會提示並接受該區塊的欄位（可只傳部分）
type IAction = {
  [K in ActionType]: { type: K; state: Partial<TActionStateMap[K]> };
}[ActionType];

type TContext = [IState, Dispatch<IAction>];
```

| `ActionType`     | 初始值                | 欄位與預設                                                                                                  | 負責顯示的元件                  |
| :--------------- | :-------------------- | :---------------------------------------------------------------------------------------------------------- | :------------------------------ |
| `LoadingProcess` | `LoadingProcessState` | `enabled: false`、`type: Spokes`、`body: 'loading'`                                                         | `loadingProcess`                |
| `Status`         | `StatusState`         | `enabled: false`                                                                                            | **無**（目前沒有元件使用）      |
| `Alert`          | `AlertState`          | `enabled: false`、`type: Normal`、`body: 'message'`、`time: 5000`                                           | `alert`                         |
| `Modal`          | `ModalState`          | `enabled: false`、`title: 'title'`、`body: 'message'`、`label: 'close'`、`storage: {}`、`onClose: () => {}` | `modal`                         |
| `User`           | `UserState`           | `type: Guest`、`name: 'guest'`、`email: 'demo@host.com'`、`picture`（Gravatar 預設圖）、`token: ''`         | `drawer`（`userBar`、`navBar`） |
| `Album`          | `AlbumState`          | `folder: '*'`、`copiedText: ''`                                                                             | `album`、`tiptab`               |

### 6.2 使用

讀取：

```tsx
const [context, setContext] = useContext(Context);
const alert = context[ActionType.Alert]; // 不會是 undefined
```

更新（**淺層合併**到 `state[type]`，沒列出的欄位保持原值）：

```tsx
setContext({ type: ActionType.LoadingProcess, state: { enabled: true } });
setContext({
  type: ActionType.Alert,
  state: { enabled: true, type: AlertType.Success, body: '儲存成功' },
});
```

Reducer（`constant.ts`）：

```ts
export const Reducer = (state: IState, action: IAction): IState => {
  const { type, state: payload } = action;
  if (payload instanceof Object)
    return { ...state, [type]: { ...(state[type] as object), ...payload } };
  return { ...state, [type]: payload };
};
```

- `payload` 是物件 → 淺層合併進 `state[type]`；不是物件 → 整個取代。
- 因為是淺層合併，**傳 `{ enabled: false }` 不會清掉 `title`、`body`**；也因此 Modal 每次開啟都要完整傳入 `title`、`body`、`label`、`onClose`，否則會沿用上一次的值（見 8.3）。
- `Context` 預設值是 `[InitialState, () => {}]`：沒有 Provider 時 dispatch 什麼都不做，元件必須放在 `app.tsx` 提供的 Provider 之內。

### 6.3 新增一個全域 state

1. `type.ts`：`ActionType` 加成員（值為小寫 camelCase 字串）；新增 `TXxxState`；`IState` 加 `[ActionType.Xxx]: TXxxState`（`TActionStateMap` 等於 `IState`，不用另外補）。
2. `constant.ts`：建立 `XxxState` 初始值，加進 `InitialState`（key 用 `[ActionType.Xxx]`）——`InitialState: IState` 必填，漏了 `tsc` 會報錯。
3. 使用端用 `Context` 讀寫；需要顯示的全域元件，在 `app.tsx` 以 `enabled` 條件渲染。
4. 更新 [src/settings/README.md](src/settings/README.md) 與本章 6.1 表格。

### 6.4 與 `template-vite-react` 的對應

兩個專案的 `IAction` 與 `Reducer` 是同一份寫法。差異只有 state 欄位本身：

| 項目              | 本專案（mern）                                    | `template-vite-react`               |
| :---------------- | :------------------------------------------------ | :---------------------------------- |
| `IState` 欄位     | 全部必填                                          | 全部選填（`?`）                     |
| `TActionStateMap` | `= IState`                                        | 獨立型別，`Page` 項為 `PAGE` 的值   |
| `IAction.state`   | `Partial<TActionStateMap[K]>`                     | `Partial<TActionStateMap[K]>`       |
| `Reducer`         | 6 行版（見 6.2）                                  | 同左                                |
| `ActionType`      | LoadingProcess、Status、Alert、Modal、User、Album | Page、LoadingProcess、Sounds、Modal |

改動 `IAction` 或 `Reducer` 時，兩個專案要一起改。

## 7. 頁面與路由

完整說明見 [src/pages/README.md](src/pages/README.md)。

### 7.1 進入點 `src/pages/index.tsx`

載入順序：`import '@/settings/global.css'` → `Fetcher.install({ hostUrl, contentType: JSON, formatType: JSON })` → 若 `VITE_MOCKING === 'true'` 動態載入 `@/mocks/browser` 並 `worker.start({ serviceWorker: { url: './mockServiceWorker.js' } })` → 若 `#app` 沒有子節點，掛載 `<App />`。

`hostUrl`：`location.hostname === 'localhost'` → `VITE_API_PATH_DEV`；否則 `VITE_API_PATH || './api'`。

### 7.2 前台 / 後台分流（`app.tsx`）

`location.pathname.startsWith('/admin')` → `AdminApp`，否則 `UserApp`。

| 項目          | `AdminApp`（`/admin`）                                                   | `UserApp`（其他網址）              |
| :------------ | :----------------------------------------------------------------------- | :--------------------------------- |
| Auth0Provider | 有（`cacheLocation='localstorage'`，`redirect_uri = origin + '/admin'`） | 無                                 |
| Router        | `BrowserRouter basename='/admin'` → `RoutePages`                         | `BrowserRouter` → `UserRoutePages` |
| 全域元件      | `Modal`、`Alert`、`LoadingProcess`（依 `enabled` 條件渲染）              | **只有** `LoadingProcess`          |
| Context       | 各自獨立的 `useReducer`                                                  | 各自獨立的 `useReducer`            |

> 前台沒有 `Alert`、`Modal`；要在前台用，需自行在 `UserApp` 加上。兩個 App 的 state 互不相通。

### 7.3 後台登入流程（`router.tsx`）

1. `RoutePages` 載入時呼叫 `useConnect` 喚醒資料庫連線（`!res` 才呼叫）。
2. 顯示：Auth0 `isLoading` → `<LoadingProcess />`；`user` 存在 → `<UserPage />`；否則 `<Login />`。
3. `UserPage`：把 `<html data-theme>` 設為 `valentine`；拿到 Auth0 `user` 後呼叫 `useLogin`；`res` 為 `true` 就 `setContext({ type: ActionType.User, state: { token, email, name, picture, type } })`；失敗則 `window.location.href = '/'`。
4. `context[ActionType.User].token` 有值才渲染 `DrawerPage`（`Drawer` + `Routes`），否則顯示 `<LoadingProcess />`（以一般元件使用，沒傳設定）。

### 7.4 路由表

| 網址（含 `/admin` 前綴） | 頁面                        | 權限                             |
| :----------------------- | :-------------------------- | :------------------------------- |
| `/admin`、`/admin/home`  | `home`                      | 登入即可                         |
| `/admin/user`            | `user`                      | 僅 `admin`，其他權限導向 `/home` |
| `/admin/album`           | `album`                     | 登入即可                         |
| `/admin/editor`          | `editor`                    | 登入即可                         |
| 其他                     | `error`（404，`lazy` 載入） | —                                |
| 前台 `/`                 | `home`（`lazy` 載入）       | —                                |
| 前台 `*`                 | `error`                     | —                                |

**權限檢查只存在前端畫面**，後端 API 不驗證（見 [第 10 章](#10-後端-apinetlify-functions)）。

### 7.5 各頁面重點

| 頁面     | 重點                                                                                                                                                                                             |
| :------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `home`   | 空白佔位（`TODO: home page`），前後台共用                                                                                                                                                        |
| `login`  | Auth0 圖片 + 「登入」按鈕，呼叫 `loginWithRedirect()`；圖片放 `login/img/`                                                                                                                       |
| `user`   | 僅 `admin`；進入時 `useSelect` 取 `SETTING.mongodb[0]`（user）全部資料；`add.tsx` 新增（先取全部，email 重複就報錯），`delete.tsx` 刪除；新增的使用者 email 與 Auth0 登入 email 相同即可通過驗證 |
| `album`  | 只包 `album` 元件                                                                                                                                                                                |
| `editor` | `useSelect` 取 `editor` collection；**只讀寫第一筆**（有資料 `useUpdate`，沒有 `useInsert`）；成功顯示綠色 Alert                                                                                 |
| `error`  | 404；「Contact support」連結用 `VITE_404_CONTACT_ADDRESS`                                                                                                                                        |

### 7.6 新增頁面

1. 建立 `src/pages/<name>/index.tsx`（`memo` + `export default`），需要樣式再加 `index.less`。
2. 後台：到 `router.tsx` 的 `DrawerPage` 加 `<Route path='/<name>' element={<Name />} />`；要權限限制就仿 `user/index.tsx`，在 `useEffect` 檢查 `context[ActionType.User].type`。
3. 前台：到 `UserRoutePages` 加路由。
4. 要出現在側邊欄：改 `components/drawer/mainBar.tsx`。
5. 靜態部署：`public/_redirects` 加 `/<path>  /index.html  200`，否則重新整理會 404（目前只有 `/admin`、`/album`）。
6. 更新 [src/pages/README.md](src/pages/README.md)。

## 8. 元件規格

總表與撰寫規範見 [src/components/README.md](src/components/README.md)，單一元件的完整 Props / 流程見 `src/components/<名稱>/README.md`。

### 8.0 元件一覽

| 元件             | 類型     | 誰渲染                                       | 資料來源                         |
| :--------------- | :------- | :------------------------------------------- | :------------------------------- |
| `loadingProcess` | 全域提示 | `app.tsx`（`enabled` 時）；登入流程也直接用  | `context.loadingProcess`         |
| `alert`          | 全域提示 | `app.tsx`（僅 `AdminApp`）                   | `context.alert`                  |
| `modal`          | 全域提示 | `app.tsx`（僅 `AdminApp`）                   | `context.modal`                  |
| `confirm`        | 通用     | 使用端（條件渲染）                           | Props                            |
| `button`         | 通用     | 使用端                                       | Props                            |
| `tab`            | 通用     | 使用端                                       | Props                            |
| `drawer`         | 版型     | `router.tsx` 的 `DrawerPage`                 | `context.user`、`SETTING`        |
| `album`          | 功能     | `pages/album`、`tiptab/menu.tsx`（Modal 內） | `AlbumContext` + `context.album` |
| `tiptab`         | 功能     | `pages/editor`                               | Props + `context.modal/album`    |
| `userInfo`       | 版型     | **無人使用**                                 | `context.user`                   |

`loadingProcess`、`alert`、`modal` **不要自己 `<Alert />` 放進畫面**，只更新全域狀態，由 `app.tsx` 渲染。

### 8.1 `LoadingProcess`

- 無 props；`absolute top-0 z-50` 全螢幕遮罩，`bg-base-300` 50% 透明。
- 開關：`setContext({ type: ActionType.LoadingProcess, state: { enabled: true } })`；`body` 設 `''` 則不顯示文字。
- `LoadingProcessType`：`Ball='balls'`、`Bars`、`Bubbles`、`Cubes`、`Cylon`、`Spin`、`SpinningBubbles='spinningBubbles'`、`Spokes`。值同時是 `index.less` 的 class 名，與 `svg/loading-<name>.svg` 的 `mask-image` 對應。
- 新增圖示：加 svg → `index.less` 加同名 class → enum 加成員。
- 大部分 API hook 會自動開關它（`useSelect` 例外）。

### 8.2 `Alert`

- 無 props；`fixed right-1 bottom-1 z-50`（在 Modal `z-40` 之上）。
- 欄位：`enabled`、`type: AlertType`（`Normal=''`、`Info='alert-info'`、`Success`、`Warning`、`Error`，值是 daisyUI class）、`body: ReactNode`、`time`（毫秒，預設 5000）。
- 每當 `body` 改變就重設計時器，`time` 後把 `enabled` 設 `false`。**連續送出完全相同的 `body`，計時器不會重設**，第一次倒數結束就會關。
- 後出現的取代先前的，不堆疊。圖示在 `alert/icon.tsx`。

### 8.3 `Modal`

- 無 props；`modal modal-open` 固定顯示，最大寬 `max-w-7xl`（11/12）、最大高 10/12 螢幕。
- 欄位：`enabled`、`title`、`body: ReactNode`、`label: string | string[]`（字串一顆按鈕，陣列多顆，`key` 用文字本身，**不可重複**）、`onClose(label?)`、`storage`（保留欄位，元件不使用）。
- 行為：按底部按鈕 → 先呼叫 `onClose(按鈕文字)` 再關閉；**點背景、右上角 ✕ 只關閉，不呼叫 `onClose`**。
- ⚠ **沒傳的欄位會沿用上一次的值**（淺層合併）。每次開啟都完整傳 `title`、`body`、`label`、`onClose`。

```tsx
setContext({
  type: ActionType.Modal,
  state: {
    enabled: true,
    title: '刪除確認',
    body: <p>確定要刪除嗎？</p>,
    label: ['取消', '刪除'],
    onClose: (label) => {
      if (label === '刪除') doDelete();
    },
  },
});
```

### 8.4 `Confirm`

Props（皆必填）：`body: string`、`onConfirm()`、`onCancel()`。顯示「Deny / Accept」兩顆按鈕的橫列（daisyUI `alert rounded-none`，填滿父層寬度）。**元件不會自己關閉**，由父層條件渲染，所以兩個 callback 內都要記得關掉。按鈕文字固定英文。需要置中彈出式確認請改用 `Modal`。

### 8.5 `Button`

Props：`children`、`className`（`twMerge('btn', className)`，後者覆蓋）、`onClick: () => void`（**不會收到 event**）。沒有 `type`、`disabled`，在 `<form>` 內會變 submit；需要時自行擴充 Props 或用原生 `<button type='button'>`。

### 8.6 `Tab`

`<Tab>` + `<Tab.Panel label id? defaultChecked?>`，用 daisyUI `tabs` + radio 實作。

- ⚠ 所有 radio 的 `name` 固定為 `'tab'`，**同一畫面只能有一組 `Tab`**（在 Modal 內開相簿時，背景頁面若也有 `Tab` 會互相影響）。
- 至少一個 `Tab.Panel` 要 `defaultChecked`。
- 面板內容永遠渲染（CSS 隱藏），切換不卸載。
- 程式切換分頁：`document.querySelector<HTMLInputElement>('#Manage')?.click()`（`album/upload.tsx` 用這招）。`id` 全頁唯一。

### 8.7 `Drawer`

後台外框：`Drawer` props 只有 `children`。使用 daisyUI `drawer lg:drawer-open`，開關靠 id 為 `my-drawer-2` 的 checkbox（頁面中不要再用同 id）。

- `navBar.tsx`：選單（僅 `admin` 看得到「使用者列表」→ `/user`）、標題 `VITE_TITLE`、主題切換（`luxury` ↔ 預設，存 `lesca-local-storage` 的 `theme` 鍵；`luxury` 寫死在 `navBar.tsx`）；`NavBarMobile` 為手機版。
- `mainBar.tsx`：TOOLS（`Album`、`Editor`）+ COLLECTION LIST（依 `SETTING.mongodb` 自動產生，**略過 index 0**，連結 `/<collection>`）。檔內有 `TODO: add type for collection`。
- `userBar.tsx`：頭像、名稱、權限（`admin`管理員 / `inHouse`內部人員 / `user`使用者 / `guest`訪客）、登出（Auth0 `logout()`）。
- 必須在 `BrowserRouter`、`Context.Provider`、Auth0 Provider 內使用。

### 8.8 `Album`

無 props。圖片管理：Manage 分頁（瀏覽、勾選多選、`open` / `copy` / `delete`）與 Upload 分頁（`lesca-react-capture-button` 選圖，依 `CAPTURE_PROPERTY` 縮到最大寬 500px、壓縮 0.3）。

**兩份狀態，不要混淆**：

| 狀態                                 | 範圍     | 內容                                                                                                |
| :----------------------------------- | :------- | :-------------------------------------------------------------------------------------------------- |
| `AlbumContext`（`album/config.tsx`） | 元件內部 | 刪除確認流程：`enabled`、`body`、`public_id: string[]`、`submit`                                    |
| `context[ActionType.Album]`          | 全域     | `folder`（`'*'` 為根目錄，改變時 `useSearch` 自動重查）、`copiedText`（最近複製的網址，編輯器取用） |

流程：進頁面 `useSearch` → 按 delete 設定 `AlbumContext` 顯示 `Confirm` → Accept 後 `submit=true` → `list.tsx` 偵測並呼叫 `useRemove`（1 筆）或 `useRemoveMany`（多筆）→ Alert + 列表重載（`reload` key + 1）。按 `copy` → 複製網址、Alert、寫入 `copiedText`、關閉 Modal。

檔案：`index.tsx`（容器）、`config.tsx`、`list.tsx`、`table.tsx`、`tr.tsx`、`upload.tsx`。

注意：

- 傳給刪除 API 的識別值：勾選框 `pixels === 0` 用 `secure_url` 否則 `public_id`；單張 delete 按鈕固定 `public_id`；資料夾 delete 用 `secure_url`。**BunnyCDN 模式下單張刪除是否可行尚未實測**（後端收的是 `href`）。
- 確認列文字寫「from cloudinary」，即使用 BunnyCDN。
- 上傳後後端轉 WebP，最終格式永遠 `.webp`。
- `tr.tsx` 的 `key` 用 `JSON.stringify(item)`，列表大時有效能成本。

### 8.9 `Tiptab`

Props：`html: string`（與編輯器目前內容不同時會自動覆蓋）、`onSave(html)`（元件不會自己儲存）。

- 擴充：`StarterKit`、`TextStyle`、`Image`（`inline: true`、可縮放、固定長寬比）。新增功能：`index.tsx` 的 `extensions` 加擴充 + `menu.tsx` 加按鈕。
- 插圖流程：工具列「新增圖片」→ 開 Modal（`title: 'Album'`，`body: <Album />`）→ 相簿 `copy` 寫入 `album.copiedText` 並關 Modal → Modal 關閉時（標題為 `Album` 且 `enabled` 變 `false`）把 `copiedText` 當 `src` 插入游標處。
- 需在 `Context.Provider` 內使用；編輯區 `prose`（`@tailwindcss/typography`）、`min-h-44`。
- 儲存的是 HTML；若用 `dangerouslySetInnerHTML` 顯示使用者輸入，請先淨化（XSS）。
- `index.less` 引用 `var(--purple-light)`、`var(--black)`，`global.css` 沒定義，實際是瀏覽器預設色。

### 8.10 `UserInfo`

使用者資訊側欄版型（`children`），**目前沒有任何頁面使用**，後台已改用 `drawer`。含除錯殘留（空 `<div className='llll'>`、常駐 `loading-spinner`）。刪除前先確認。

### 8.11 新增元件

1. 建 `src/components/<name>/index.tsx`（camelCase 資料夾、`memo` + `export default`）。
2. 同資料夾寫 `README.md`（用途、基本用法、Props 表、行為、注意事項；格式見 [src/components/README.md](src/components/README.md)）。
3. 在 `src/components/README.md` 的「元件一覽」加一列；本章 8.0 也加一列。
4. 若是全域提示類：新增全域 state（見 6.3），並在 `app.tsx` 條件渲染。

## 9. Hooks 規格

完整範例見 [src/hooks/README.md](src/hooks/README.md)。

### 9.1 共通規則

```ts
const [respond, run] = useXxx(); // readonly [state, fetch]
```

- `respond` 一開始是 `undefined`，每次 `run` 都會**覆蓋**上一次；用 `useEffect` 監聽它處理結果。同一畫面要同時處理多個請求就各自用獨立的 hook。
- 大部分 hook 在請求前後自動開關 `LoadingProcess`；**`useSelect` 不會**。
- **後端一律 HTTP 200**，用 `respond.res`（`boolean`）判斷成功，失敗原因在 `respond.msg`。
- hook 要在 `Context.Provider` 內使用（呼叫 `useContext(Context)`），`useSelect` 例外。
- 回應型別：`IRespond = { res, msg, collection, data: TType[] }`；相簿用 `TUploadResult`（`data: TUploadRespond[]`）；`useLogin` 是 `{ res, type, token }`（不是 `IRespond`）。

### 9.2 Hook 一覽

| Hook            | 檔案               | `run` 參數                                          | API               | 備註                                                                     |
| :-------------- | :----------------- | :-------------------------------------------------- | :---------------- | :----------------------------------------------------------------------- |
| `useConnect`    | `useConnect.ts`    | 無                                                  | `GET connect`     | `RoutePages` 載入時呼叫一次                                              |
| `useLogin`      | `useLogin.ts`      | Auth0 `User`（至少 `email`）                        | `POST login`      | 成功自動 `Fetcher.setJWT(token)`                                         |
| `useSelect`     | `useSelect.ts`     | `{ collection }`                                    | `POST select`     | **不開 Loading**；`data` 是 `TType[]`，要特定型別用 `as TType<'user'>[]` |
| `useInsert`     | `useInsert.ts`     | `{ collection, data }`（可省略 `timestamp`）        | `POST insert`     | `respond.data[0]` 是新文件（含 `_id`）                                   |
| `useInsertMany` | `useInsert.ts`     | 同上                                                | `POST insertMany` | 與 `useInsert` 共用 `TArgument`，`data` 型別仍是單筆，傳陣列要轉型       |
| `useUpdate`     | `useUpdate.ts`     | `{ collection, data: { _id, data: {要改的欄位} } }` | `POST update`     | 欄位可只傳部分                                                           |
| `useDelete`     | `useDelete.ts`     | `{ collection, data: { _id } }`                     | `POST delete`     |                                                                          |
| `useUpload`     | `useUpload.ts`     | `{ image: base64含前綴, folder }`                   | `POST upload`     | `folder` 空字串為根目錄；單次上限 10MB                                   |
| `useSearch`     | `useSearch.ts`     | `{ folder }`（`'*'` 根目錄）                        | `POST search`     | **載入時自動查一次**，`album.folder` 改變也會重查；例外時 `alert()`      |
| `useRemove`     | `useRemove.ts`     | `{ public_id }`                                     | `POST remove`     | BunnyCDN 模式後端當作 `href`                                             |
| `useRemoveMany` | `useRemoveMany.ts` | `{ public_ids: string[] }`                          | `POST removeMany` |                                                                          |

### 9.3 新增 hook

1. `src/settings/config.ts` 的 `REST_PATH` 加路徑。
2. 複製最接近的 hook（例如 `useDelete.ts`）：定義 `TArgument`；請求前 `setContext({ type: ActionType.LoadingProcess, state: { enabled: true } })`、請求後關閉；回傳 `[state, fetch] as const`。
3. 補 `src/mocks/handlers.ts`、`src/hooks/README.md`。

## 10. 後端 API（Netlify Functions）

完整說明見 [netlify/functions/README.md](netlify/functions/README.md)。

### 10.1 請求路徑

```text
前端 POST /api/select
  → netlify.toml [[redirects]] 或 public/_redirects
  → /.netlify/functions/api/select
  → serverless-http → Express router.post('/select')
```

本機 `netlify dev` 在 `8888`，Vite 把 `/api` 代理過去。`netlify.toml`：`node_bundler='esbuild'`、`external_node_modules=['express']`、所有路徑加 `Access-Control-Allow-Origin: *`。前端一律呼叫 `/api/...`。

### 10.2 路由

所有路由在 `netlify/functions/api/api.ts`，路徑名稱取自 `REST_PATH`（後端也 import `src/settings/config`，所以那個檔案**不能引入瀏覽器專屬的東西**）。除 `connect` 外，每條路由先 `await connect()`，連不上回 `{ res: false, msg: messages.connectError }`。

| 方法與路徑             | 請求                                          | 成功回應                                       | 處理檔                       |
| :--------------------- | :-------------------------------------------- | :--------------------------------------------- | :--------------------------- |
| `POST /api/login`      | Auth0 user（`email`、`name?`、`updated_at?`） | `{ res: true, token, type }`                   | `api.ts`                     |
| `GET /api/connect`     | —                                             | `{ res, msg }`                                 | `connect.ts`                 |
| `POST /api/select`     | `{ collection }`                              | `{ res, msg, collection, data }`               | `select.ts`                  |
| `POST /api/insert`     | `{ collection, data }`                        | 同上，`data: [新文件]`                         | `insert.ts`                  |
| `POST /api/insertMany` | `{ collection, data: [...] }`                 | 同上                                           | `insert.ts`                  |
| `POST /api/update`     | `{ collection, data: { _id, data } }`         | `{ res, msg, collection }`                     | `update.ts`                  |
| `POST /api/delete`     | `{ collection, data: { _id } }`               | `{ res, msg, collection }`                     | `delete.ts`                  |
| `POST /api/upload`     | `{ image, folder? }`（Base64 含前綴）         | `data` 為 `TUploadRespond`                     | `api.ts`（sharp → WebP q80） |
| `POST /api/search`     | `{ folder }`                                  | 資料夾內容（BunnyCDN：`'*'` 為根，資料夾排前） | `api.ts`                     |
| `POST /api/remove`     | `{ public_id }`                               | —                                              | `api.ts`                     |
| `POST /api/removeMany` | `{ public_ids: [] }`                          | —                                              | `api.ts`                     |

- 請求大小上限 `limit = '10mb'`（`netlify/functions/config.ts`）；回應訊息文字集中在同檔的 `messages`。
- 圖片儲存由 `CLOUD_STORAGE_TYPE` 決定（`cloudinary` 或 BunnyCDN）；兩種模式回傳結構一致（`TUploadRespond`）。BunnyCDN 模式很多欄位（`width`、`height`…）填 `0`，相簿元件會在瀏覽器端自行量測。

### 10.3 登入邏輯（`POST /api/login`）

1. 資料庫連不上 → `{ res: false, msg }`。
2. `body.email === process.env.AMIN_EMAIL` → `admin`，名稱預設 `super user`。
3. 否則讀 `SETTING.mongodb[0]`（user collection），找相同 email 的使用者採用其 `type`。
4. 找不到 → `{ res: false, type: 'guest' }`。

token = `Atobtoa.toBase64({ type, name, email, timestamp })`，**只是 Base64，不是簽章 JWT**。

### 10.4 資料模型（`models.ts`）

讀 `SETTING.mongodb`，為每個 collection 建立 mongoose model（`versionKey: false`）。

| schema 設定                         | mongoose                                                                                   |
| :---------------------------------- | :----------------------------------------------------------------------------------------- |
| `IType.String`（或未指定）          | `String`                                                                                   |
| `IType.Number` / `Boolean` / `Date` | `Number` / `Boolean` / `Date`                                                              |
| `IType.Array` / `IType.Object`      | **未處理，退回 `String`**                                                                  |
| `required: true`                    | 必填                                                                                       |
| `default: 'Date.now()'`             | 預設為建立當下時間                                                                         |
| `default: 其他值`                   | 當預設值，但只有**真值**才會設定（`0`、`false` 會被忽略，因為判斷是 `if (value.default)`） |

### 10.5 安全現況（已知限制，非 bug）

- **後端沒有任何驗證**，token 可偽造，CORS 為 `*`，`collection` 名稱由前端傳入。這是範本的已知限制（見根目錄 README「已知限制與安全注意事項」）。
- 不要在使用者沒要求時當成 bug 順手改；但也**不要假設後端會擋住未授權請求**。使用者要求做權限時，先詢問做法（JWT / 驗證 Auth0 token / middleware / CORS 範圍）。

## 11. 資料表定義（`setting/`）

完整說明見 [setting/README.md](setting/README.md)。這是**前後端共用**的單一來源：後端據此建 model，前端據此推導型別。

```ts
export const SETTING = {
  mongodb: [
    { collection: 'user', schema: { userName, email, type, timestamp } }, // index 0
    { collection: 'editor', schema: { html, timestamp } },
  ],
} as const; // ← 必須保持 as const，型別推導才會成立
```

- 欄位設定：`type`（`IType.String | Number | Boolean | Date | Array | Object`）、`required`、`default`（`'Date.now()'` 字串代表當下時間）。
- 型別推導：`TType`（所有 collection 聯集）、`TType<'user'>`（指定 collection）。`collection` 名稱被限制成字面值，拼錯會報錯。
- 其他匯出：`IRespond`、`TUploadResult`（`setting/index.ts`）；`IType`、`TUploadRespond`、`UploadBunnyCDNRespond`、`CloudinaryUploadedResult`（`setting/type.ts`）。
- ⚠ **`SETTING.mongodb[0]` 是使用者資料表**：登入、`user` 頁、導覽列「使用者列表」都用 index 0。**不要調換順序**；新 collection 加在後面。`MainBar` 的 COLLECTION LIST 略過 index 0。
- 修改既有欄位**不會**遷移資料庫已有的資料。
- `insert` / `update` 不驗證欄位名稱是否在 schema 內，多餘欄位會被 mongoose strict 模式忽略。
- 新增 collection 後，側邊欄會自動出現連結 `/<collection>`，但頁面要自己建，否則 404。

## 12. Mock（MSW）

完整說明見 [src/mocks/README.md](src/mocks/README.md)。

- `VITE_MOCKING=true` 才啟動；worker 檔 `public/mockServiceWorker.js` 由 `index.tsx` 以 `./mockServiceWorker.js` 載入。
- `src/mocks/browser.ts`：`setupWorker(...handlers)`；`src/mocks/handlers.ts` 用 **msw v3 API**：`http.get / http.post` + `HttpResponse.json(...)`（**不是**舊版 `rest` / `res(ctx...)`）。
- 路徑一律 `mergePath(REST_PATH.xxx)`（來自 `lesca-fetcher`），才會和 `Fetcher` 實際網址一致。
- 回應格式要符合 `IRespond`（`{ res, msg, collection, data }`），前端才會正常運作。
- 目前 handlers 只有 `GET connect`（回傳 faker 假資料，欄位與真實 `{ res, msg }` **不同**，只是範例）與 `GET /api`（404 `Out Of Service`）。依賴 `respond.res` 的流程要自己補 handler。
- 沒被 handler 比對到的請求會 passthrough。正式環境不要開啟。

## 13. 樣式（Tailwind v4 + daisyUI + Less）

- `src/settings/global.css` 引入 `tailwind.config.css`（Tailwind 4 + daisyUI 5，啟用全部主題）；`src/pages/index.tsx` 已 import。
- 絕大多數樣式用 Tailwind / daisyUI class 寫在 JSX（`btn`、`alert`、`modal`、`tabs`、`drawer`…）。**不要寫死 hex 色碼**，用 daisyUI 語意色（`bg-primary`、`text-base-content`、`bg-base-300`…），這樣才會跟著主題變。
- 主題：`index.html` 注入 `VITE_DEFAULT_THEME`；`UserPage` 會把 `<html data-theme>` 設成 `valentine`；`navBar` 可切到 `luxury`（存 `localStorage` 的 `theme`）。
- 只有 `loadingProcess` 與 `tiptab` 需要 `.less`（`mask-image`、編輯器內容樣式）；`pages/user/index.less` 處理頁面高度。Less 斷點在 `src/settings/config.less`：`@SM: 768px; @MD: 1024px; @LG: 1280px`。`vite.config.ts` 設定了 Less `math: 'always'` 與全域變數 `mainColor`。
- 合併動態 class 用 `twMerge`。

## 14. 部署與腳本

完整說明見 [scripts/README.md](scripts/README.md) 與根目錄 README。

`npm run deploy`（`scripts/deploy.js`）：

| 選項            | 實際執行                                    | 備註                                     |
| :-------------- | :------------------------------------------ | :--------------------------------------- |
| `gh-pages`      | `npx gh-pages -d dist`，完成後開 `VITE_URL` | **只有靜態前端，沒有 API，後台無法運作** |
| `netlify-draft` | `netlify deploy --dir=dist --json`          | 預覽部署，開啟 Draft URL                 |
| `netlify-prod`  | `netlify deploy --prod --dir=dist --json`   | 正式部署                                 |

- **不會自動 build**：部署前先 `npm run build`，否則上傳舊的 `dist/`。
- Netlify 需先 `netlify login`，再 `netlify link` 或 `netlify sites:create`。
- `scripts/misc.js` 的 `openUrl` 用 macOS `open` 指令；Windows / Linux 需改 `start` / `xdg-open`。
- `dev.js` 卡住通常是 `netlify dev` 沒印出 `Local dev server ready`（CLI 改了輸出、需登入或連結站台）；單獨跑 `npx netlify dev --dir=dist` 看錯誤。
- `vite.config.ts`：`base: './'`、`server.port=5173`、`server.open=true`、`proxy['/api']='http://localhost:8888'`、`vite-plugin-mkcert`（首次會安裝本機憑證，可能要輸入電腦密碼）。
- `public/_redirects` 目前有 `/api/*`、`/admin`、`/album` 三條。

## 15. 修改後必須同步更新的文件

| 你改了                                          | 要同步更新                                                                                                                 |
| :---------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------- |
| 元件的 Props、行為、檔案                        | `src/components/<名稱>/README.md`；新增 / 刪除元件還要更新 `src/components/README.md` 一覽表與本檔 8.0                     |
| 新增或修改 hook                                 | `src/hooks/README.md`、本檔第 9 章                                                                                         |
| `REST_PATH`、全域狀態欄位、列舉                 | `src/settings/README.md`、本檔第 6 章                                                                                      |
| `src/settings/type.ts` 的 `IAction` / `Reducer` | 本檔 6.2、6.4，**並同步 `template-vite-react`**                                                                            |
| API 路由、請求或回應格式                        | `netlify/functions/README.md`、對應 hook 與 mock、本檔第 10 章                                                             |
| `setting/index.ts` 的 schema                    | `setting/README.md`、本檔第 11 章                                                                                          |
| 頁面、路由、權限                                | `src/pages/README.md`、本檔第 7 章                                                                                         |
| 環境變數                                        | 根目錄 `README.md` 環境變數表、對應的 `.env.defaults`（只放變數名稱與空值 / 範例值）、`vite-env.d.ts`（前端）、本檔第 5 章 |
| `npm run` 指令、腳本                            | 根目錄 README「常用指令」、`scripts/README.md`、本檔第 3、14 章                                                            |
| 專案規則、結構、陷阱                            | 本檔                                                                                                                       |

文件撰寫原則：繁體中文、給不熟悉專案的人讀；先寫「這是什麼、怎麼用」再寫細節；範例要能直接複製；只寫程式碼實際做到的事，不確定或沒驗證的行為要明說，不要編造。

## 16. 常見任務步驟

### 16.1 新增 collection

1. `setting/index.ts` 的 `SETTING.mongodb` **尾端**加項目（保持 `as const`）。
2. 後端 model 自動產生、前端型別自動推導，不用改 `netlify/functions`。
3. 用現有 hooks 操作（`useSelect`、`useInsert`…）。
4. 需要頁面時依 7.6 建立；側邊欄會自動列出連結。
5. 更新 `setting/README.md`。

### 16.2 新增 API

1. `netlify/functions/api/` 新增處理函式（沿用 `new Promise<IRespond>` 與 `messages`，先確認連線再操作 DB）。
2. `api.ts` 註冊路由（先 `connect()`，連不上回 `messages.connectError`，一律 `res.status(200).json(...)`）。
3. `src/settings/config.ts` 的 `REST_PATH` 登記。
4. `src/hooks/` 新增 hook（見 9.3）。
5. `src/mocks/handlers.ts` 補 mock（msw v3 寫法）。
6. 更新 `netlify/functions/README.md`、`src/hooks/README.md`、`src/mocks/README.md`、`src/settings/README.md`。

### 16.3 新增全域 state

見 6.3。

### 16.4 新增元件 / 頁面 / hook

見 8.11、7.6、9.3。

### 16.5 新增環境變數

- 前端：`src/pages/.env.defaults`、`src/vite-env.d.ts`、根目錄 README。
- 後端：根目錄 `.env.defaults`、根目錄 README、Netlify 後台。
- 兩者都要同步本檔第 5 章。

### 16.6 升級依賴

`.ncurc.json` 把 `typescript` 放在 `reject`，不升 TypeScript。升級後跑 `npx tsc --noEmit`、`npm run build`，並手動確認 `npm run dev` 可啟動。

## 17. 已知問題

下列是目前已知、尚未處理的問題。**修改相關檔案時順手修正並更新本節**；沒被要求時不要擅自大改。

1. **`npm run lint` 目前無法執行**：專案裝的是 ESLint 10，需要 `eslint.config.*`（flat config），但專案仍是舊式 `.eslintrc.cjs`，`npx eslint src` 會報 `couldn't find an eslint.config.* file`。修復方向是改寫成 flat config（可參考 `template-vite-react` 的 `eslint.config.js`）。修好前驗證只能靠 `npx tsc --noEmit` / `npm run build`。
2. **`netlify/functions/api/api.ts` 上傳路由有除錯殘留** `console.log(folder)`。
3. **圖片類路由的刪除失敗訊息**在 `catch` 內用了 `uploadError`，所以錯誤文字顯示 `Upload failed`。
4. **已修正**：兩份 `.env.defaults` 已補齊所有程式碼使用的變數，`vite-env.d.ts` 也補上 `VITE_API_PATH_DEV`、`VITE_AUTH0_CLIENT_ID_DEV`。新增變數時請四處同步（見 5 章）。
5. **`Cloudinary` 的 `remove` / `removeMany`** 沒有檢查路徑是否在 `CLOUDINARY_BASE_FOLDER` 之內。
6. **`models.ts` 不支援 `IType.Array` / `IType.Object`**（退回 `String`），且 `default` 為 `0` / `false` 會被忽略。
7. **`mocks/handlers.ts` 的 `connect` handler** 回傳欄位與真實 API 不符。
8. **`Tab` 的 radio `name` 固定**，同畫面只能一組。
9. **`userInfo` 元件、`ActionType.Status`、`TransitionType` 沒有被使用**，刪除前先確認。
10. **`album` 的 BunnyCDN 單張刪除**是否能成功尚未實測。
11. **`tiptab/index.less`** 引用未定義的 CSS 變數。
12. **前台（`UserApp`）沒有 `Alert`、`Modal`**，兩個 App 的 Context 互不相通。
13. **後端無驗證**（見 10.5）——已知限制，不是待修 bug，除非使用者要求。

## 18. 完成前檢查清單

- [ ] `npx tsc --noEmit` / `npm run build` 零錯誤（`npm run lint` 修好前無法使用）。
- [ ] 沒有未使用的 import / 變數 / 參數。
- [ ] 命名符合 2.1；前端匯入使用 `@/`，後端使用相對路徑。
- [ ] 資料請求都走 `src/hooks/`，元件內沒有直接 `fetch`。
- [ ] 沒有寫死的色碼、API 網址、密碼；沒有讀出或輸出 `.env*` 的實際值。
- [ ] 動到 `IAction` / `Reducer` / `ActionType` 時，姊妹專案 `template-vite-react` 已同步。
- [ ] 對應文件已依第 15 章同步更新（含本檔與各資料夾 `README.md`）。
- [ ] 沒有提交 `.env*.local`、`dist/`、`package-lock.json`。
