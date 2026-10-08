# userInfo：使用者資訊側欄

一個包住頁面內容的版型：左邊（手機版是上方）是窄窄的使用者側欄，右邊放內容。側欄顯示頭像、權限圖示、管理員專屬的「用戶列表」連結與登出按鈕。

> **目前沒有任何頁面使用這個元件。** 後台版面已改用 [drawer](../drawer/README.md)。保留它是作為替代版型的範例，需要時可參考或移除。

## 基本用法

```tsx
import UserInfo from '@/components/userInfo';

const Page = () => (
  <UserInfo>
    <div>頁面內容</div>
  </UserInfo>
);
```

## Props

| 名稱 | 型別 | 說明 |
| :-- | :-- | :-- |
| `children` | `ReactNode` | 顯示在右側（手機版為下方）的內容 |

## 顯示內容

使用者資料來自全域狀態 `context[ActionType.User]`。

| 區塊 | 說明 |
| :-- | :-- |
| 頭像 | 使用者的 `picture` |
| 權限圖示 | 依 `type` 變化，滑過顯示權限文字 |
| 用戶列表連結 | 只有 `admin` 看得到，連結到第一個 collection（`/user`） |
| 登出 | 呼叫 Auth0 的 `logout()` |

權限圖示：

| 權限 | 圖示 |
| :-- | :-- |
| `admin` | `FaUserGear` |
| `inHouse` | `FaUserEdit` |
| `user` | `FaUserCheck` |
| `guest`（及其他） | `PiUserFocusBold` |

## 注意事項

- 需要在 `Context.Provider`、`BrowserRouter` 與 Auth0 Provider 內使用。
- 檔案內有未完成的除錯殘留：一個空的 `<div className='llll'>` 與一個常駐的 `loading-spinner`。若要正式使用請先清除。
- 版面在 `lg`（≥1024px）以上為左右排列，以下為上下排列。
