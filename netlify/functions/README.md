# netlify/functions：後端 API

後端是一個以 [serverless-http](https://github.com/dougmoscrop/serverless-http) 包裝的 Express 應用程式，部署成單一個 Netlify Function（`api`），負責資料庫操作、登入驗證與圖片管理。

## 檔案一覽

| 檔案             | 說明                                                                               |
| :--------------- | :--------------------------------------------------------------------------------- |
| `api/api.ts`     | Express 應用程式與全部路由，匯出 Netlify 的 `handler`                              |
| `api/auth.ts`    | Auth0 access token 驗證、權限判斷、collection 白名單（`guard`、`guardCollection`） |
| `api/connect.ts` | 建立或重用 MongoDB 連線                                                            |
| `api/select.ts`  | 查詢整個 collection                                                                |
| `api/insert.ts`  | 新增單筆（`insert`）與多筆（`insertMany`）                                         |
| `api/update.ts`  | 依 `_id` 更新                                                                      |
| `api/delete.ts`  | 依 `_id` 刪除                                                                      |
| `models.ts`      | 依 `setting/index.ts` 的 schema 自動建立 mongoose model                            |
| `config.ts`      | 回應訊息文字 `messages` 與請求大小上限 `limit`（10mb）                             |
| `type.ts`        | 資料庫狀態列舉 `MongoServerStateType`                                              |

## 請求如何到達這裡

```text
前端  POST /api/select
  │   （netlify.toml 或 public/_redirects）
  ▼
/.netlify/functions/api/select
  ▼
serverless-http → Express → router.post('/select')
```

`netlify.toml` 設定：

| 設定                                   | 說明                                                    |
| :------------------------------------- | :------------------------------------------------------ |
| `[functions] node_bundler = "esbuild"` | 以 esbuild 打包 Function                                |
| `external_node_modules = ["express"]`  | `express` 不打包進 bundle，執行時從 `node_modules` 載入 |
| `[[redirects]]`                        | 把 `/api/*` 轉發到 `/.netlify/functions/api/:splat`     |
| `[[headers]]`                          | 所有路徑加上 `Access-Control-Allow-Origin = "*"`        |

本機開發時，`netlify dev` 在 `localhost:8888` 提供這些路由，Vite 再把 `/api` 代理過去。

## API 一覽

所有路由前綴為 `/api`。

**驗證：** 除了 `GET /api/connect`，所有路由都必須帶 `Authorization: Bearer <Auth0 access token>`。

**狀態碼：** 業務邏輯的成功與失敗一律回 `200`，請看回應內的 `res`（布林）判斷，`msg` 是說明文字。
驗證與連線問題則使用 HTTP 狀態碼：

| 狀態碼 | 情況                                                                                |
| :----- | :---------------------------------------------------------------------------------- |
| `401`  | 沒帶 `Authorization`、token 驗不過或過期、token 內沒有 email claim                  |
| `403`  | email 未驗證、權限不足（查不到使用者、權限是 `guest`、非 `admin` 動到使用者資料表） |
| `400`  | `collection` 不在 `SETTING.mongodb` 之內                                            |
| `503`  | 資料庫連不上                                                                        |
| `500`  | 伺服器少了 `AUTH0_DOMAIN` 或 `AUTH0_AUDIENCE`                                       |

### 資料庫

| 方法與路徑             | 請求內容                                                | 成功回應                                   |
| :--------------------- | :------------------------------------------------------ | :----------------------------------------- |
| `POST /api/login`      | 無（身分完全來自 access token）                         | `{ res: true, type, email }`               |
| `GET /api/connect`     | 無                                                      | `{ res: true, msg }`                       |
| `POST /api/select`     | `{ collection }`                                        | `{ res, msg, collection, data: [...] }`    |
| `POST /api/insert`     | `{ collection, data }`                                  | `{ res, msg, collection, data: [新文件] }` |
| `POST /api/insertMany` | `{ collection, data: [...] }`                           | `{ res, msg, collection, data: [結果] }`   |
| `POST /api/update`     | `{ collection, data: { _id, data: { 要更新的欄位 } } }` | `{ res, msg, collection }`                 |
| `POST /api/delete`     | `{ collection, data: { _id } }`                         | `{ res, msg, collection }`                 |

除了 `connect` 之外，所有路由都由 `guard` middleware 先驗證 token 再確認連線；連不上時回 `503`。
資料庫路由另外經過 `guardCollection`，檢查 `collection` 是否合法與是否需要 `admin` 權限。

### 圖片

| 方法與路徑             | 請求內容                                             | 說明                                                                                                                                                                      |
| :--------------------- | :--------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `POST /api/upload`     | `{ image, folder? }`，`image` 是含前綴的 Base64 字串 | 不轉檔：BunnyCDN 以 `jpeg` 上傳，Cloudinary 直接上傳原 Base64，回傳 `data`（Cloudinary 模式是 Cloudinary 的回應，BunnyCDN 模式是補齊欄位後的相同結構）                    |
| `POST /api/search`     | `{ folder }`                                         | 列出資料夾內容，`'*'` 代表根目錄，資料夾排在前面（`resource_type: 'folder'`、`public_id` 結尾 `/`）。Cloudinary 模式另呼叫 `api.sub_folders` 併入子資料夾，失敗時只回檔案 |
| `POST /api/remove`     | `{ public_id }`                                      | 刪除單一檔案或資料夾                                                                                                                                                      |
| `POST /api/removeMany` | `{ public_ids: [...] }`                              | 刪除多個檔案                                                                                                                                                              |

圖片儲存位置由 `CLOUD_STORAGE_TYPE` 決定：

| 值           | 儲存位置                                               | 需要的環境變數                                                                             |
| :----------- | :----------------------------------------------------- | :----------------------------------------------------------------------------------------- |
| `cloudinary` | Cloudinary，圖片放在 `CLOUDINARY_BASE_FOLDER/<folder>` | `CLOUDINARY_NAME`、`CLOUDINARY_API_KEY`、`CLOUDINARY_API_SECRET`、`CLOUDINARY_BASE_FOLDER` |
| 其他或不填   | BunnyCDN Storage                                       | `BUNNY_PASSWORD`、`BUNNY_STORAGE_ZONE`、`BUNNY_FOLDER_NAME`、`BUNNY_REGION`                |

兩種模式回傳的資料欄位結構一致（`TUploadRespond`），前端不需要區分。BunnyCDN 模式下，很多欄位（例如 `width`、`height`）沒有實際值，會填 `0`，相簿元件會在瀏覽器端自行載入圖片取得尺寸。

## 驗證邏輯（`api/auth.ts`）

### `guard`：每個非公開路由都會經過

順序刻意是「先驗 token，再連資料庫」，這樣資料庫掛掉時不會把驗證失敗蓋成連線錯誤。

1. 少了 `AUTH0_DOMAIN` 或 `AUTH0_AUDIENCE` → `500`。
2. 取出 `Authorization: Bearer <token>`，沒有就 `401`。
3. 用 `jose` 的 `createRemoteJWKSet` + `jwtVerify` 驗證：
   - 公鑰來自 `https://${AUTH0_DOMAIN}/.well-known/jwks.json`（JWKSet 物件會跨請求重用，暖啟動不必重抓）。
   - 檢查 `issuer`、`audience`、`exp`，`algorithms` 限定 `['RS256']`。
   - 驗不過 → `401`。
4. 從自訂 claim 取值（命名空間預設 `https://template-netlify-mern/`，可用 `AUTH0_CLAIMS_NAMESPACE` 覆寫）：
   - `<namespace>email` 不存在 → `401`（代表 Auth0 的 post-login action 沒設好）。
   - `<namespace>email_verified` 不是 `true` → `403`。
5. `await connect()`，連不上 → `503`。
6. 決定權限（`resolveType`）：
   - email 等於 `AMIN_EMAIL` → `admin`（不查資料庫）。
   - 否則用 `models[user].findOne({ email })` 查單筆，採用其 `type`。
   - 查不到、或 `type` 是 `guest` / 不在 `UserType` 之內 → `403`。
7. 通過後把 `{ email, type }` 掛在 `req.identity`，交給路由。

### `guardCollection`：資料庫路由另外經過

1. `collection` 不在 `SETTING.mongodb` 的清單內 → `400`。這同時擋掉 `__proto__` 之類的 model 查找。
2. `collection` 是 `SETTING.mongodb[0]`（使用者資料表）且 `req.identity.type` 不是 `admin` → `403`。
   **`select` 也在管制範圍內**，否則一般使用者可以讀到所有人的 email 與權限，或用 `update` 把自己改成 `admin`。

### `POST /api/login` 做什麼

它已經不簽發 token，只是回報「你是誰」：`{ res: true, type, email }`，兩個值都來自驗證過的 token。
前端用它決定要不要顯示後台與哪些選單。

> Auth0 後台需要建立一個 API（取得 audience）並加上 post-login action 把 email 寫進 access token，
> 設定步驟見根目錄 [README 的 Auth0 設定提醒](../../README.md#auth0-設定提醒)。

## 資料模型

`models.ts` 讀取 `setting/index.ts` 的 `SETTING.mongodb`，為每個 collection 建立 mongoose model，規則如下：

| schema 欄位設定                  | mongoose 行為                                               |
| :------------------------------- | :---------------------------------------------------------- |
| `type: IType.String`（或未指定） | `String`                                                    |
| `type: IType.Number`             | `Number`                                                    |
| `type: IType.Boolean`            | `Boolean`                                                   |
| `type: IType.Date`               | `Date`                                                      |
| `IType.Array`、`IType.Object`    | 目前不會轉換，會退回 `String`（`models.ts` 沒有處理這兩種） |
| `required: true`                 | 必填                                                        |
| `default: 'Date.now()'`          | 預設值為建立當下的時間戳                                    |
| `default: 其他值`                | 直接當預設值                                                |

Model 使用 `versionKey: false`，文件不會有 `__v` 欄位。

新增 collection 只要修改 `setting/index.ts`，詳見 [setting/README.md](../../setting/README.md)。

## 環境變數

後端程式碼會用 `dotenv` 讀取 `.env.${NODE_ENV}`（例如 `NODE_ENV=local` 時讀 `.env.local`）。專案文件統一要求建立 `.env.local`；如果本機開發時發現變數沒有被讀到，請確認檔名與實際的 `NODE_ENV` 對應，或把變數同時放進對應檔名。正式環境則是直接設定在 Netlify 後台。變數清單與說明見根目錄 [README 的環境變數](../../README.md#環境變數)。

## 新增 API

1. 在 `api/` 新增函式，沿用既有的 `new Promise<IRespond>` 與 `messages` 文字，確認連線後再操作資料庫。
2. 在 `api/api.ts` 加入路由：

   ```ts
   // 放在 router.use(guard) 之後，連線與驗證都已經由 guard 處理
   // 會操作 collection 的路由再加上 guardCollection
   router.post(`/${REST_PATH.xxx}`, guardCollection, async (req, res) => {
     const respond = await xxx(req.body);
     res.status(200).json(respond);
   });
   ```

   需要公開（登入前就要能呼叫）的路由，必須註冊在 `router.use(guard)` **之前**。

3. 在 `src/settings/config.ts` 的 `REST_PATH` 登記路徑。
4. 在 `src/hooks/` 新增對應 hook。
5. 需要新的回應訊息時，加到 `config.ts` 的 `messages`。

## _id 的處理

`update` 與 `delete` 會先驗證 `_id`：不是字串、或 `mongoose.isValidObjectId()` 不過，就直接回
`{ res: false, msg: 'Invalid _id.' }`，不送進資料庫。查詢條件固定寫成 `{ _id }`，**不要**把請求的
`data` 整包當 filter 傳進 `deleteOne()` / `findOneAndUpdate()`：那樣 `{}` 會比對到第一筆文件，
`{ _id: { $ne: null } }` 會比對到全部。

找不到對應文件時（`findOneAndUpdate` 回 `null`、`deletedCount !== 1`）回 `res: false`，不是成功。

`update` 的 `data.data` 也會先檢查，不符合就回 `{ res: false, msg: 'Update payload must be a plain object of field values.' }`：

- 必須是非陣列的純物件，而且至少有一個欄位。
- 任何 key 以 `$` 開頭一律拒絕。payload 直接交給 `findOneAndUpdate`，`$unset`、`$rename`、`$set`
  會被當成 mongo 操作符執行，而不是存成欄位值。
- 任何 key 含 `.` 一律拒絕。`setting/index.ts` 的 schema 都是扁平的，`a.b` 只可能是想寫到別處。

所有 mongoose 的 `.then()` 都必須接 `.catch()`。少一個就會變成 unhandled rejection，
**整個 `netlify dev` 行程會被殺掉**，之後所有請求都回 502 直到重啟。

## 已知問題

- CORS 仍是 `*`（`netlify.toml` 與 Express），上線前請限縮。
- 圖片路由（`upload`、`search`、`remove`、`removeMany`）只檢查登入，不分權限。
- `GET /api/connect` 是公開路由，會洩漏資料庫是否連得上。
- **BunnyCDN 刪除已改為自行呼叫 Storage API**：套件的 `deleteFile` 只取第一層資料夾且不補 `BUNNY_FOLDER_NAME`，所以後端不再使用它。`remove` / `removeMany` 先以 `toBunnyPath` 驗證目標（拒絕空值、`/`、`..`、根資料夾本身），`removeMany` 會先驗證全部再刪除；資料夾以結尾 `/` 判斷。已實測根目錄檔案、子資料夾檔案、資料夾皆可刪除。
- `AMIN_EMAIL` 比對與 `findOne({ email })` 都是**區分大小寫**的。
- 新增使用者沒有後端的 email 重複檢查，重複判斷只做在前端 `pages/user/add.tsx`。
- `Cloudinary` 的 `remove` 與 `removeMany` 沒有檢查路徑是否在 `CLOUDINARY_BASE_FOLDER` 之內。
