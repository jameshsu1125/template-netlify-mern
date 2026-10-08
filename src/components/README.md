# components：共用 UI 元件

這裡放可以重複使用的 React 元件。每個元件一個資料夾，資料夾內都有自己的 `README.md`，說明用途、Props 與用法。

## 元件一覽

| 元件 | 類型 | 用途 | 說明文件 |
| :-- | :-- | :-- | :-- |
| `loadingProcess` | 全域提示 | 全螢幕讀取中畫面，有 8 種動畫 | [README](loadingProcess/README.md) |
| `alert` | 全域提示 | 右下角的短暫訊息（資訊、成功、警告、錯誤） | [README](alert/README.md) |
| `modal` | 全域提示 | 置中的對話視窗，可放任意內容與按鈕 | [README](modal/README.md) |
| `confirm` | 通用 | 頂部確認列（Accept／Deny） | [README](confirm/README.md) |
| `button` | 通用 | daisyUI 按鈕的簡單封裝，可用 class 覆寫樣式 | [README](button/README.md) |
| `tab` | 通用 | 分頁標籤（`Tab` 與 `Tab.Panel`） | [README](tab/README.md) |
| `drawer` | 版型 | 後台版面：側邊欄、導覽列、使用者列 | [README](drawer/README.md) |
| `album` | 功能 | 圖片管理：瀏覽、上傳、複製網址、刪除 | [README](album/README.md) |
| `tiptab` | 功能 | Tiptap 富文字編輯器，可從相簿插入圖片 | [README](tiptab/README.md) |
| `userInfo` | 版型 | 使用者資訊側欄（目前沒有被任何頁面使用） | [README](userInfo/README.md) |

### 三種「全域提示」與一般元件的差別

`loadingProcess`、`alert`、`modal` 不是由你直接 `<Alert />` 放進畫面，而是由 `src/pages/app.tsx` 統一渲染，你只要更新全域狀態，它們就會出現或消失：

```tsx
import { Context } from '@/settings/constant';
import { ActionType, AlertType } from '@/settings/type';
import { useContext } from 'react';

const [, setContext] = useContext(Context);

// 顯示成功提示
setContext({
  type: ActionType.Alert,
  state: { enabled: true, type: AlertType.Success, body: '儲存成功' },
});
```

全域狀態的完整欄位請看 [src/settings/README.md](../settings/README.md)。

其他元件（`button`、`confirm`、`tab`、`drawer`、`album`、`tiptab`、`userInfo`）則是一般元件，直接在 JSX 內使用。

## 元件之間的關係

```text
Drawer（後台版面）
 ├─ NavBar / NavBarMobile ── 主題切換、使用者列表連結
 ├─ MainBar ──────────────── 工具與 collection 連結
 ├─ UserBar ──────────────── 使用者頭像、登出
 └─ 內容區
     ├─ Album 頁 ─────────── album 元件
     └─ Editor 頁 ────────── tiptab 元件
                                └─ 「新增圖片」按鈕 → 開啟 Modal，內容是 album 元件
                                       └─ album 內使用 tab、confirm、button
```

## 使用的樣式工具

- **Tailwind CSS 4 + daisyUI 5**：絕大多數樣式都用 class 完成（例如 `btn`、`alert`、`modal`、`tabs`、`drawer`）。
- **tailwind-merge**：`twMerge` 用來合併 class，讓呼叫端傳進來的 class 可以覆寫預設值。
- **Less**：只有 `loadingProcess` 與 `tiptab` 需要額外的樣式檔。
- **react-icons**：圖示來源。

## 撰寫新元件的規範

1. 放在 `src/components/<名稱>/index.tsx`，資料夾名稱用 camelCase（現有的 `loadingProcess` 就是這種寫法）。
2. 元件名稱使用 PascalCase，用 `memo` 包裝（純展示、無內部狀態的簡單元件可以不包）。
3. Props 型別以 `T` 開頭（例如 `TProps`），需要子元素時使用 `IReactProps`（見 `src/settings/type.ts`）。
4. 需要全域狀態時從 `@/settings/constant` 取用 `Context`；不要在元件內直接寫 `fetch`，改用 [hooks](../hooks/README.md)。
5. 為這個元件寫一份 `README.md`，至少包含：用途、基本用法、Props 表格、注意事項。
6. 別忘了回到本檔案的「元件一覽」表格新增一列。

### 單一元件說明文件的建議格式

```md
# 元件名稱

一句話說明用途。

## 基本用法
（可直接複製使用的範例）

## Props
| 名稱 | 型別 | 預設值 | 說明 |

## 行為說明
（內部運作、與全域狀態的互動）

## 注意事項
```
