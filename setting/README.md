# setting：資料表定義與共用型別

這個資料夾是**前後端共用**的設定來源。你在這裡定義 MongoDB 的資料表（collection）與欄位，後端會據此建立 mongoose model，前端會據此推導 TypeScript 型別，兩邊不需要各寫一份。

> 注意與 `src/settings/` 的差別：`setting/`（單數）放資料表定義，`src/settings/`（複數）放前端的全域狀態與設定，見 [src/settings/README.md](../src/settings/README.md)。

## 檔案一覽

| 檔案 | 說明 |
| :-- | :-- |
| `index.ts` | `SETTING`（資料表定義）、由它推導出的 `TType`、API 回應型別 `IRespond`、`TUploadResult` |
| `type.ts` | 欄位型別列舉 `IType`，以及圖片上傳相關的型別 |

## 定義資料表

`SETTING.mongodb` 是一個陣列，每個項目代表一個 collection：

```ts
export const SETTING = {
  mongodb: [
    {
      collection: 'user',
      schema: {
        userName: { type: IType.String, required: true },
        email: { type: IType.String, required: true },
        type: { type: IType.String, required: true },
        timestamp: { type: IType.Date, default: 'Date.now()' },
      },
    },
    {
      collection: 'editor',
      schema: {
        html: { type: IType.String, required: true },
        timestamp: { type: IType.Date, default: 'Date.now()' },
      },
    },
  ],
} as const;
```

目前內建兩個 collection：

| collection | 用途 | 欄位 |
| :-- | :-- | :-- |
| `user`（第一項） | 後台使用者與權限 | `userName`、`email`、`type`（權限）、`timestamp` |
| `editor` | 富文字編輯器內容 | `html`、`timestamp` |

### 欄位設定

| 屬性 | 說明 |
| :-- | :-- |
| `type` | 欄位型別，使用 `IType` 列舉，見下表 |
| `required` | 設為 `true` 表示必填 |
| `default` | 預設值。填 `'Date.now()'` 這個字串時，會在建立文件時代入當下時間 |

### `IType` 列舉

| 值 | 對應的 TypeScript 型別 | mongoose 型別 |
| :-- | :-- | :-- |
| `IType.String` | `string` | `String` |
| `IType.Number` | `number` | `Number` |
| `IType.Boolean` | `boolean` | `Boolean` |
| `IType.Date` | `Date` | `Date` |
| `IType.Array` | `unknown[]` | 後端尚未支援，會退回 `String` |
| `IType.Object` | `Record<string, unknown>` | 後端尚未支援，會退回 `String` |

## 型別推導

不需要手寫資料型別，直接使用 `TType`：

```ts
import { TType } from '../../setting';

// 所有 collection 的聯集
type Any = TType;

// 指定 collection
type User = TType<'user'>;
// → { userName: string; email: string; type: string; timestamp: Date }

type Editor = TType<'editor'>;
// → { html: string; timestamp: Date }
```

因為 `SETTING` 使用了 `as const`，`collection` 名稱也會被限制成字面值，拼錯名稱時 TypeScript 會報錯。

### 其他匯出

| 名稱 | 說明 |
| :-- | :-- |
| `IRespond` | 一般 API 回應：`{ res, msg, collection, data: TType[] }`（欄位皆唯讀） |
| `TUploadResult` | 相簿 API 回應：`{ res, msg, collection, data: TUploadRespond[] }` |
| `TUploadRespond`（`type.ts`） | 相簿中一個圖片或資料夾的資訊，欄位格式參考 Cloudinary |
| `UploadBunnyCDNRespond`（`type.ts`） | BunnyCDN 儲存空間 API 原始回應的欄位 |
| `CloudinaryUploadedResult`（`type.ts`） | Cloudinary 上傳完成的回應 |

## 新增一個 collection

1. 在 `SETTING.mongodb` 加入項目（務必保持 `as const`）：

   ```ts
   {
     collection: 'article',
     schema: {
       title: { type: IType.String, required: true },
       views: { type: IType.Number, default: 0 },
       published: { type: IType.Boolean, default: false },
       timestamp: { type: IType.Date, default: 'Date.now()' },
     },
   },
   ```

2. 後端會在下次啟動時自動建立對應的 model，不需要再改 `netlify/functions`。
3. 前端立即可用：

   ```ts
   const [respond, getData] = useSelect();
   getData({ collection: 'article' });
   ```

4. 後台側邊欄的「COLLECTION LIST」會自動列出新的 collection（連結到 `/<collection>`），但你需要自己建立該路由的頁面，否則點進去會是 404。

## 注意事項

- **第一個 collection（index 0）有特殊用途**：它被當作使用者資料表，登入驗證（`/api/login`）、使用者管理頁（`/user`）、導覽列的「使用者列表」連結都用 `SETTING.mongodb[0]`。請不要調換順序，要新增請加在後面。
- 側邊欄的 COLLECTION LIST 會略過第一項，因為使用者管理有獨立入口。
- 修改既有欄位不會自動遷移資料庫裡已經存在的資料。
- `default` 只在欄位值為真值時才會被設定（`default: 0` 或 `default: false` 在 `models.ts` 內會被忽略），若需要這類預設值，請先修改 `netlify/functions/models.ts` 的判斷（`if (value.default)`）。
- `insert` 與 `update` 目前不驗證欄位名稱是否在 schema 內，多餘的欄位會被 mongoose 的 strict 模式忽略。
