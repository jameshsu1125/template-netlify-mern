import '@/settings/global.css';
import Fetcher, { contentType, formatType } from 'lesca-fetcher';
import ReactDOM from 'react-dom/client';
import App from './app';

Fetcher.install({
  hostUrl: import.meta.env.VITE_API_PATH || './api',
  contentType: contentType.JSON,
  formatType: formatType.JSON,
});

if (import.meta.env.VITE_MOCKING === 'true') {
  import('@/mocks/browser').then((e) => {
    e.worker.start({ serviceWorker: { url: './mockServiceWorker.js' } });
  });
}

if (document.getElementById('app')?.children.length === 0) {
  ReactDOM.createRoot(document.getElementById('app')!).render(<App />);
}
