# pages：應用程式進入點、路由與頁面

這裡是 React 應用程式的根目錄（Vite 的 `root` 設定為 `src/pages`），包含 HTML 範本、啟動程式、路由與各個頁面。

## 檔案一覽

| 路徑            | 說明                                                                |
| :-------------- | :------------------------------------------------------------------ |
| `index.html`    | HTML 範本，`<%= title %>` 等變數由 `vite-plugin-html` 在建置時填入  |
| `index.tsx`     | 啟動程式：初始化 `Fetcher`、視需要啟用 MSW、掛載 React              |
| `app.tsx`       | 依網址決定載入後台（`AdminApp`）或前台（`UserApp`），並建立全域狀態 |
| `router.tsx`    | 後台與前台的路由、登入流程                                          |
| `home/`         | 首頁（目前只是空白佔位）                                            |
| `login/`        | 登入頁（`index.tsx`）與登入被拒絕時的畫面（`failed.tsx`）           |
| `user/`         | 使用者管理頁（僅管理員）                                            |
| `album/`        | 相簿頁                                                              |
| `editor/`       | 富文字編輯頁                                                        |
| `error/`        | 404 頁                                                              |
| `LICENSE`       | MIT 授權文字                                                        |
| `.env.defaults` | 前端環境變數範本，複製成 `.env.local` 使用                          |

## 啟動流程

```text
index.html
  └─ index.tsx
       ├─ Fetcher.install(...)            設定 API 位址、JSON 格式
       ├─ VITE_MOCKING === 'true' ?       是 → 啟動 MSW
       └─ ReactDOM.createRoot(#app).render(<App />)
            └─ app.tsx
                 ├─ 網址以 /admin 開頭 → AdminApp（Auth0 + 全域狀態 + 後台路由）
                 └─ 其他              → UserApp（全域狀態 + 前台路由）
```

### API 位址

`Fetcher` 的 `hostUrl` 依環境決定：

| 環境        | 使用的值                            |
| :---------- | :---------------------------------- |
| `localhost` | `VITE_API_PATH_DEV`                 |
| 其他網域    | `VITE_API_PATH`，未設定則為 `./api` |

### 後台（`/admin`）

`AdminApp` 包含：

- `Auth0Provider`：Auth0 設定，`localhost` 使用 `VITE_AUTH0_CLIENT_ID_DEV`，其他網域使用 `VITE_AUTH0_CLIENT_ID`，登入後導回 `當前網域/admin`，登入狀態存在 `localStorage`。
- `Context.Provider`：全域狀態，詳見 [settings](../settings/README.md)。
- `BrowserRouter`（`basename='/admin'`）：後台路由。
- 全域元件：`Modal`、`Alert`、`LoadingProcess`，依狀態的 `enabled` 決定是否渲染。

### 前台（其他網址）

`UserApp` 只有全域狀態、`BrowserRouter`（沒有 basename）與 `LoadingProcess`。路由只有 `/`（載入 `home`，使用 `lazy` 延遲載入）與 `*`（404）。

## 後台路由與權限

登入流程由 `router.tsx` 的 `RoutePages` 與 `UserPage` 處理：

1. `RoutePages` 載入時呼叫 `useConnect` 喚醒資料庫連線（`/api/connect` 是唯一不需要 token 的路由）。
2. 依狀態顯示：`useAuth0().error` 有值 → `login/failed.tsx`；Auth0 載入中 → Loading；已登入 → `UserPage`；未登入 → `Login`。
   **`error` 這個分支不能省**：Auth0 自己拒絕請求時（audience 不存在、應用程式未被授權存取該 API、需要同意畫面）
   會直接帶著 `?error=...` 導回 `/admin`，`user` 仍是 `undefined`，少了這個分支就會無限跳回登入頁、而且看不到原因。
3. `UserPage` 掛載時**先**用 `setTokenGetter()` 把 Auth0 的 `getAccessTokenSilently` 註冊給 `src/settings/fetcher.ts`。
   這個 effect 必須排在呼叫 `useLogin` 的 effect 之前，否則第一個請求不會帶 `Authorization` header。
4. 拿到 Auth0 使用者後呼叫 `useLogin` 的 `run()`，**不傳任何參數**：身分完全由後端從 access token 驗證得出。
   成功就把 access token、email、name、picture、權限寫入全域狀態。
   失敗（token 無效、email 未驗證、使用者清單裡沒有這個 email）則顯示 `login/failed.tsx`，
   把後端回的 `msg` 直接印在畫面上，並提供「登出」與「重新登入」兩顆按鈕 ——
   **不要改回導向 `/`**，那會讓使用者卡在沒有登出按鈕的前台，也看不到失敗原因。
5. 全域狀態有 token 之後，才渲染 `DrawerPage`（側邊欄加上內容區）。
   這裡的 `token` 存的是 Auth0 access token，只當「已驗證」的旗標；實際送出的 header 由 `fetcher.ts` 每次請求前重新取得。
6. `UserPage` 會把 `<html>` 的 `data-theme` 設為 `valentine`。

`DrawerPage` 內的路由：

| 網址（含 `/admin` 前綴） | 頁面           | 權限                                 |
| :----------------------- | :------------- | :----------------------------------- |
| `/admin`、`/admin/home`  | `home`         | 登入即可                             |
| `/admin/user`            | `user`         | 僅 `admin`，其他權限會被導向 `/home` |
| `/admin/album`           | `album`        | 登入即可                             |
| `/admin/editor`          | `editor`       | 登入即可                             |
| 其他                     | `error`（404） | —                                    |

> 權限檢查只存在前端畫面。後端 API 沒有驗證，詳見根目錄 [README 的已知限制](../../README.md#已知限制與安全注意事項)。

## 各頁面說明

### home

首頁，目前只有 `Home` 文字，檔案內有 `TODO: home page`。後台與前台都用它作為首頁。

### login

`index.tsx` 是登入頁，顯示 Auth0 的圖片與「登入」按鈕，按下後呼叫 `loginWithRedirect()` 導向 Auth0。圖片放在 `login/img/`。

`failed.tsx` 在兩種情況顯示，Props 只有 `msg: string`：Auth0 自己拒絕請求（`useAuth0().error`），或 Auth0 登入成功但後端拒絕 access token（`useLogin` 回 `res: false`）。
它一定會提供「登出」與「重新登入」兩顆按鈕，確保登入失敗時使用者不會被卡住。

### user（使用者管理）

僅管理員可使用。進入時若不是 `admin` 會被導向 `/home`，否則載入 `user` collection 的全部資料。

| 檔案         | 說明                                                                                                                        |
| :----------- | :-------------------------------------------------------------------------------------------------------------------------- |
| `index.tsx`  | 使用者表格（姓名、email、權限、刪除按鈕）與新增表單                                                                         |
| `add.tsx`    | 新增表單：姓名、email、權限（`admin`、`inHouse`、`user`）。送出前會先取得全部使用者，email 重複時顯示錯誤提示，不重複才新增 |
| `delete.tsx` | 刪除按鈕，成功後通知列表重新載入                                                                                            |
| `index.less` | 頁面高度樣式（扣掉導覽列，手機版再扣掉一個 48px 的工具列）                                                                  |

新增的使用者只要 email 與 Auth0 登入的 email 相同，就能通過登入驗證。

### album

只是把 [album 元件](../components/album/README.md) 包起來。圖片管理的所有功能都在元件內。

### editor

富文字編輯頁：

1. 載入時用 `useSelect` 取得 `editor` collection 的資料。
2. 把第一筆資料的 `html` 傳給 [tiptab 元件](../components/tiptab/README.md) 顯示。
3. 按「儲存」時：已有資料就用 `useUpdate` 更新第一筆，沒有就用 `useInsert` 新增。
4. 成功後顯示綠色 Alert。

整個網站只儲存**一份**編輯內容（永遠只讀寫第一筆資料）。

### error

404 頁面，包含「Go back home」按鈕與「Contact support」連結，連結的 email 由 `VITE_404_CONTACT_ADDRESS` 設定。

## 新增頁面

1. 建立 `src/pages/<name>/index.tsx`，用 `memo` 包裝並預設匯出。
2. 後台頁面：到 `router.tsx` 的 `DrawerPage` 新增 `<Route path='/<name>' element={<Name />} />`；需要權限限制時，參考 `user/index.tsx`，在 `useEffect` 內檢查 `context[ActionType.User].type`。
3. 前台頁面：到 `UserRoutePages` 新增路由。
4. 要出現在側邊欄時，修改 [drawer/mainBar.tsx](../components/drawer/mainBar.tsx)。
5. 若是靜態部署，`public/_redirects` 需要加上對應網址的 `/index.html 200` 規則，否則重新整理會 404（目前只有 `/admin` 與 `/album`）。
