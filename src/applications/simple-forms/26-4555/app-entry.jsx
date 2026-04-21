import 'platform/polyfills';
import './sass/4555-adapted-housing.scss';
import startApp from 'platform/startup';
import routes from './routes';
import reducer from './reducers';
import manifest from './manifest.json';

function initApp() {
  startApp({
    entryName: manifest.entryName,
    url: manifest.rootUrl,
    reducer,
    routes,
  });
}

// Enable MSW mocking for local development
// Read src/platform/mocks/README.md to render `DowntimeNotification` component
if (process.env.USE_MOCKS === 'true') {
  import('./mocks/browser')
    .then(({ startMocking }) => startMocking())
    .then(() => initApp())
    .catch(error => {
      // eslint-disable-next-line no-console
      console.error('MSW failed to start, continuing without mocks.', error);
      initApp();
    });
} else {
  initApp();
}
