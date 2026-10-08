# drawer：後台版面

後台所有頁面的外框：左邊是側邊欄（桌面版固定顯示，手機版收合成抽屜），右邊是內容區。包含導覽列、功能選單、使用者列。

## 基本用法

在 `src/pages/router.tsx` 中，登入成功後，所有頁面都包在 `Drawer` 裡：

```tsx
import Drawer from '@/components/drawer';

<Drawer>
  <Routes>
    <Route path='/album' element={<Album />} />
  </Routes>
</Drawer>;
```

## Props

| 名稱 | 型別 | 說明 |
| :-- | :-- | :-- |
| `children` | `ReactNode` | 要顯示在內容區的頁面 |

## 版面結構

```text
┌──────────────┬───────────────────────────────┐
│ NavBar       │ （手機）NavBarMobile            │
│  選單／標題／主題 ├───────────────────────────────┤
├──────────────┤                               │
│ MainBar      │      children（頁面內容）        │
│  TOOLS       │                               │
│  COLLECTION  │                               │
├──────────────┤                               │
│ UserBar      │                               │
│  頭像／登出    │                               │
└──────────────┴───────────────────────────────┘
```

- 桌面（`lg` 以上，≥1024px）：側邊欄固定展開（`drawer lg:drawer-open`）。
- 手機：內容區頂端顯示 `NavBarMobile`，按左上角按鈕才會滑出側邊欄。
- 切換路由後，如果手機版抽屜是打開的，會自動收合。

## 子元件

### NavBar（`navBar.tsx`）

側邊欄最上方的導覽列：

| 區塊 | 說明 |
| :-- | :-- |
| 左：選單按鈕 | 展開下拉選單。目前只有 `admin` 看得到「使用者列表」，連結到第一個 collection（`/user`） |
| 中：標題 | 顯示 `VITE_TITLE`，點擊回到首頁 |
| 右：主題切換 | 太陽／月亮開關，在 `luxury` 主題與預設主題間切換，狀態用 `lesca-local-storage` 存在 `theme` 鍵 |

`NavBarMobile` 是手機版的精簡列：開啟抽屜的按鈕加上標題。

### MainBar（`mainBar.tsx`）

側邊欄的主要選單：

| 區塊 | 內容 |
| :-- | :-- |
| TOOLS | 固定的兩個連結：`Album`（`/album`）、`Editor`（`/editor`） |
| COLLECTION LIST | 依 `SETTING.mongodb` 自動產生，**略過第一項**（使用者資料表），每項連結到 `/<collection 名稱>` |

> 新增 collection 後它會自動出現在清單，但你需要自己建立對應路由的頁面，否則點進去是 404。檔案內有 `TODO: add type for collection`。

### UserBar（`userBar.tsx`）

側邊欄底部：顯示使用者頭像、名稱與權限（滑過會顯示中文權限名稱），右側有登出按鈕（呼叫 Auth0 的 `logout()`）。

| 權限 | 顯示名稱 |
| :-- | :-- |
| `admin` | 管理員 |
| `inHouse` | 內部人員 |
| `user` | 使用者 |
| `guest` | 訪客 |

## 資料來源

使用者資訊來自全域狀態 `context[ActionType.User]`（登入成功後由 `router.tsx` 寫入）；collection 清單來自 `setting/index.ts`。

## 注意事項

- 使用 daisyUI 的 `drawer` 元件，抽屜開關靠 id 為 `my-drawer-2` 的 checkbox，頁面中不要再出現同樣 id 的元素。
- 必須在 `BrowserRouter` 與 `Context.Provider` 內使用，並且需要 Auth0 Provider（`UserBar` 呼叫 `useAuth0`）。
- 檔案中的主題色 `luxury` 是寫死的；若要換暗色主題，修改 `navBar.tsx` 的 `value='luxury'`。
