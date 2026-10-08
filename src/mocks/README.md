# mocks：API 模擬（Mock Service Worker）

使用 [MSW](https://mswjs.io/) 在瀏覽器端攔截網路請求並回傳假資料。沒有後端、後端還沒做好、或想測試特殊回應時，都可以靠它繼續開發前端。

## 檔案一覽

| 檔案 | 用途 |
| :-- | :-- |
| `browser.ts` | 建立 MSW worker（`setupWorker(...handlers)`） |
| `handlers.ts` | 定義要攔截哪些請求、回傳什麼 |
| `public/mockServiceWorker.js` | MSW 的 Service Worker 腳本，由 MSW 產生，請勿手動修改 |

## 如何啟用

1. 在 `src/pages/.env.local` 設定：

   ```env
   VITE_MOCKING=true
   ```

2. 重新啟動開發伺服器。`src/pages/index.tsx` 會在啟動時檢查這個變數：

   ```ts
   if (import.meta.env.VITE_MOCKING === 'true') {
     import('@/mocks/browser').then((e) => {
       e.worker.start({ serviceWorker: { url: './mockServiceWorker.js' } });
     });
   }
   ```

3. 瀏覽器 Console 出現 `[MSW] Mocking enabled` 就代表成功。

不需要 Mock 時，把 `VITE_MOCKING` 改成其他值（或刪除）即可，正式環境請不要開啟。

## 目前的 handlers

| 方法與路徑 | 回應 |
| :-- | :-- |
| `GET` `connect` | 回傳 faker 產生的假資料（`userId`、`id`、`title`、`completed`） |
| `GET` `/api` | 狀態碼 `404`，訊息 `Out Of Service` |

> 目前的 `connect` handler 回傳的欄位與真實 API 不同（真實回應是 `{ res, msg }`），只是範例。如果前端程式依賴 `respond.res`，請改寫成符合 `IRespond` 的格式。

## 新增 handler

在 `handlers.ts` 的陣列加入新項目。MSW 2.x 之後（本專案使用 3.x）使用 `http` 與 `HttpResponse`：

```ts
import { REST_PATH } from '@/settings/config';
import { faker } from '@faker-js/faker';
import { mergePath } from 'lesca-fetcher';
import { HttpResponse, http } from 'msw';

export const handlers = [
  // 模擬 POST /api/select
  http.post(mergePath(REST_PATH.select), () => {
    return HttpResponse.json({
      res: true,
      msg: 'Data load successfully.',
      collection: 'user',
      data: [
        {
          _id: faker.string.uuid(),
          userName: faker.person.fullName(),
          email: faker.internet.email(),
          type: 'user',
        },
      ],
    });
  }),

  // 模擬錯誤
  http.post(mergePath(REST_PATH.insert), () => {
    return HttpResponse.json({ res: false, msg: 'Data saving failed' });
  }),
];
```

重點：

- 路徑請用 `mergePath(REST_PATH.xxx)`，才會跟 `Fetcher` 實際送出的網址一致。
- 回應格式要符合 [hooks](../hooks/README.md) 預期的 `IRespond`，前端才能正常運作。
- 舊版教學中的 `rest.get(..., (_, res, ctx) => res(ctx.json(...)))` 是 MSW 1.x 寫法，在這個專案（MSW 3.x）無法使用。

## 常見問題

**開了 `VITE_MOCKING` 但請求還是打到後端？**
Service Worker 只攔截它註冊範圍內且路徑相符的請求；確認 handler 的路徑與實際請求網址一致，並在瀏覽器的 Application → Service Workers 確認 `mockServiceWorker.js` 已啟用。

**Mock 與真實後端要同時使用？**
沒有被 handler 比對到的請求，MSW 預設會原樣送出（passthrough），所以只需要為想模擬的 API 寫 handler。
