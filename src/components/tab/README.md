# tab：分頁標籤

使用 daisyUI 的 `tabs` 與 radio 按鈕實作的分頁，不需要 JavaScript 狀態就能切換。由 `Tab` 容器與 `Tab.Panel` 面板組成。

## 基本用法

```tsx
import Tab from '@/components/tab';

const Demo = () => (
  <Tab>
    <Tab.Panel id='Manage' label='管理' defaultChecked>
      <div>管理內容</div>
    </Tab.Panel>
    <Tab.Panel label='上傳'>
      <div>上傳內容</div>
    </Tab.Panel>
  </Tab>
);
```

## Props

### `Tab`

| 名稱 | 型別 | 說明 |
| :-- | :-- | :-- |
| `children` | `ReactNode` | 放入多個 `Tab.Panel` |

渲染成 `<div role="tablist" class="tabs tabs-lifted">`。

### `Tab.Panel`

| 名稱 | 型別 | 必填 | 預設值 | 說明 |
| :-- | :-- | :-: | :-- | :-- |
| `label` | `string` | 是 | — | 分頁標籤文字（同時是無障礙的 `aria-label`） |
| `children` | `ReactNode` | 否 | — | 面板內容 |
| `id` | `string` | 否 | — | 加在 radio `<input>` 上的 id，可用來以程式切換分頁 |
| `defaultChecked` | `boolean` | 否 | `false` | 是否預設選取這個分頁 |

## 行為說明

- 每個 `Tab.Panel` 會渲染一個 `<input type="radio" name="tab" class="tab">` 加上一個 `tab-content` 面板，daisyUI 利用 radio 的選取狀態顯示對應面板。
- 面板內容永遠會被渲染（只是以 CSS 隱藏），切換分頁不會讓內容卸載。
- 至少要有一個 `Tab.Panel` 設定 `defaultChecked`，否則一開始所有分頁都不會顯示內容。

## 以程式切換分頁

因為切換靠 radio，只要對指定 `id` 的 input 觸發 `click()`：

```tsx
document.querySelector<HTMLInputElement>('#Manage')?.click();
```

`album/upload.tsx` 在上傳完成後就是用這個方式回到「Manage」分頁。

## 注意事項

- 所有 `Tab.Panel` 的 radio 都使用同一個 `name='tab'`。**同一個畫面只能放一組 `Tab`**；如果兩組 `Tab` 同時存在，它們會互相影響選取狀態。這也代表在 Modal 內開啟相簿時，如果背景頁面同樣有 `Tab`，需要特別留意。
- `id` 在整個頁面必須唯一。
