# Album 相簿改版 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `src/components/album` 改成「資料夾樹 + 縮圖格狀 + 詳細面板」，支援拖放、多張上傳到目前資料夾、批次刪除，並在編輯器 Modal 內以「插入」選圖。

**Architecture:** 相簿內部狀態集中在 `album/config.tsx` 的 `AlbumContext`（選取、詳細面板、樹快取、上傳佇列、確認框）；目前資料夾仍是全域 `context.album.folder`。資料夾樹逐層以 `search` 載入並快取。後端唯一改動：Cloudinary 模式的 `search` 併入子資料夾。

**Tech Stack:** React 19、TypeScript 5.9、Tailwind 4 + daisyUI 5（實作 UI 前載入 `daisyui` skill）、`react-icons`、`lesca-react-capture-button`、Express（Netlify Functions）、`cloudinary` v2。

**Spec:** `docs/superpowers/specs/2026-11-17-album-redesign-design.md`

## Global Constraints

- 分支：`feat/album-redesign`；每個 Task 結束 commit，訊息結尾加 `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`。
- 專案沒有測試框架。每個 Task 的驗證 = `npx tsc --noEmit` 零錯誤 + `npm run lint` 零錯誤 + 列出的手動檢查（`npm run dev`，`https://localhost:5173/admin/album`）。
- 只用 daisyUI 語意色（`bg-base-200`、`text-primary`…），不寫死色碼；動態 class 用 `twMerge`。
- 資料請求只走 `src/hooks/`，hooks 用 `@/settings/fetcher` 的 `post`。
- 元件 `memo` + `export default`；props 型別 `T` 開頭；Prettier 單引號、`printWidth: 100`。
- 不使用 `Tab` 元件（同畫面只能一組）；不使用 id `my-drawer-2`。
- 後端不可用 `@/`，用相對路徑；不改 CORS、`_redirects`、驗證邏輯。
- 刪除識別值規則不變：勾選 `pixels === 0` 用 `secure_url` 否則 `public_id`；資料夾用結尾 `/` 的 `public_id`。
- 資料夾路徑由前端組：`parent === '*' ? name : \`${parent}/${name}\``，不讀回應的 `folder` 欄位。

## Review Focus

1. **巢狀資料夾**（`a/b/c`）：進入、上傳、麵包屑跳回都要用完整相對路徑；現行程式只用 `filename`，第二層以下會錯。→ Task 3、4 手動檢查。
2. **多張上傳中有一張失敗或 >10MB**：其他張照常完成，失敗那張顯示 `msg` 並可重試。→ Task 6 手動檢查。
3. **Modal 內（編輯器插圖）**：寬度不足時樹收成按鈕、詳細面板「插入」可用、插入後 Modal 關閉且圖片插在游標處。→ Task 7 手動檢查。
4. **刪除目前所選的圖或所在資料夾後**：詳細面板關閉、選取清空、樹節點快取失效；刪掉的是目前資料夾時回到父層。→ Task 5 手動檢查。
5. **空資料夾 / `search` 回 `res: false`**：顯示空狀態文字，不當掉。→ Task 4 手動檢查。

---

### Task 1: 後端 Cloudinary `search` 併入子資料夾

**Files:**
- Modify: `netlify/functions/api/api.ts`（`router.post(\`/${REST_PATH.search}\`)` 的 cloudinary 分支）
- Modify: `netlify/functions/README.md`、`AGENTS.md` 10.2

**Interfaces:**
- Produces: Cloudinary 模式 `search` 回應的 `data` 前段為資料夾項目：`{ resource_type: 'folder', type: 'folder', filename: <name>, folder: <父相對路徑>, public_id: '<cloudinary path>/', secure_url: '', url: '', width: 0, height: 0, pixels: 0, ... }`（其餘 `TUploadRespond` 欄位填空字串 / 0 / `null`），格式與 BunnyCDN 一致。

- [ ] **Step 1:** 新增 `const cloudinaryPath = (folder: string) => folder && folder !== '*' ? \`${BASE}/${folder}\` : BASE`（`BASE = process.env.CLOUDINARY_BASE_FOLDER`），search expression 與 `sub_folders` 都用它（同時修正 `'*'` 被接成 `BASE/*` 的問題）。
- [ ] **Step 2:** `Promise.all([search.expression(\`folder="${path}"\`).execute(), cloudinary.v2.api.sub_folders(path).catch(() => ({ folders: [] }))])`，把 `folders` map 成資料夾項目放在 `resources` 前。`sub_folders` 失敗不影響檔案結果。
- [ ] **Step 3:** 驗證 `npx tsc --noEmit`、`npm run lint` 通過；若有 Cloudinary 環境，`CLOUD_STORAGE_TYPE=cloudinary` 下查根目錄與子資料夾，確認回應有資料夾項目。沒有環境就在 commit 訊息註明「未實測」。
- [ ] **Step 4:** 更新 `netlify/functions/README.md` 與 `AGENTS.md` 10.2 的 `search` 列（「Cloudinary：併入子資料夾，資料夾排前」）。
- [ ] **Step 5:** Commit `feat(api): Cloudinary search 回傳子資料夾`

### Task 2: 相簿內部狀態與 `useUpload` 靜默模式

**Files:**
- Modify: `src/components/album/config.tsx`
- Modify: `src/hooks/useUpload.ts`、`src/hooks/README.md`、`AGENTS.md` 9.2

**Interfaces:**
- Produces（`config.tsx`）:
  ```ts
  export type TAlbumMode = 'manage' | 'picker';
  export type TQueueItem = { id: string; name: string; base64: string; folder: string;
    status: 'waiting' | 'uploading' | 'done' | 'error'; msg?: string };
  export type TConfirm = { title: string; body: string; public_id: string[] } | null;
  export type TAlbumState = {
    mode: TAlbumMode;
    selected: string[];                 // 勾選的刪除識別值
    detail: TUploadRespond | null;      // 詳細面板顯示的圖
    tree: Record<string, string[]>;     // key: 資料夾路徑（根為 '*'），value: 子資料夾名稱
    expanded: string[];
    queue: TQueueItem[];
    confirm: TConfirm;
    reload: number;                     // +1 觸發目前資料夾重查
  };
  export const AlbumState: TAlbumState; export const AlbumContext; // [state, setState]
  export const joinPath = (parent: string, name: string) => string; // 規則見 Global Constraints
  export const parentPath = (path: string) => string;              // 'a/b' → 'a'，'a' → '*'
  ```
- Produces（`useUpload`）: `useUpload({ silent?: boolean } = {})`，`fetch` 回傳 `Promise<IRespond>`（並照舊 `setState`）；`silent: true` 不開關 `LoadingProcess`，例外時回 `{ res: false, msg: String(e) }` 而非丟出。

- [ ] **Step 1:** 改寫 `config.tsx` 為上面的型別與初始值（`mode: 'manage'`，其餘空）。
- [ ] **Step 2:** 改 `useUpload`；確認現有呼叫端（只有 `album/upload.tsx`）仍可編譯。
- [ ] **Step 3:** `npx tsc --noEmit`（此時舊 `list/tr` 會因 `TAlbumState` 改變報錯 → 這兩個檔案在 Task 4、5 才刪；本 Task 先讓 `index.tsx` 暫時只渲染新骨架，避免中間狀態編譯失敗：舊檔先刪除，`index.tsx` 渲染 `<div>TODO</div>`）。
- [ ] **Step 4:** 更新 `src/hooks/README.md`、AGENTS 9.2 的 `useUpload` 列。
- [ ] **Step 5:** Commit `refactor(album): 新的內部狀態與 useUpload silent 模式`

### Task 3: 版面骨架、麵包屑、資料夾樹

**Files:**
- Modify: `src/components/album/index.tsx`
- Create: `src/components/album/breadcrumb.tsx`、`src/components/album/tree.tsx`

**Interfaces:**
- Consumes: `AlbumContext`、`joinPath`、`useSearch`（回傳 `[respond, fetch]`）。
- Produces: `Album` props `T = { mode?: TAlbumMode }`（預設 `'manage'`）；`Breadcrumb` 無 props；`Tree` 無 props。

- [ ] **Step 1:** `index.tsx`：`useState(AlbumState)` 並把 `mode` 寫入；版面 = 工具列（`Breadcrumb` + 右側按鈕區留給 Task 6）＋ 三欄 `flex`：`Tree`（`w-56`，`lg` 以下及 `mode==='picker'` 隱藏，改由工具列 daisyUI `dropdown` 按鈕「資料夾」顯示同一個 `Tree`）、中欄（Task 4）、`Detail`（Task 5，`detail` 為 null 時不渲染）。
- [ ] **Step 2:** `Breadcrumb`：把 `context.album.folder` 依 `/` 拆成各層，daisyUI `breadcrumbs`，第一層「相簿」→ `'*'`；點擊 `setContext({ type: ActionType.Album, state: { folder } })`。
- [ ] **Step 3:** `Tree`：根節點「相簿」。展開節點時若 `tree[path]` 未快取，用一個獨立的 `useSearch` 實例的 `fetch({ folder: path })` 取結果，只留 `resource_type === 'folder'` 的 `filename` 寫入 `tree[path]`。節點點名稱 = 切換資料夾；點箭頭 = 展開 / 收合；目前資料夾高亮（`menu` 的 `menu-active`）。注意：`useSearch` 會在掛載時自動查 `context.album.folder`，樹用的實例要忽略該次自動結果，只處理自己呼叫的回應（以 ref 記錄目前請求的 path）。
- [ ] **Step 4:** 手動：BunnyCDN 建 `a/b/c` 三層，樹可逐層展開，點 `c` 後麵包屑顯示「相簿 › a › b › c」，點「a」跳回。
- [ ] **Step 5:** `tsc` + `lint` 通過後 commit `feat(album): 版面骨架、麵包屑與資料夾樹`

### Task 4: 縮圖格狀與批次操作列

**Files:**
- Create: `src/components/album/grid.tsx`、`src/components/album/item.tsx`

**Interfaces:**
- Consumes: `useSearch`（主實例，跟著 `context.album.folder` 自動重查；`state.reload` 改變時再呼叫 `fetch({ folder })`）。
- Produces: `Item` props `T = { item: TUploadRespond }`；勾選識別值函式 `export const removeKey = (item: TUploadRespond) => item.pixels === 0 ? item.secure_url : item.public_id`（放 `item.tsx`）；確認框開啟方式 = `setState(S => ({ ...S, confirm: { title, body, public_id } }))`。

- [ ] **Step 1:** `Grid`：`grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3`；資料夾在前。回應 `res: false` 或空陣列 → 顯示「這個資料夾是空的」。查到結果時把子資料夾名稱同步寫入 `tree[folder]`（讓樹不用再查一次）。
- [ ] **Step 2:** `Item`（圖片）：`aspect-square` 縮圖、`object-cover`、左上 `checkbox`（不觸發開面板）、下方檔名截斷；點縮圖 `setState(detail = item)`，被選中時 `ring ring-primary`。寬高為 0 時沿用舊 `Size` 的瀏覽器量測邏輯（移到 `item.tsx` 內部）。
- [ ] **Step 3:** `Item`（資料夾）：資料夾圖示 + 名稱，點擊進入 `joinPath(folder, filename)`；右上 `dropdown` 有「刪除資料夾」→ 開確認框（`public_id` 用 `item.public_id`）。
- [ ] **Step 4:** 批次操作列：`selected.length > 0` 時在格狀上方 `sticky top-0` 顯示「已選 N 張」+「刪除」+「取消選取」。切換資料夾時清空 `selected` 與 `detail`。
- [ ] **Step 5:** 手動：Review Focus 1、5；勾 3 張出現操作列、取消選取消失。
- [ ] **Step 6:** commit `feat(album): 縮圖格狀與批次操作列`

### Task 5: 詳細面板與刪除確認

**Files:**
- Create: `src/components/album/detail.tsx`、`src/components/album/confirm.tsx`

**Interfaces:**
- Consumes: `useRemove`、`useRemoveMany`、`removeKey`、`parentPath`。
- Produces: picker 模式選圖 = `setContext({ type: ActionType.Album, state: { copiedText: url } })` 後 `setContext({ type: ActionType.Modal, state: { enabled: false } })`（與現有 `tiptab/menu.tsx` 的約定相同）。

- [ ] **Step 1:** `Detail`（`w-72`，可關閉 ✕）：大圖、檔名、尺寸、`folder/filename`。`manage` 主按鈕「複製網址」（`useCopyToClipboard` + 成功 / 失敗 Alert，文字沿用 `網址已經複製到剪貼簿` / `剪貼簿功能不支援`）；`picker` 主按鈕「插入」。另有「開新分頁」、「刪除」（開確認框，`public_id: [detail.public_id]`）。窄螢幕改為格狀下方全寬顯示。
- [ ] **Step 2:** `AlbumConfirm`：`state.confirm` 非 null 時渲染 daisyUI `modal modal-open`（`z-50`，要蓋過編輯器的全域 Modal），按「刪除」：1 筆 `useRemove`、多筆 `useRemoveMany`；完成後 Alert（成功 `Success` / 失敗 `Error`，`body` 用 `msg`），清空 `confirm`、`selected`、被刪的 `detail`，刪的是資料夾時清掉 `tree` 對應快取並若為目前資料夾則切到 `parentPath`，最後 `reload + 1`。
- [ ] **Step 3:** 手動：Review Focus 4；刪單張、批次、資料夾各一次；按取消不刪。
- [ ] **Step 4:** commit `feat(album): 詳細面板與刪除確認`

### Task 6: 拖放與多張上傳佇列

**Files:**
- Create: `src/components/album/uploader.tsx`
- Modify: `src/components/album/index.tsx`（工具列加「上傳」「＋資料夾」，中欄外包拖放區）

**Interfaces:**
- Consumes: `useUpload({ silent: true })`、`CAPTURE_PROPERTY`、`TQueueItem`、`joinPath`。
- Produces: `UploadButton`、`NewFolderButton`、`DropZone`（`children`）、`UploadQueue` 四個 export（`DropZone` 為 default 以外的具名 export 皆可，維持同一檔案）。

- [ ] **Step 1:** 壓縮：`UploadButton` 用 `CaptureProvider`（確認它支援多選；若 `onCapture` 回傳陣列即可多張，否則用原生 `<input type='file' multiple accept='image/*'>` 並以 canvas 依 `CAPTURE_PROPERTY.maxWidth`、`compress` 壓成 JPEG base64）。`DropZone` 一律用 canvas 路徑。共用 `compressFile(file: File): Promise<{ base64: string; name: string }>`。
- [ ] **Step 2:** 加入佇列時 `folder` 固定為當下 `context.album.folder`（`'*'` 轉成 `''`）。逐張（併發 1）以 `await upload(...)` 處理，更新該項 `status` / `msg`；全部結束後 `reload + 1`。
- [ ] **Step 3:** `DropZone`：`dragenter/over` 顯示覆蓋層「放開以上傳到 <目前資料夾>」，只接受 `image/*`。
- [ ] **Step 4:** `UploadQueue`：右下 `fixed` 卡片，列出每張名稱與狀態（`loading` / ✓ / ✕+`msg`+「重試」），全部完成後可關閉。
- [ ] **Step 5:** `NewFolderButton`：daisyUI `modal` 輸入名稱（去除前後空白、不可含 `/`、不可空）→ 開選檔，佇列 `folder = joinPath(目前, 名稱)`；完成後清掉 `tree[目前]` 快取讓樹重查。
- [ ] **Step 6:** 手動：Review Focus 2（含一張刻意失敗：可在 DevTools 將網路設為 offline 中途測試）；拖 3 張到子資料夾、全部出現在格狀。
- [ ] **Step 7:** commit `feat(album): 拖放與多張上傳佇列`

### Task 7: 編輯器整合與文件

**Files:**
- Modify: `src/components/tiptab/menu.tsx`（`body: <Album mode='picker' />`）
- Modify: `src/components/album/README.md`、`src/components/README.md`、`src/components/tiptab/README.md`（若提到 copy）、`AGENTS.md` 8.8、8.9

- [ ] **Step 1:** `menu.tsx` 改傳 `mode='picker'`；插入邏輯不變。
- [ ] **Step 2:** 手動：Review Focus 3；`/admin/editor` 開「新增圖片」→ 在 Modal 中切資料夾、選圖、按「插入」→ 圖片出現在游標處。
- [ ] **Step 3:** 文件：album README 改寫（版面、`mode` prop、內部狀態、上傳佇列、Cloudinary 不支援刪資料夾）；AGENTS 8.8 的檔案清單與流程、8.9 插圖流程改為「插入」；元件一覽表的 `album` 列。
- [ ] **Step 4:** `npm run build` 與 `npm run lint` 全部通過。
- [ ] **Step 5:** commit `feat(album): 編輯器改用 picker 模式並同步文件`
