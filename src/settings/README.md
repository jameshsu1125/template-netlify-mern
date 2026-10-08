# settings：全域狀態、型別與設定值

這個資料夾放整個前端共用的「基礎設定」：全域狀態怎麼存、有哪些型別與列舉、API 路徑叫什麼名字。

## 檔案一覽

| 檔案 | 用途 |
| :-- | :-- |
| `constant.ts` | 全域狀態的初始值、`Context`、`Reducer` |
| `type.ts` | 列舉（`ActionType`、`AlertType`、`UserType`…）與全域狀態的型別 |
| `type-unity.ts` | 共用的 TypeScript 工具型別（`Debug`、`Equal`、`ReadyOnly`…） |
| `config.ts` | API 路徑名稱 `REST_PATH`、圖片擷取設定 `CAPTURE_PROPERTY` |
| `config.less` | Less 斷點變數 `@SM`（768px）、`@MD`（1024px）、`@LG`（1280px），給 `.less` 檔 `@import` |
| `global.css` | 全域樣式，並載入 `tailwind.config.css`（Tailwind 與 daisyUI） |

## 全域狀態

全域狀態用 React 的 `useReducer` 搭配 `Context` 實作，在 `src/pages/app.tsx` 建立並提供給整個後台。

### 狀態分區

`IState` 由六個區塊組成，每個區塊對應一個 `ActionType`：

| `ActionType` | 狀態名稱 | 欄位 | 預設值 | 負責顯示的元件 |
| :-- | :-- | :-- | :-- | :-- |
| `LoadingProcess` (`'loadingProcess'`) | `LoadingProcessState` | `enabled`、`type`、`body` | `false`、`Spokes`、`'loading'` | [loadingProcess](../components/loadingProcess/README.md) |
| `Status` (`'status'`) | `StatusState` | `enabled` | `false` | 目前沒有元件使用 |
| `Alert` (`'alert'`) | `AlertState` | `enabled`、`type`、`body`、`time` | `false`、`Normal`、`'message'`、`5000` | [alert](../components/alert/README.md) |
| `Modal` (`'modal'`) | `ModalState` | `enabled`、`title`、`body`、`label`、`storage`、`onClose` | `false`、`'title'`、`'message'`、`'close'`、`{}`、空函式 | [modal](../components/modal/README.md) |
| `User` (`'user'`) | `UserState` | `type`、`name`、`email`、`picture`、`token` | `Guest`、`'guest'`、`'demo@host.com'`、Gravatar 預設圖、`''` | [drawer](../components/drawer/README.md)（`userBar`、`navBar`） |
| `Album` (`'album'`) | `AlbumState` | `folder`、`copiedText` | `'*'`、`''` | [album](../components/album/README.md) |

### 如何更新狀態

呼叫 `Context` 提供的 dispatch 函式，傳入 `type`（要改哪一區）與 `state`（要改哪些欄位）：

```tsx
import { Context } from '@/settings/constant';
import { ActionType, AlertType } from '@/settings/type';
import { useContext } from 'react';

const Demo = () => {
  const [context, setContext] = useContext(Context);

  // 讀取：context[ActionType.Alert].enabled
  // 寫入：
  const notify = () =>
    setContext({
      type: ActionType.Alert,
      state: { enabled: true, type: AlertType.Success, body: '儲存成功' },
    });

  return <button onClick={notify}>通知</button>;
};
```

重點：

- `state` 只需要傳入「要改的欄位」，`Reducer` 會與該區塊原有的值合併，其他欄位不受影響。
- 區塊之間互相獨立，更新 `Alert` 不會動到 `Modal`。
- `Context` 的預設值是 `[InitialState, () => {}]`，也就是沒有 Provider 時 dispatch 不會做任何事；元件必須放在 `app.tsx` 提供的 Provider 之內。
- 前台（`UserApp`）只掛載 `LoadingProcess`，沒有 `Alert` 與 `Modal`；要在前台使用它們，需要自行在 `app.tsx` 的 `UserApp` 加上。

## 列舉與型別

### 列舉（`type.ts`）

| 列舉 | 值 | 說明 |
| :-- | :-- | :-- |
| `ActionType` | `LoadingProcess`、`Status`、`Alert`、`Modal`、`User`、`Album` | 全域狀態的分區名稱 |
| `LoadingProcessType` | `Ball`(`'balls'`)、`Bars`、`Bubbles`、`Cubes`、`Cylon`、`Spin`、`SpinningBubbles`、`Spokes` | Loading 動畫樣式，值同時是 CSS class 名稱 |
| `AlertType` | `Normal`(`''`)、`Info`、`Success`、`Warning`、`Error` | 提示類型，值是 daisyUI 的 `alert-*` class |
| `UserType` | `Admin`(`'admin'`)、`InHouse`(`'inHouse'`)、`User`(`'user'`)、`Guest`(`'guest'`) | 使用者權限 |
| `TransitionType` | `Unset`、`FadeIn`、`FadeOut`、`DidFadeIn`、`DidFadeOut`、`Loop`、`Stop` | 轉場動畫狀態，目前沒有元件使用 |

### 常用型別

| 型別 | 說明 |
| :-- | :-- |
| `IState` | 整個全域狀態 |
| `IAction` | dispatch 的參數：`{ type: ActionType; state: Partial<...> }` |
| `TContext` | `Context` 的值：`[IState, Dispatch<IAction>]` |
| `IReactProps` | 只有 `children` 的 props，元件需要接收子元素時使用 |
| `IEnabled` | `{ enabled: boolean }` |

### 工具型別（`type-unity.ts`）

| 型別 | 用途 |
| :-- | :-- |
| `Debug<T>` | 把交集型別展開成一般物件，方便在編輯器看提示 |
| `Equal<X, Y>` | 判斷兩個型別是否完全相同 |
| `ReadyOnly<T>` | 所有屬性變成唯讀（名稱拼成 `ReadyOnly`，用法同 `Readonly`） |
| `Merge<T>` | 遞迴展開巢狀物件 |
| `Union<U>` | 把聯集轉成交集 |
| `ExpectValidArgs<FUNC, ARGS>` | 檢查參數是否符合函式簽名 |

每個型別在檔案內都有範例註解。

## 設定值（`config.ts`）

### `REST_PATH`

後端 API 的路徑名稱，hooks 透過它發送請求。新增 API 時要在這裡登記。

| 鍵 | 路徑 | 方法 | 用途 |
| :-- | :-- | :-- | :-- |
| `login` | `login` | POST | 登入驗證 |
| `connect` | `connect` | GET | 檢查資料庫連線 |
| `select` | `select` | POST | 取得整個 collection |
| `insert` | `insert` | POST | 新增一筆 |
| `insertMany` | `insertMany` | POST | 新增多筆 |
| `delete` | `delete` | POST | 刪除一筆 |
| `update` | `update` | POST | 更新一筆 |
| `upload` | `upload` | POST | 上傳圖片 |
| `search` | `search` | POST | 列出資料夾內的圖片 |
| `remove` | `remove` | POST | 刪除單一圖片或資料夾 |
| `removeMany` | `removeMany` | POST | 刪除多張圖片 |

### `CAPTURE_PROPERTY`

圖片擷取（`lesca-react-capture-button`）的設定：`maxWidth: 500`（最大寬度，單位 px）、`compress: 0.3`（壓縮品質）。調整後，相簿上傳與編輯器插圖都會跟著改變。

## 樣式

- `global.css` 會載入 `tailwind.config.css`，裡面啟用 Tailwind 4 與 daisyUI 的全部主題。
- `config.less` 提供斷點變數 `@SM`、`@MD`、`@LG`，在 `.less` 檔以 `@import url('.../config.less')` 引用，`src/pages/user/index.less` 是範例。
- vite 設定了 Less 全域變數 `mainColor`。
