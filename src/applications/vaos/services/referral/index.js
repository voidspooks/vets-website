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
  return apiRequestWithUrl(
    `/vaos/v2/referrals/${referralId}/providers?page=${page}&perPage=${perPage}`,
    { method: 'GET' },
  );
}

export async function getAppointmentInfo(appointmentId) {
  const response = await apiRequestWithUrl(
    `/vaos/v2/eps_appointments/${appointmentId}`,
    {
      method: 'GET',
    },
  );
  return response.data;
}
