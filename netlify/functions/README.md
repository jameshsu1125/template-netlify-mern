# netlify/functions：後端 API

後端是一個以 [serverless-http](https://github.com/dougmoscrop/serverless-http) 包裝的 Express 應用程式，部署成單一個 Netlify Function（`api`），負責資料庫操作、登入驗證與圖片管理。

## 檔案一覽

| 檔案 | 說明 |
| :-- | :-- |
| `api/api.ts` | Express 應用程式與全部路由，匯出 Netlify 的 `handler` |
| `api/connect.ts` | 建立或重用 MongoDB 連線 |
| `api/select.ts` | 查詢整個 collection |
| `api/insert.ts` | 新增單筆（`insert`）與多筆（`insertMany`） |
| `api/update.ts` | 依 `_id` 更新 |
| `api/delete.ts` | 依 `_id` 刪除 |
| `models.ts` | 依 `setting/index.ts` 的 schema 自動建立 mongoose model |
| `config.ts` | 回應訊息文字 `messages` 與請求大小上限 `limit`（10mb） |
| `type.ts` | 資料庫狀態列舉 `MongoServerStateType` |

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

| 設定 | 說明 |
| :-- | :-- |
| `[functions] node_bundler = "esbuild"` | 以 esbuild 打包 Function |
| `external_node_modules = ["express"]` | `express` 不打包進 bundle，執行時從 `node_modules` 載入 |
| `[[redirects]]` | 把 `/api/*` 轉發到 `/.netlify/functions/api/:splat` |
| `[[headers]]` | 所有路徑加上 `Access-Control-Allow-Origin = "*"` |

本機開發時，`netlify dev` 在 `localhost:8888` 提供這些路由，Vite 再把 `/api` 代理過去。

## API 一覽

所有路由前綴為 `/api`。

**重要：** 不論成功或失敗，HTTP 狀態碼一律是 `200`。請看回應內的 `res`（布林）判斷結果，`msg` 是說明文字。

### 資料庫

| 方法與路徑 | 請求內容 | 成功回應 |
| :-- | :-- | :-- |
| `POST /api/login` | Auth0 使用者物件（需 `email`，可帶 `name`、`updated_at`） | `{ res: true, token, type }` |
| `GET /api/connect` | 無 | `{ res: true, msg }` |
| `POST /api/select` | `{ collection }` | `{ res, msg, collection, data: [...] }` |
| `POST /api/insert` | `{ collection, data }` | `{ res, msg, collection, data: [新文件] }` |
| `POST /api/insertMany` | `{ collection, data: [...] }` | `{ res, msg, collection, data: [結果] }` |
| `POST /api/update` | `{ collection, data: { _id, data: { 要更新的欄位 } } }` | `{ res, msg, collection }` |
| `POST /api/delete` | `{ collection, data: { _id } }` | `{ res, msg, collection }` |

除了 `connect` 之外，所有資料庫路由都會先確認連線；連不上時回傳 `{ res: false, msg: 'Database connection failed.' }`。

### 圖片

| 方法與路徑 | 請求內容 | 說明 |
| :-- | :-- | :-- |
| `POST /api/upload` | `{ image, folder? }`，`image` 是含前綴的 Base64 字串 | 先用 sharp 轉成 WebP（品質 80）再上傳，回傳 `data`（Cloudinary 模式是 Cloudinary 的回應，BunnyCDN 模式是補齊欄位後的相同結構） |
| `POST /api/search` | `{ folder }` | 列出資料夾內容。BunnyCDN 模式下 `'*'` 代表根目錄，資料夾排在前面 |
| `POST /api/remove` | `{ public_id }` | 刪除單一檔案或資料夾 |
| `POST /api/removeMany` | `{ public_ids: [...] }` | 刪除多個檔案 |

圖片儲存位置由 `CLOUD_STORAGE_TYPE` 決定：

| 值 | 儲存位置 | 需要的環境變數 |
| :-- | :-- | :-- |
| `cloudinary` | Cloudinary，圖片放在 `CLOUDINARY_BASE_FOLDER/<folder>` | `CLOUDINARY_NAME`、`CLOUDINARY_API_KEY`、`CLOUDINARY_API_SECRET`、`CLOUDINARY_BASE_FOLDER` |
| 其他或不填 | BunnyCDN Storage | `BUNNY_PASSWORD`、`BUNNY_STORAGE_ZONE`、`BUNNY_FOLDER_NAME`、`BUNNY_REGION` |

兩種模式回傳的資料欄位結構一致（`TUploadRespond`），前端不需要區分。BunnyCDN 模式下，很多欄位（例如 `width`、`height`）沒有實際值，會填 `0`，相簿元件會在瀏覽器端自行載入圖片取得尺寸。

## 登入驗證邏輯

`POST /api/login` 的判斷順序：

1. 資料庫連不上 → `{ res: false, msg }`。
2. `body.email` 等於環境變數 `AMIN_EMAIL` → 視為管理員（`admin`），名稱預設 `super user`。
3. 否則讀取 `SETTING.mongodb[0]`（第一個 collection，即使用者資料表），找到相同 email 的使用者就採用該使用者的 `type`。
4. 找不到 → `{ res: false, type: 'guest' }`。

成功時 token 是把 `{ type, name, email, timestamp }` 用 `lesca-atobtoa` 轉成 Base64 的字串。**它不是簽章過的 JWT，後端其他路由也不會驗證它**，詳見[已知限制](../../README.md#已知限制與安全注意事項)。

## 資料模型

`models.ts` 讀取 `setting/index.ts` 的 `SETTING.mongodb`，為每個 collection 建立 mongoose model，規則如下：

| schema 欄位設定 | mongoose 行為 |
| :-- | :-- |
| `type: IType.String`（或未指定） | `String` |
| `type: IType.Number` | `Number` |
| `type: IType.Boolean` | `Boolean` |
| `type: IType.Date` | `Date` |
| `IType.Array`、`IType.Object` | 目前不會轉換，會退回 `String`（`models.ts` 沒有處理這兩種） |
| `required: true` | 必填 |
| `default: 'Date.now()'` | 預設值為建立當下的時間戳 |
| `default: 其他值` | 直接當預設值 |

Model 使用 `versionKey: false`，文件不會有 `__v` 欄位。

新增 collection 只要修改 `setting/index.ts`，詳見 [setting/README.md](../../setting/README.md)。

## 環境變數

後端程式碼會用 `dotenv` 讀取 `.env.${NODE_ENV}`（例如 `NODE_ENV=local` 時讀 `.env.local`）。專案文件統一要求建立 `.env.local`；如果本機開發時發現變數沒有被讀到，請確認檔名與實際的 `NODE_ENV` 對應，或把變數同時放進對應檔名。正式環境則是直接設定在 Netlify 後台。變數清單與說明見根目錄 [README 的環境變數](../../README.md#環境變數)。

## 新增 API

1. 在 `api/` 新增函式，沿用既有的 `new Promise<IRespond>` 與 `messages` 文字，確認連線後再操作資料庫。
2. 在 `api/api.ts` 加入路由：

   ```ts
   router.post(`/${REST_PATH.xxx}`, async (req, res) => {
     const connection = await connect();
     if (!connection.res) {
       res.status(200).json({ res: false, msg: messages.connectError });
     } else {
       const respond = await xxx(req.body);
       res.status(200).json(respond);
     }
   });
   ```

3. 在 `src/settings/config.ts` 的 `REST_PATH` 登記路徑。
4. 在 `src/hooks/` 新增對應 hook。
5. 需要新的回應訊息時，加到 `config.ts` 的 `messages`。

## 已知問題

- 沒有任何驗證或權限檢查（見根目錄 README）。
- `api.ts` 的上傳路由內有一行 `console.log(folder)` 除錯輸出。
- 圖片類路由的刪除失敗訊息在 `catch` 內使用了 `uploadError`，所以錯誤文字會顯示 `Upload failed`。
- `Cloudinary` 的 `remove` 與 `removeMany` 沒有檢查路徑是否在 `CLOUDINARY_BASE_FOLDER` 之內。
