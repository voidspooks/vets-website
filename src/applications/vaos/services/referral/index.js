import { apiRequestWithUrl } from '../utils';

export async function getPatientReferralById(referralId) {
  const response = await apiRequestWithUrl(`/vaos/v2/referrals/${referralId}`, {
    method: 'GET',
  });
  return response.data;
}

export async function getProviderById(providerId) {
  const response = await apiRequestWithUrl(
    `/vaos/v2/epsApi/providerDetails/${providerId}`,
    {
      method: 'GET',
    },
  );
  return response.data;
}

export async function getProvidersByReferralId(
  referralId,
  { page = 1, perPage = 5 } = {},
) {
  const query = new URLSearchParams();
  query.set('referral_id', referralId);
  query.set('page', String(page));
  query.set('perPage', String(perPage));
  return apiRequestWithUrl(`/vaos/v2/providers?${query}`, { method: 'GET' });
}

export async function getAppointmentInfo(appointmentId, providerType = 'eps') {
  const response = await apiRequestWithUrl(
    `/vaos/v2/unified_bookings/${appointmentId}?provider_type=${providerType}`,
    {
      method: 'GET',
    },
  );
  return response.data;
}
