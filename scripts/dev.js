import { spawn } from 'node:child_process';

// 1. 啟動 netlify dev 並指定資料夾為 dist
const netlify = spawn('npx netlify dev --dir=dist', { shell: true });

netlify.stdout.on('data', (data) => {
  const output = data.toString();

  // 保留 Netlify 原本的終端機輸出內容
  process.stdout.write(output);

  // 2. 偵測到 Ready 關鍵字，觸發後續的 npm run dev
  if (output.includes('Local dev server ready')) {
    console.log('\n🚀 [Netlify 就緒] 正在啟動後續的開發服務 (npm run dev)... \n');

    // 啟動您原本想執行的 npm run dev
    spawn('vite --host', {
      shell: true,
      stdio: 'inherit', // 讓這個指令的輸出直接顯示在同一個終端機上
    });
  }
});

netlify.stderr.on('data', (data) => {
  process.stderr.write(data.toString());
});

netlify.on('close', (code) => {
  process.exit(code);
});
