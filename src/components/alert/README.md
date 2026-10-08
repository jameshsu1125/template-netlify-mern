# alert：短暫提示訊息

顯示在畫面右下角的提示，一段時間後自動消失。適合用在「儲存成功」、「刪除失敗」這類操作回饋。

## 基本用法

不需要手動放進畫面。`src/pages/app.tsx` 會在全域狀態 `alert.enabled` 為 `true` 時渲染它：

```tsx
import { Context } from '@/settings/constant';
import { ActionType, AlertType } from '@/settings/type';
import { useContext } from 'react';

const Demo = () => {
  const [, setContext] = useContext(Context);

  return (
    <button
      onClick={() =>
        setContext({
          type: ActionType.Alert,
          state: { enabled: true, type: AlertType.Success, body: '儲存成功', time: 3000 },
        })
      }
    >
      儲存
    </button>
  );
};
```

## 全域狀態

這個元件沒有 Props，設定來自 `context[ActionType.Alert]`：

| 欄位 | 型別 | 預設值 | 說明 |
| :-- | :-- | :-- | :-- |
| `enabled` | `boolean` | `false` | 是否顯示 |
| `type` | `AlertType` | `Normal` | 提示類型，決定顏色與圖示 |
| `body` | `ReactNode` | `'message'` | 訊息內容，可以放文字或任意 React 元素 |
| `time` | `number` | `5000` | 顯示多久後自動關閉，單位毫秒 |

### 類型

| 列舉 | 值（daisyUI class） | 圖示 |
| :-- | :-- | :-- |
| `AlertType.Normal` | `''` | 藍色資訊圖示 |
| `AlertType.Info` | `'alert-info'` | 資訊 |
| `AlertType.Success` | `'alert-success'` | 打勾 |
| `AlertType.Warning` | `'alert-warning'` | 警告三角形 |
| `AlertType.Error` | `'alert-error'` | 叉叉 |

## 行為說明

- **自動關閉**：每當 `body` 改變，元件會重設計時器，`time` 毫秒後把 `enabled` 設為 `false`。
- **連續觸發**：訊息內容不同時會重新計時。如果連續送出**完全相同**的 `body`，計時器不會重設，第一次的倒數結束就會關閉。
- **位置**：`fixed right-1 bottom-1 z-50`，固定在右下角，層級在 Modal（`z-40`）之上。
- **圖示**：存放在 `icon.tsx`，每種類型一個 SVG。

## 檔案

| 檔案 | 說明 |
| :-- | :-- |
| `index.tsx` | 元件本體 |
| `icon.tsx` | `info`、`success`、`warning`、`error`、`normal` 五個圖示 |

## 注意事項

- 只有後台（`AdminApp`）會渲染 Alert；前台沒有。
- 若同一個畫面要顯示多則訊息，後出現的會取代先前的，不會堆疊。
