import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider, theme, Spin } from 'antd';
import thTH from 'antd/locale/th_TH';
import enUS from 'antd/locale/en_US';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import App from './App';
import './i18n'; // Initialize i18n
import './index.css';
import './styles/game-theme.css';

// Set dayjs locale
dayjs.locale('th');

// Loading fallback for i18n
const I18nLoading = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: '#0f0f23'
  }}>
    <Spin size="large" />
  </div>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Suspense fallback={<I18nLoading />}>
      <BrowserRouter>
        <ConfigProvider
          locale={thTH}
          theme={{
            algorithm: theme.darkAlgorithm,
            token: {
              colorPrimary: '#a855f7',
              colorBgBase: '#0f0f23',
              colorBgContainer: '#1a1a2e',
              colorBgElevated: '#252541',
              colorBorder: '#374151',
              colorText: '#ffffff',
              colorTextSecondary: '#a0aec0',
              borderRadius: 12,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Thai", sans-serif',
            },
            components: {
              Button: {
                primaryColor: '#fff',
                colorPrimaryHover: '#c084fc',
              },
              Card: {
                colorBgContainer: '#1a1a2e',
                colorBorderSecondary: '#374151',
              },
            },
          }}
        >
          <App />
        </ConfigProvider>
      </BrowserRouter>
    </Suspense>
  </React.StrictMode>,
);

