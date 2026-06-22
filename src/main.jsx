// 這裡是 ESM 直接讀取 CDN 版 React 的入口
const React = window.React;
const ReactDOM = window.ReactDOM;
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
