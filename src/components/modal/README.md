# modal：對話視窗

置中的對話視窗，可以放任意內容，底部有一個或多個按鈕。點擊背景或右上角的 ✕ 可以關閉。

## 基本用法

和 Alert 一樣由 `src/pages/app.tsx` 統一渲染，只要更新全域狀態 `modal`：

```tsx
import { Context } from '@/settings/constant';
import { ActionType } from '@/settings/type';
import { useContext } from 'react';

const Demo = () => {
  const [, setContext] = useContext(Context);

  const open = () =>
    setContext({
      type: ActionType.Modal,
      state: {
        enabled: true,
        title: '刪除確認',
        body: <p>確定要刪除這筆資料嗎？</p>,
        label: ['取消', '刪除'],
        onClose: (label) => {
          if (label === '刪除') console.log('使用者按了刪除');
        },
      },
    });

  return <button onClick={open}>開啟</button>;
};
```

## 全域狀態

這個元件沒有 Props，設定來自 `context[ActionType.Modal]`：

| 欄位 | 型別 | 預設值 | 說明 |
| :-- | :-- | :-- | :-- |
| `enabled` | `boolean` | `false` | 是否顯示 |
| `title` | `string` | `'title'` | 標題 |
| `body` | `ReactNode` | `'message'` | 內容，可以放任意元件 |
| `label` | `string \| string[]` | `'close'` | 底部按鈕文字。字串顯示一個按鈕，陣列顯示多個按鈕 |
| `onClose` | `(label?: string) => void` | 空函式 | 按下底部按鈕時呼叫，參數是被按下的按鈕文字 |
| `storage` | `any` | `{}` | 保留欄位，可用來暫存資料；元件本身不使用 |

## 行為說明

| 操作 | 結果 |
| :-- | :-- |
| 按下底部按鈕 | 先呼叫 `onClose(按鈕文字)`，再關閉視窗 |
| 點擊背景 | 只關閉視窗，**不會**呼叫 `onClose` |
| 點擊右上角 ✕ | 只關閉視窗，**不會**呼叫 `onClose` |

- 視窗最大寬度為 `max-w-7xl`（寬度 11/12），最大高度為 10/12 螢幕高度。
- 層級 `z-40`，在 Alert（`z-50`）之下。
- 使用 daisyUI 的 `modal modal-open`，打開時固定顯示，由全域狀態控制關閉。

## 實際使用範例

`tiptab` 的「新增圖片」按鈕會開啟 Modal，內容放入相簿元件，使用者在相簿按「copy」複製圖片網址後，相簿會自動關閉 Modal：

```tsx
setContext({
  type: ActionType.Modal,
  state: {
    enabled: true,
    title: 'Album',
    body: <Album />,
    onClose: () => { /* 把複製的網址插入編輯器 */ },
  },
});
```

詳見 [tiptab 的說明](../tiptab/README.md)。

## 注意事項

- 更新 Modal 狀態時**沒有傳入的欄位會保留上一次的值**。例如上一次設定了 `label: ['取消', '刪除']`，下一次沒傳 `label` 就會沿用。每次開啟都建議完整傳入 `title`、`body`、`label`、`onClose`。
- 只有後台（`AdminApp`）會渲染 Modal。
- 若 `label` 是陣列，按鈕的 `key` 使用文字本身，所以陣列內不要放重複的文字。
