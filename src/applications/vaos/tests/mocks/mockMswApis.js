/**
 * @module testing/mocks/mockMswApis
 *
 * MSW (Mock Service Worker) based API mocking utilities for VAOS tests.
 * These functions use MSW's server.use() pattern for more reliable async testing,
 * particularly with Node 22 where timing-sensitive tests may be flaky with
 * sinon-based mocking.
 *
 * Use these instead of the setFetchJSONResponse-based mocks in mockApis.js
 * when tests need more reliable async behavior.
 */
import environment from '@department-of-veterans-affairs/platform-utilities/environment';
import {
  createGetHandler,
  createPostHandler,
  jsonResponse,
} from 'platform/testing/unit/msw-adapter';
import { server } from 'platform/testing/unit/mocha-setup';
import MockFacilityResponse from '../fixtures/MockFacilityResponse';

// =============================================================================
// URL Builders
// =============================================================================

/**
 * Build the facilities API URL (path only, query params handled by MSW)
 * @returns {string} The facilities API URL
 */
export const buildFacilitiesUrl = () => {
  return `${environment.API_URL}/vaos/v2/facilities`;
};

/**
 * Build the facility by ID API URL with path parameter
 * @returns {string} The facility by ID API URL with :facilityId placeholder
 */
export const buildFacilityByIdUrl = () => {
  return `${environment.API_URL}/vaos/v2/facilities/:facilityId`;
};

/**
 * Build the scheduling configurations API URL
 * @returns {string} The scheduling configurations API URL
 */
export const buildSchedulingConfigurationsUrl = () => {
  return `${environment.API_URL}/vaos/v2/scheduling/configurations`;
};

/**
 * Build the community care provider API URL
 * @returns {string} The CC provider API URL
 */
export const buildCCProviderUrl = () => {
  return `${environment.API_URL}/facilities_api/v2/ccp/provider`;
};

/**
 * Build the community care eligibility API URL
 * @param {string} serviceType - The service type (e.g., 'PrimaryCare')
 * @returns {string} The CC eligibility API URL
 */
export const buildCCEligibilityUrl = serviceType => {
  return `${
    environment.API_URL
  }/vaos/v2/community_care/eligibility/${serviceType}`;
};

/**
 * Build the appointments API URL
 * @returns {string} The appointments API URL
 */
export const buildAppointmentsUrl = () => {
  return `${environment.API_URL}/vaos/v2/appointments`;
};

/**
 * Build the provider-slots API URL
 * @returns {string} The provider-slots API URL
 */
export const buildProviderSlotsUrl = () => {
  return `${environment.API_URL}/vaos/v2/provider-slots`;
};

/**
 * Build the unified bookings API URL
 * @returns {string} The unified bookings API URL
 */
export const buildUnifiedBookingsUrl = () => {
  return `${environment.API_URL}/vaos/v2/unified_bookings`;
};

/**
 * Build the maintenance windows API URL
 * @returns {string} The maintenance windows API URL
 */
export const buildMaintenanceWindowsUrl = () => {
  return `${environment.API_URL}/v0/maintenance_windows/`;
};

// =============================================================================
// Mock API Functions
// =============================================================================

/**
 * Mock the facilities API endpoint using MSW
 *
 * @example GET '/vaos/v2/facilities'
 *
 * @param {Object} options
 * @param {Array} [options.response=[]] - The facility data to return
 * @param {number} [options.responseCode=200] - The HTTP response code
 */
export const mockFacilitiesApi = ({ response = [], responseCode = 200 }) => {
  const url = buildFacilitiesUrl();
  server.use(
    createGetHandler(
      url,
      () =>
        responseCode === 200
          ? jsonResponse({ data: response })
          : jsonResponse({ errors: [] }, { status: responseCode }),
    ),
  );
};

/**
 * Mock the facility by ID API endpoint using MSW
 *
 * @example GET '/vaos/v2/facilities/:facilityId'
 *
 * @param {Object} options
 * @param {Object} [options.response] - The facility data to return (or auto-generated from params)
 * @param {number} [options.responseCode=200] - The HTTP response code
 */
export const mockFacilityByIdApi = ({ response, responseCode = 200 }) => {
  const url = buildFacilityByIdUrl();
  server.use(
    createGetHandler(url, ({ params }) => {
      const facility =
        response ||
        new MockFacilityResponse({
          id: params.facilityId,
        });
      return responseCode === 200
        ? jsonResponse({ data: facility })
        : jsonResponse({ errors: [] }, { status: responseCode });
    }),
  );
};

/**
 * Mock the scheduling configurations API endpoint using MSW
 *
 * @example GET '/vaos/v2/scheduling/configurations'
 *
 * @param {Object} options
 * @param {Array} options.response - The configuration data to return
 * @param {number} [options.responseCode=200] - The HTTP response code
 */
export const mockSchedulingConfigurationsApi = ({
  response,
  responseCode = 200,
}) => {
  const url = buildSchedulingConfigurationsUrl();
  server.use(
    createGetHandler(
      url,
      () =>
        responseCode === 200
          ? jsonResponse({ data: response })
          : jsonResponse({ errors: [] }, { status: responseCode }),
    ),
  );
};

/**
 * Mock the community care provider API endpoint using MSW
 *
 * @example GET '/facilities_api/v2/ccp/provider'
 *
 * @param {Object} options
 * @param {Array} [options.response=[]] - The provider data to return
 * @param {number} [options.responseCode=200] - The HTTP response code
 */
export const mockCCProviderApi = ({ response = [], responseCode = 200 }) => {
  const url = buildCCProviderUrl();
  server.use(
    createGetHandler(
      url,
      () =>
        responseCode === 200
          ? jsonResponse({ data: response })
          : jsonResponse({ errors: [] }, { status: responseCode }),
    ),
  );
};

/**
 * Mock the community care eligibility API endpoint using MSW
 *
 * @example GET '/vaos/v2/community_care/eligibility/:serviceType'
 *
 * @param {Object} options
 * @param {string} options.serviceType - The service type (e.g., 'PrimaryCare')
 * @param {boolean} [options.eligible=true] - Whether the patient is eligible
 * @param {number} [options.responseCode=200] - The HTTP response code
 */
export const mockCCEligibilityApi = ({
  serviceType,
  eligible = true,
  responseCode = 200,
}) => {
  const url = buildCCEligibilityUrl(serviceType);
  server.use(
    createGetHandler(
      url,
      () =>
        responseCode === 200
          ? jsonResponse({
              data: {
                id: serviceType,
                attributes: {
                  eligible,
                },
              },
            })
          : jsonResponse({ errors: [] }, { status: responseCode }),
    ),
  );
};

/**
 * Mock the appointments GET API endpoint using MSW
 *
 * @example GET '/vaos/v2/appointments'
 *
 * @param {Object} options
 * @param {Object|Array} options.response - The appointment data to return
 * @param {number} [options.responseCode=200] - The HTTP response code
 */
export const mockAppointmentsGetApi = ({ response, responseCode = 200 }) => {
  const url = buildAppointmentsUrl();
  server.use(
    createGetHandler(
      url,
      () =>
        responseCode === 200
          ? jsonResponse(response)
          : jsonResponse({ errors: [] }, { status: responseCode }),
    ),
  );
};

/**
 * Mock the provider-slots GET API endpoint using MSW
 *
 * @example GET '/vaos/v2/provider-slots?referral_id=...&provider_id=...'
 *
 * @param {Object} options
 * @param {Object} options.response - The provider slots data to return
 * @param {number} [options.responseCode=200] - The HTTP response code
 */
export const mockProviderSlotsApi = ({ response, responseCode = 200 }) => {
  const url = buildProviderSlotsUrl();
  server.use(
    createGetHandler(
      url,
      () =>
        responseCode === 200
          ? jsonResponse({ data: response })
          : jsonResponse(
              { error: { status: responseCode, message: 'Error' } },
              { status: responseCode },
            ),
    ),
  );
};

/**
 * Mock the unified bookings POST API endpoint using MSW
 *
 * @example POST '/vaos/v2/unified_bookings'
 *
 * @param {Object} options
 * @param {Object} options.response - The booking data to return
 * @param {number} [options.responseCode=200] - The HTTP response code
 * @param {Function} [options.onRequest] - Optional callback to capture request data
 */
export const mockUnifiedBookingsApi = ({
  response,
  responseCode = 200,
  onRequest,
}) => {
  const url = buildUnifiedBookingsUrl();
  server.use(
    createPostHandler(url, ({ request }) => {
      if (onRequest) {
        onRequest(request.body);
      }
      return responseCode === 200
        ? jsonResponse({ data: response })
        : jsonResponse(
            { error: { status: responseCode, message: 'Error' } },
            { status: responseCode },
          );
    }),
  );
};

/**
 * Mock the maintenance windows API endpoint using MSW
 *
 * @example GET '/v0/maintenance_windows/'
 *
 * @param {Object} options
 * @param {Array} options.response - The maintenance windows data to return
 * @param {number} [options.responseCode=200] - The HTTP response code
 */
export const mockMaintenanceWindowsApi = ({ response, responseCode = 200 }) => {
  const url = buildMaintenanceWindowsUrl();
  server.use(
    createGetHandler(
      url,
      () =>
        responseCode === 200
          ? jsonResponse({ data: response })
          : jsonResponse({ errors: [] }, { status: responseCode }),
    ),
  );
};
