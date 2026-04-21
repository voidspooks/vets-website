import { setupWorker } from 'msw';
import {
  mockApi,
  commonHandlers,
  createMaintenanceWindowsResponse,
  MAINTENANCE_WINDOWS_DELAY,
} from 'platform/mocks/browser';

// mock SAHSHA maintenance window
const sahshaDowntime = {
  id: '1',
  type: 'maintenance_windows',
  attributes: {
    externalService: 'sahsha',
    description: 'SAHSHA system is currently down for maintenance',
    startTime: new Date(Date.now() - 3600000).toISOString(), // Started 1 hour ago
    endTime: new Date(Date.now() + 3600000).toISOString(), // Ends 1 hour from now
    status: 'down',
    maintenanceType: 'scheduled',
  },
};

const handlers = [
  mockApi.get('/v0/maintenance_windows', (req, res, ctx) => {
    return res(
      ctx.delay(MAINTENANCE_WINDOWS_DELAY),
      ctx.json(createMaintenanceWindowsResponse([sahshaDowntime])),
    );
  }),
  ...commonHandlers,
];

export async function startMocking() {
  await setupWorker(...handlers).start({
    onUnhandledRequest: 'bypass',
    serviceWorker: { url: '/mockServiceWorker.js' },
  });
}
