import { createRoot } from 'react-dom/client';
import type { AnyAction } from 'redux';
import { Provider } from 'react-redux';
import axios from 'axios';
import { store } from './store';
import config from 'config';
import App from 'src/App';
import { doInit } from 'store/actions/authActions';
import * as Sentry from '@sentry/react';
import FallbackComponent from 'components/FallbackComponent/FallbackComponent';
// import checkVersion from 'checkVersion';

if (!import.meta.env.REACT_APP_ENV) {
  throw new Error('REACT_APP_ENV is not defined. Required to run the project.');
}

axios.defaults.baseURL = config.baseURLApi;
axios.defaults.timeout = 3600000; // one hour
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['X-Tenant-ID'] =
  import.meta.env.REACT_APP_ENV ?? '';

const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
}

Sentry.init({
  dsn: import.meta.env.REACT_APP_SENTRY_DSN,
  environment: import.meta.env.REACT_APP_ENV,
  release: config.releaseName,
  // disable in dev mode
  sampleRate: !import.meta.env.DEV ? 0.2 : 0.02,
  tracesSampleRate: !import.meta.env.DEV ? 0.2 : 0.02,
  replaysSessionSampleRate: !import.meta.env.DEV ? 0.1 : 0.02,
  replaysOnErrorSampleRate: !import.meta.env.DEV ? 1.0 : 0.02,
  integrations: [
    Sentry.feedbackIntegration({
      autoInject: false,
      colorScheme: 'light',
    }),
  ],
});

store.dispatch(doInit() as any as AnyAction);
const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <Provider store={store}>
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => (
        <FallbackComponent
          error={error instanceof Error ? error : new Error(String(error))}
          onRetry={resetError}
        />
      )}
    >
      <App />
    </Sentry.ErrorBoundary>
  </Provider>,
);
