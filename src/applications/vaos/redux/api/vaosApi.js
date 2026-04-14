import environment from '@department-of-veterans-affairs/platform-utilities/environment';
import { createApi } from '@reduxjs/toolkit/query/react';
import { apiRequestWithUrl } from 'applications/vaos/services/utils';
import { captureError } from '../../utils/error';
import { fetchPendingAppointments } from '../actions';

export const vaosApi = createApi({
  reducerPath: 'appointmentApi',
  // When not using the built in fetch functionality, you have to return an
  // object with a data key as null to the baseQuery. Here we are using a util
  // function (apiRequestWithUrl) to make API call.
  baseQuery: () => ({ data: null }),
  // Cache is normally 60 seconds by default, but it causes each test
  // to take an additional 60 seconds to run, so we set it to 0.
  keepUnusedDataFor: environment.isUnitTest() ? 0 : 60,
  endpoints: builder => ({
    getReferralById: builder.query({
      async queryFn(referralId) {
        try {
          const response = await apiRequestWithUrl(
            `/vaos/v2/referrals/${referralId}`,
          );
          return { data: { ...response.data, meta: response.meta } };
        } catch (error) {
          captureError(error, false, 'fetch single referral');
          return {
            error: { status: error.status || 500, message: error.message },
          };
        }
      },
    }),
    getPatientReferrals: builder.query({
      async queryFn() {
        try {
          return await apiRequestWithUrl(`/vaos/v2/referrals`);
        } catch (error) {
          captureError(error, false, 'fetch all referrals');
          return {
            error: { status: error.status || 500, message: error.message },
          };
        }
      },
      // Needs an argument to be passed in to trigger the query.
      async onQueryStarted(id, { dispatch }) {
        dispatch(fetchPendingAppointments());
      },
    }),
    getAppointmentInfo: builder.query({
      async queryFn(appointmentId) {
        try {
          return await apiRequestWithUrl(
            `/vaos/v2/eps_appointments/${appointmentId}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'X-Page-Type': 'details',
              },
            },
          );
        } catch (error) {
          captureError(error, false, 'details fetch appointment info');
          return {
            error: { status: error.status || 500, message: error.message },
          };
        }
      },
    }),
    getUnifiedBooking: builder.query({
      async queryFn({ appointmentId, providerType }) {
        try {
          return await apiRequestWithUrl(
            `/vaos/v2/unified_bookings/${appointmentId}?provider_type=${providerType}`,
          );
        } catch (error) {
          captureError(error, false, 'fetch unified booking');
          return {
            error: { status: error.status || 500, message: error.message },
          };
        }
      },
    }),
    getProviderSlots: builder.query({
      async queryFn({ referralId, providerId }) {
        try {
          return await apiRequestWithUrl(
            `/vaos/v2/provider-slots?referral_id=${referralId}&provider_id=${providerId}`,
          );
        } catch (error) {
          captureError(error, false, 'fetch provider slots');
          return {
            error: { status: error.status || 500, message: error.message },
          };
        }
      },
    }),
    getReferralProviders: builder.query({
      async queryFn({ referralId, page = 1, perPage = 5 }) {
        try {
          const response = await apiRequestWithUrl(
            `/vaos/v2/referrals/${referralId}/providers?page=${page}&perPage=${perPage}`,
          );
          return {
            data: {
              providers: response.data,
              totalEntries: response.meta?.pagination?.totalEntries || 0,
            },
          };
        } catch (error) {
          captureError(error, false, 'fetch referral providers');
          return {
            error: { status: error.status || 500, message: error.message },
          };
        }
      },
      serializeQueryArgs({ queryArgs }) {
        return queryArgs.referralId;
      },
      merge(currentCache, newResponse) {
        currentCache.providers.push(...newResponse.providers);
        // Immer-backed merge — mutation is intentional
        // eslint-disable-next-line no-param-reassign
        currentCache.totalEntries = newResponse.totalEntries;
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page;
      },
    }),
    postReferralAppointment: builder.mutation({
      async queryFn(bookingPayload) {
        try {
          return await apiRequestWithUrl(`/vaos/v2/unified_bookings`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingPayload),
          });
        } catch (error) {
          captureError(error, false, 'post referral appointment');
          return {
            error: { status: error.status || 500, message: error?.message },
          };
        }
      },
    }),
  }),
});

export const {
  useGetReferralByIdQuery,
  useGetPatientReferralsQuery,
  useGetAppointmentInfoQuery,
  useGetUnifiedBookingQuery,
  useGetReferralProvidersQuery,
  usePostReferralAppointmentMutation,
  useGetProviderSlotsQuery,
} = vaosApi;
