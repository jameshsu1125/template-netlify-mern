# album：相簿（圖片管理）

完整的圖片管理介面：瀏覽資料夾與圖片、上傳新圖片、複製圖片網址、刪除單張或多張圖片、刪除資料夾。圖片實際儲存在 Cloudinary 或 BunnyCDN（由後端環境變數決定）。

## 基本用法

直接放進頁面即可，不需要任何 Props：

```tsx
import Album from '@/components/album';

const AlbumPage = () => (
  <div className='w-full'>
    <Album />
  </div>
);
```

它有兩個地方會用到：

| 位置 | 說明 |
| :-- | :-- |
| `src/pages/album` | 獨立的相簿頁面 |
| `src/components/tiptab/menu.tsx` | 編輯器的「新增圖片」按鈕，把相簿放進 Modal，挑選圖片網址 |

## 畫面與功能

元件由兩個分頁組成（使用 [tab](../tab/README.md)）：

### Manage（管理）

顯示目前資料夾的內容，每一列是一個圖片或資料夾：

| 項目 | 圖片 | 資料夾 |
| :-- | :-- | :-- |
| 縮圖 | 圖片縮圖，點擊在新分頁開啟 | 資料夾圖示，點擊進入 |
| 名稱 | `資料夾/檔名.副檔名` | 同左 |
| 尺寸 | 寬 x 高；後端沒有提供時，會在瀏覽器載入圖片後自行量測，量不到顯示 `unknown` | — |
| 勾選框 | 有（可多選） | 沒有 |
| 按鈕 | `open`（新分頁開啟）、`copy`（複製網址）、`delete`（刪除） | `open`（進入資料夾）、`delete`（刪除資料夾） |

其他行為：

- 進入子資料夾後，列表最上方會多一列「up folder...」，按 `open` 回到根目錄。
- 勾選至少一張圖片後，下方出現「REMOVE SELECTED」按鈕，可以一次刪除多張。
- 所有刪除都會先彈出頂部的[確認列](../confirm/README.md)，按 Accept 才會真的刪除。
- 刪除完成後顯示成功或失敗的 Alert，並重新載入列表。

### Upload（上傳）

1. 按「Capture」選擇圖片（使用 `lesca-react-capture-button`，會依 `CAPTURE_PROPERTY` 縮小到最大寬度 500px 並壓縮）。
2. 預覽圖片與尺寸，可輸入要上傳到的資料夾名稱（留空代表根目錄）。
3. 按「upload now」上傳。
4. 成功後清除預覽，約 0.5 秒後自動切回 Manage 分頁並重新載入。

## 檔案結構

| 檔案 | 說明 |
| :-- | :-- |
| `index.tsx` | 容器：提供 `AlbumContext`、顯示確認列、放入兩個分頁 |
| `config.tsx` | 元件內部的狀態型別、初始值與 `AlbumContext` |
| `list.tsx` | Manage 分頁：取得圖片列表、處理刪除請求與結果 |
| `table.tsx` | 圖片表格（表頭、表尾、列） |
| `tr.tsx` | 表格的單一列：縮圖、名稱、尺寸、操作按鈕 |
| `upload.tsx` | Upload 分頁：選圖、預覽、上傳 |

## 狀態

元件有**兩份**狀態，不要混淆：

### 1. 元件內部的 `AlbumContext`（`config.tsx`）

只在相簿元件內部共用，用來處理「刪除確認」流程：

| 欄位 | 型別 | 說明 |
| :-- | :-- | :-- |
| `enabled` | `boolean` | 是否顯示確認列 |
| `body` | `string` | 確認列的問題文字 |
| `public_id` | `string[]` | 待刪除項目的識別值 |
| `submit` | `boolean` | 使用者按下 Accept 後變為 `true`，通知清單發出刪除請求 |

### 2. 全域狀態 `context[ActionType.Album]`（`src/settings`）

跨元件共用：

| 欄位 | 預設值 | 說明 |
| :-- | :-- | :-- |
| `folder` | `'*'` | 目前所在的資料夾，`'*'` 代表根目錄。改變時 `useSearch` 會自動重新查詢 |
| `copiedText` | `''` | 最近一次複製的圖片網址。編輯器用它取得要插入的圖片 |

## 資料流程

```text
進入頁面
  └─ useSearch（folder = context.album.folder）→ POST /api/search → 顯示列表

按 delete
  └─ AlbumContext 設定 enabled、body、public_id → 顯示確認列
       ├─ Deny   → 關閉，submit = false
       └─ Accept → 關閉，submit = true
            └─ list.tsx 偵測 submit
                 ├─ 1 筆  → useRemove     → POST /api/remove
                 └─ 多筆  → useRemoveMany → POST /api/removeMany
                      └─ 顯示 Alert、列表重新載入（reload key + 1）

按 copy
  └─ 複製網址到剪貼簿 → 顯示 Alert「網址已經複製到剪貼簿」
       → 寫入 context.album.copiedText → 關閉 Modal（在編輯器內使用時）
```

## 與後端的對應

| 動作 | Hook | API |
| :-- | :-- | :-- |
| 列出 | `useSearch` | `POST /api/search` |
| 上傳 | `useUpload` | `POST /api/upload` |
| 刪除單張 | `useRemove` | `POST /api/remove` |
| 刪除多張 | `useRemoveMany` | `POST /api/removeMany` |

傳給刪除 API 的識別值依操作而不同（見 `tr.tsx`）：

| 操作 | 傳送的值 |
| :-- | :-- |
| 勾選框（多選刪除） | `pixels === 0`（通常是 BunnyCDN）時用 `secure_url`，否則用 `public_id` |
| 單張圖片的 `delete` 按鈕 | `public_id` |
| 資料夾的 `delete` 按鈕 | `secure_url` |

> 單張刪除固定傳 `public_id`，而 BunnyCDN 模式下的 `public_id` 只是檔名（後端 `search` 把 `ObjectName` 放進去）。後端 `BunnyCDN.deleteFile` 收到的是 `href`，這個組合在 BunnyCDN 模式下是否能刪除成功，文件撰寫時**尚未實際測試**，使用 BunnyCDN 的專案請先驗證。

## 注意事項

- 確認列的文字寫著「from cloudinary」，即使實際使用的是 BunnyCDN；如需調整，修改 `tr.tsx` 內的訊息。
- 上傳之後後端會轉成 WebP，所以最終檔案的格式永遠是 `.webp`。
- 「Manage」分頁的 id 是 `Manage`，上傳完成後靠它切回分頁（見 [tab](../tab/README.md)）。
- 元件內的 `Tab` 使用固定的 radio name，同一個畫面不要同時放兩個相簿或兩組 `Tab`。
- `tr.tsx` 的 `key` 使用 `JSON.stringify(item)`，列表很大時會有效能成本。
