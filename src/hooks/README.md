# hooks：呼叫後端 API 的 React Hooks

前端所有跟後端溝通的動作都包成 hook，元件不需要（也不應該）自己寫 `fetch`。

## 共通規則

所有 hook 都回傳同樣形狀的 tuple：

```ts
const [respond, run] = useXxx();
```

| 回傳值 | 說明 |
| :-- | :-- |
| `respond` | 最近一次請求的回應，一開始是 `undefined`。用 `useEffect` 監聽它來處理結果 |
| `run` | 發出請求的函式，參數依 hook 不同 |

大部分 hook 在請求前後會自動開關全域 Loading（`ActionType.LoadingProcess`），所以呼叫端不需要自己處理讀取畫面。例外是 `useSelect`，它不會開關 Loading。

後端不論成功失敗，HTTP 狀態碼都是 `200`，請用 `respond.res`（`true` 成功、`false` 失敗）判斷結果，失敗原因在 `respond.msg`。

### 回應型別

```ts
// setting/index.ts
type IRespond = {
  readonly res: boolean;        // 是否成功
  readonly msg: string;         // 訊息
  readonly collection: string;  // 操作的 collection
  readonly data: TType[];       // 回傳的資料（依 hook 而定）
};

// 相簿相關 hook（useSearch）使用
type TUploadResult = {
  readonly res: boolean;
  readonly msg: string;
  readonly collection: string;
  readonly data: TUploadRespond[]; // 圖片或資料夾資訊，欄位見 setting/type.ts
};
```

## Hook 一覽

| Hook | 檔案 | 用途 | 呼叫的 API |
| :-- | :-- | :-- | :-- |
| [`useConnect`](#useconnect) | `useConnect.ts` | 檢查資料庫連線 | `GET /api/connect` |
| [`useLogin`](#uselogin) | `useLogin.ts` | 登入並取得 token | `POST /api/login` |
| [`useSelect`](#useselect) | `useSelect.ts` | 取得整個 collection | `POST /api/select` |
| [`useInsert`](#useinsert) | `useInsert.ts` | 新增一筆資料 | `POST /api/insert` |
| [`useInsertMany`](#useinsertmany) | `useInsert.ts` | 新增多筆資料 | `POST /api/insertMany` |
| [`useUpdate`](#useupdate) | `useUpdate.ts` | 更新一筆資料 | `POST /api/update` |
| [`useDelete`](#usedelete) | `useDelete.ts` | 刪除一筆資料 | `POST /api/delete` |
| [`useUpload`](#useupload) | `useUpload.ts` | 上傳圖片 | `POST /api/upload` |
| [`useSearch`](#usesearch) | `useSearch.ts` | 列出相簿內容 | `POST /api/search` |
| [`useRemove`](#useremove) | `useRemove.ts` | 刪除單一圖片或資料夾 | `POST /api/remove` |
| [`useRemoveMany`](#useremovemany) | `useRemoveMany.ts` | 刪除多張圖片 | `POST /api/removeMany` |

資料庫類（connect、login、select、insert、update、delete）的後端說明見 [netlify/functions/README.md](../../netlify/functions/README.md)。

---

## 資料庫

### useConnect

檢查後端是否連得上 MongoDB。

```tsx
import useConnect from '@/hooks/useConnect';

export default function Demo() {
  const [respond, getConnection] = useConnect();

  return (
    <>
      <button onClick={getConnection}>檢查連線</button>
      <p>{respond?.msg}</p>
    </>
  );
}
```

| 項目 | 說明 |
| :-- | :-- |
| `run()` | 不需要參數 |
| 成功 | `respond.res === true`，`msg` 為 `Database connection successful.` 或 `The database is online.` |
| 失敗 | `respond.res === false`，`msg` 為 `Database connection failed.` |

後台的 `RoutePages` 在載入時會呼叫一次，用來喚醒資料庫連線。

### useLogin

把 Auth0 的使用者資料送給後端驗證，成功後自動呼叫 `Fetcher.setJWT(token)`，之後的請求會帶上這個 token。

```tsx
import useLogin from '@/hooks/useLogin';
import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';

export default function Demo() {
  const { user } = useAuth0();
  const [respond, login] = useLogin();

  useEffect(() => {
    if (user) login(user);
  }, [user]);

  useEffect(() => {
    if (respond?.res) console.log(respond.type, respond.token);
  }, [respond]);

  return null;
}
```

| 項目 | 說明 |
| :-- | :-- |
| `run(user)` | `user` 為 Auth0 的 `User` 物件，至少需要 `email` |
| `respond` 型別 | `{ res: boolean; type: UserType; token: string }`（不是 `IRespond`） |
| 失敗 | `res === false`，`type` 為 `guest`，沒有 `token` |

### useSelect

取得某個 collection 的所有資料。這個 hook **不會**顯示全域 Loading。

```tsx
import useSelect from '@/hooks/useSelect';
import { useEffect } from 'react';

export default function Demo() {
  const [respond, getData] = useSelect();

  useEffect(() => {
    getData({ collection: 'user' });
  }, []);

  return <pre>{JSON.stringify(respond?.data, null, 2)}</pre>;
}
```

| 項目 | 說明 |
| :-- | :-- |
| `run({ collection })` | `collection` 是 `setting/index.ts` 內定義的名稱 |
| `respond.data` | 該 collection 的所有文件，每筆都含 MongoDB 的 `_id` |

`respond.data` 的型別是 `TType[]`（所有 collection 型別的聯集），需要特定 collection 的型別時請轉型，例如 `respond.data as TType<'user'>[]`。

### useInsert

新增一筆資料。`data` 不需要帶 `timestamp`，後端會依 schema 的預設值補上。

```tsx
import useInsert from '@/hooks/useInsert';

export default function Demo() {
  const [respond, insertOne] = useInsert();

  return (
    <button
      onClick={() =>
        insertOne({
          collection: 'user',
          data: { userName: 'James', email: 'james@example.com', type: 'user' },
        })
      }
    >
      新增使用者
    </button>
  );
}
```

| 項目 | 說明 |
| :-- | :-- |
| `run({ collection, data })` | `data` 為符合該 collection schema 的物件（可省略 `timestamp`） |
| `respond.data` | 新增後的文件（含 `_id`），放在陣列的第一個元素 |
| 失敗 | 欄位驗證失敗時，`msg` 是錯誤物件的 JSON 字串 |

### useInsertMany

與 `useInsert` 用法相同，但呼叫的是 `insertMany`。注意它與 `useInsert` 共用同一個 `TArgument` 型別，`data` 的型別仍是單筆物件；若要傳入陣列，需要自行轉型，或先調整 `src/hooks/useInsert.ts` 的型別。

```tsx
import { useInsertMany } from '@/hooks/useInsert';

const [respond, insertMany] = useInsertMany();
```

### useUpdate

更新一筆資料。

```tsx
import useUpdate from '@/hooks/useUpdate';

export default function Demo() {
  const [respond, updateOne] = useUpdate();

  return (
    <button
      onClick={() =>
        updateOne({
          collection: 'editor',
          data: { _id: '6128211234', data: { html: '<p>新內容</p>' } },
        })
      }
    >
      更新
    </button>
  );
}
```

| 項目 | 說明 |
| :-- | :-- |
| `run({ collection, data })` | `data._id` 是要更新的文件 id，`data.data` 是要更新的欄位（可只傳部分） |
| 成功 | `respond.res === true`，`msg` 為 `Data updated successfully` |

### useDelete

刪除一筆資料。

```tsx
import useDelete from '@/hooks/useDelete';

export default function Demo() {
  const [respond, deleteOne] = useDelete();

  return (
    <button onClick={() => deleteOne({ collection: 'user', data: { _id: '6128211234' } })}>
      刪除
    </button>
  );
}
```

| 項目 | 說明 |
| :-- | :-- |
| `run({ collection, data })` | `data._id` 是要刪除的文件 id |
| 成功 | `respond.res === true`，`msg` 為 `Data deleted successfully` |

---

## 圖片（相簿）

圖片儲存位置由後端環境變數 `CLOUD_STORAGE_TYPE` 決定（Cloudinary 或 BunnyCDN），前端 hook 的用法相同。

### useUpload

上傳一張圖片。圖片以 Base64 字串（含 `data:image/...;base64,` 前綴）傳送，後端會用 sharp 轉成 WebP（品質 80）後再儲存。

```tsx
import useUpload from '@/hooks/useUpload';

export default function Demo({ base64 }: { base64: string }) {
  const [respond, upload] = useUpload();

  return (
    <button onClick={() => upload({ image: base64, folder: 'banner' })}>
      上傳到 banner 資料夾
    </button>
  );
}
```

| 項目 | 說明 |
| :-- | :-- |
| `run({ image, folder })` | `image` 為 Base64 字串；`folder` 為資料夾名稱，傳空字串代表根目錄 |
| 成功 | `respond.res === true`，`respond.data` 內含圖片網址（`secure_url`） |
| 限制 | 單次請求上限 10 MB |

### useSearch

列出某個資料夾內的圖片與子資料夾。**hook 載入時會自動查詢一次**，之後只要全域狀態 `album.folder` 改變，也會重新查詢。

```tsx
import useSearch from '@/hooks/useSearch';

export default function Demo() {
  const [respond, search] = useSearch();

  return (
    <ul>
      {respond?.data.map((item) => (
        <li key={item.public_id}>{item.filename}</li>
      ))}
      <button onClick={() => search({ folder: '*' })}>重新整理</button>
    </ul>
  );
}
```

| 項目 | 說明 |
| :-- | :-- |
| `run({ folder })` | `'*'` 代表根目錄 |
| `respond` 型別 | `TUploadResult`，`data` 是 `TUploadRespond[]` |
| 排序 | BunnyCDN 模式下資料夾會排在檔案前面 |
| 錯誤 | 請求拋出例外時會用 `alert()` 顯示錯誤 |

### useRemove

刪除單一圖片或資料夾。

```tsx
import useRemove from '@/hooks/useRemove';

const [respond, remove] = useRemove();
remove({ public_id: 'banner/photo' });
```

| 項目 | 說明 |
| :-- | :-- |
| `run({ public_id })` | Cloudinary 模式傳 `public_id`；BunnyCDN 模式後端把這個值當作檔案路徑（`href`）。相簿元件實際傳入的值見 [album 的說明](../components/album/README.md) |

### useRemoveMany

一次刪除多張圖片。

```tsx
import useRemoveMany from '@/hooks/useRemoveMany';

const [respond, removeMany] = useRemoveMany();
removeMany({ public_ids: ['banner/a', 'banner/b'] });
```

| 項目 | 說明 |
| :-- | :-- |
| `run({ public_ids })` | 字串陣列，規則同 `useRemove` |

---

## 新增一個 hook

1. 在 `src/settings/config.ts` 的 `REST_PATH` 加入路徑。
2. 複製一個最接近的 hook（例如 `useDelete.ts`）修改：
   - 定義參數型別 `TArgument`。
   - 請求前呼叫 `setContext({ type: ActionType.LoadingProcess, state: { enabled: true } })`，請求後關閉。
   - 回傳 `[state, fetch] as const`。
3. 在本文件補上說明。
4. 如果要在 Mock 模式下使用，到 [src/mocks](../mocks/README.md) 補上 handler。

## 注意事項

- `Fetcher` 的連線位址在 `src/pages/index.tsx` 初始化：`localhost` 使用 `VITE_API_PATH_DEV`，其他環境使用 `VITE_API_PATH`，兩者都沒設定時使用 `./api`。
- hook 必須在 `Context.Provider` 之內使用（會呼叫 `useContext(Context)`），`useSelect` 例外。
- 每次呼叫 `run` 都會覆蓋上一次的 `respond`。同一個畫面要同時處理多個請求時，請各自使用獨立的 hook。
