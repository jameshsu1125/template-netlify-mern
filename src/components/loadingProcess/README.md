# loadingProcess：讀取中畫面

蓋滿整個畫面的半透明遮罩，中央顯示動畫圖示與文字。用來告訴使用者「正在處理，請稍候」。

## 基本用法

不需要手動放進畫面。`src/pages/app.tsx` 會在全域狀態 `loadingProcess.enabled` 為 `true` 時自動渲染它，所以只要更新狀態：

```tsx
import { Context } from '@/settings/constant';
import { ActionType, LoadingProcessType } from '@/settings/type';
import { useContext } from 'react';

const Demo = () => {
  const [, setContext] = useContext(Context);

  const start = () =>
    setContext({
      type: ActionType.LoadingProcess,
      state: { enabled: true, type: LoadingProcessType.Bars, body: '處理中…' },
    });

  const stop = () =>
    setContext({ type: ActionType.LoadingProcess, state: { enabled: false } });

  return (
    <>
      <button onClick={start}>開始</button>
      <button onClick={stop}>結束</button>
    </>
  );
};
```

[`src/hooks`](../../hooks/README.md) 內大部分的 API hook 會自動開關這個畫面，所以呼叫 `useInsert` 等 hook 時不用自己處理。

## 全域狀態

這個元件沒有 Props，所有設定都來自 `context[ActionType.LoadingProcess]`：

| 欄位 | 型別 | 預設值 | 說明 |
| :-- | :-- | :-- | :-- |
| `enabled` | `boolean` | `false` | 是否顯示 |
| `type` | `LoadingProcessType` | `Spokes` | 動畫樣式 |
| `body` | `ReactNode` | `'loading'` | 圖示下方的文字，設為空字串 `''` 則不顯示文字 |

### 動畫樣式

| 列舉 | 值 | 圖檔 |
| :-- | :-- | :-- |
| `LoadingProcessType.Ball` | `'balls'` | `svg/loading-balls.svg` |
| `LoadingProcessType.Bars` | `'bars'` | `svg/loading-bars.svg` |
| `LoadingProcessType.Bubbles` | `'bubbles'` | `svg/loading-bubbles.svg` |
| `LoadingProcessType.Cubes` | `'cubes'` | `svg/loading-cubes.svg` |
| `LoadingProcessType.Cylon` | `'cylon'` | `svg/loading-cylon.svg` |
| `LoadingProcessType.Spin` | `'spin'` | `svg/loading-spin.svg` |
| `LoadingProcessType.SpinningBubbles` | `'spinningBubbles'` | `svg/loading-spinning-bubbles.svg` |
| `LoadingProcessType.Spokes` | `'spokes'` | `svg/loading-spokes.svg` |

## 運作方式

- 動畫用 CSS `mask-image` 實作：`index.less` 為每個樣式 class 指定對應的 SVG，元件再用 `bg-primary-content` 填色，所以圖示顏色會跟著 daisyUI 主題變化。
- 遮罩以 `absolute`、`z-50` 蓋滿父層，背景是 `bg-base-300` 加上 50% 透明度。
- 在登入流程中，`router.tsx` 也會直接把它當一般元件使用（等待 Auth0 回應時），此時沒有傳入設定，會使用全域狀態的預設樣式。

## 檔案

| 檔案 | 說明 |
| :-- | :-- |
| `index.tsx` | 元件本體 |
| `index.less` | 把樣式 class 對應到 SVG |
| `svg/` | 8 個動畫圖檔 |

## 注意事項

- 遮罩是 `absolute` 定位，會蓋住最近的定位祖先；在 `app.tsx` 中它位於 `.App`（`absolute`、全螢幕）的外層，所以是全螢幕效果。
- 新增動畫樣式時：在 `LoadingProcessType` 加入列舉值、在 `svg/` 放圖檔、在 `index.less` 新增同名 class。
- 前台（`UserApp`）也會渲染它，但目前前台沒有任何程式會開啟它。
