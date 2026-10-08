# button：按鈕

daisyUI `btn` 按鈕的簡單封裝。預設帶有 `btn` 樣式，並允許呼叫端用 class 覆寫或追加。

## 基本用法

```tsx
import Button from '@/components/button';

const Demo = () => (
  <>
    <Button onClick={() => console.log('click')}>送出</Button>

    {/* 追加 daisyUI 與 Tailwind class */}
    <Button className='btn-primary btn-block uppercase' onClick={() => {}}>
      Submit
    </Button>
  </>
);
```

## Props

| 名稱 | 型別 | 預設值 | 說明 |
| :-- | :-- | :-- | :-- |
| `children` | `ReactNode` | — | 按鈕內容，可放文字或圖示 |
| `className` | `string` | `''` | 額外的 class，會與 `btn` 合併 |
| `onClick` | `() => void` | — | 點擊事件，**不會**收到 event 物件 |

所有 Props 都是唯讀（`ReadyOnly`）。

## 行為說明

- 使用 `tailwind-merge` 的 `twMerge('btn', className)` 合併 class。兩者衝突時以後者為準，例如傳入 `className='p-0'` 會覆蓋 `btn` 預設的 padding。
- 沒有 `type` 屬性，在 `<form>` 內使用時會被當成送出按鈕（瀏覽器預設 `type='submit'`）。若不想送出表單，請改用原生 `<button type='button'>`。

## 注意事項

- 目前只支援 `children`、`className`、`onClick`；需要 `disabled`、`type` 等屬性時，需要自行擴充 `index.tsx` 的 Props。
- 專案中 `album/list.tsx`、`album/upload.tsx` 有使用到。
