# tiptab：富文字編輯器

以 [Tiptap](https://tiptap.dev/) 為基礎的富文字編輯器，附上工具列與儲存按鈕。可以從[相簿](../album/README.md)挑選圖片插入內容。

## 基本用法

```tsx
import Tiptap from '@/components/tiptab';
import { useState } from 'react';

const Demo = () => {
  const [html] = useState('<p>初始內容</p>');

  return (
    <Tiptap
      html={html}
      onSave={(newHtml) => {
        console.log('要儲存的 HTML：', newHtml);
      }}
    />
  );
};
```

完整的儲存流程（讀取、新增、更新資料庫）可以參考 `src/pages/editor/index.tsx`。

## Props

| 名稱 | 型別 | 必填 | 說明 |
| :-- | :-- | :-: | :-- |
| `html` | `string` | 是 | 編輯器內容（HTML 字串）。當它與編輯器目前內容不同時，會自動覆蓋編輯器內容 |
| `onSave` | `(html: string) => void` | 是 | 按下「儲存」時呼叫，參數是目前編輯器內容的 HTML |

注意：元件不會自己儲存任何東西，儲存到哪裡由 `onSave` 決定。

## 工具列功能

工具列由 `menu.tsx` 的 `MenuBar` 提供，滑過按鈕會顯示中文提示。

| 分類 | 功能 |
| :-- | :-- |
| 文字樣式 | 粗體、斜體、刪除線、行內程式碼 |
| 清除 | 清除標記（`unsetAllMarks`）、清除節點（`clearNodes`） |
| 區塊 | 段落、標題 1～4、項目清單、有序清單、程式區塊、引用區塊、水平線、換行 |
| 圖片 | 新增圖片（開啟相簿） |
| 歷史 | 復原、重做 |

啟用中的樣式會以主題主色高亮（`.is-active`）；粗體、斜體、刪除線、程式碼、復原、重做在當下不能使用時按鈕會變成停用。

## 插入圖片流程

1. 使用者按下工具列的「新增圖片」。
2. 元件透過全域狀態開啟 Modal，標題是 `Album`，內容是相簿元件。
3. 使用者在相簿按某張圖片的 `copy`，相簿會把網址寫入全域狀態 `album.copiedText`，並關閉 Modal。
4. Modal 關閉時（標題為 `Album` 且 `enabled` 變 `false`）觸發 `onClose`，編輯器把 `copiedText` 設為圖片 `src` 插入游標位置。

圖片可以拖曳縮放，且維持長寬比。

## 檔案

| 檔案 | 說明 |
| :-- | :-- |
| `index.tsx` | 編輯器本體、擴充套件設定、儲存按鈕 |
| `menu.tsx` | 工具列與插入圖片邏輯 |
| `index.less` | 編輯器內容樣式（標題、清單、程式碼、引用、水平線） |

### 啟用的 Tiptap 擴充

| 擴充 | 說明 |
| :-- | :-- |
| `StarterKit` | 基本功能：段落、標題、清單、粗斜體、引用、程式區塊等 |
| `TextStyle` | 文字樣式 |
| `Image` | 圖片，`inline: true`，啟用縮放並固定長寬比 |

要新增功能（表格、連結…），在 `index.tsx` 的 `extensions` 陣列加入對應的擴充，並到 `menu.tsx` 加入按鈕。

## 注意事項

- 需要在全域 `Context.Provider` 內使用（工具列會用到 Modal 與 Album 狀態）。
- 編輯區域有 `prose` 樣式，來自 `@tailwindcss/typography`；內容最小高度 `min-h-44`。
- 儲存的是 HTML，顯示時如果直接用 `dangerouslySetInnerHTML` 渲染使用者輸入，請注意 XSS，建議先淨化內容。
- `index.less` 內引用了 `var(--purple-light)`、`var(--black)` 等變數，專案的 `global.css` 沒有定義它們，所以行內程式碼、程式區塊的底色實際上是瀏覽器預設。
- 「儲存」按鈕文字固定為中文。
