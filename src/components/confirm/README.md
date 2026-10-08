# confirm：確認列

一條橫向的提示列，顯示一段問題與「Deny」、「Accept」兩個按鈕，用來在刪除等操作前再問使用者一次。

## 基本用法

```tsx
import Confirm from '@/components/confirm';
import { useState } from 'react';

const Demo = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <Confirm
          body='確定要刪除嗎？'
          onCancel={() => setOpen(false)}
          onConfirm={() => {
            setOpen(false);
            console.log('已確認');
          }}
        />
      )}
      <button onClick={() => setOpen(true)}>刪除</button>
    </>
  );
};
```

## Props

| 名稱 | 型別 | 必填 | 說明 |
| :-- | :-- | :-: | :-- |
| `body` | `string` | 是 | 顯示的問題文字 |
| `onConfirm` | `() => void` | 是 | 按下「Accept」時呼叫 |
| `onCancel` | `() => void` | 是 | 按下「Deny」時呼叫 |

## 行為說明

- 元件本身**不會自己關閉**，是否顯示完全由父層控制（用條件渲染），所以 `onConfirm` 與 `onCancel` 內都要記得把它關掉。
- 外觀是 daisyUI 的 `alert rounded-none`，會填滿父層寬度，左邊有一個資訊圖示。
- 按鈕文字固定為英文的 `Deny` 與 `Accept`，如需中文請直接修改 `index.tsx`。

## 實際使用範例

[album](../album/README.md) 元件用它來確認刪除圖片：相簿把「是否顯示、問題文字」存在自己的 `AlbumContext`，使用者按下 Accept 後，狀態中的 `submit` 變成 `true`，清單元件偵測到就發出刪除請求。

## 注意事項

- 若需要彈出式（置中、可點背景關閉）的確認，請改用 [modal](../modal/README.md)，並設定 `label: ['取消', '確定']`。
