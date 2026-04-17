import { apiRequest } from '@department-of-veterans-affairs/platform-utilities/api';
import { envApiUrl } from '../constants';

const baseURL = '/ask_va_api/v0';

export const ENDPOINTS = {
  addressValidation: `${envApiUrl}${baseURL}/address_validation`,
  diagnostics: `${envApiUrl}${baseURL}/diagnostics`,
  inquiries: `${envApiUrl}${baseURL}/inquiries`,
  inquiriesAuth: `${envApiUrl}${baseURL}/inquiries/auth`,
};

export async function getAllInquiries() {
  return apiRequest(ENDPOINTS.inquiries);
}

/** @param {string} inquiryId Also known as "reference number" or "inquiry number" */
export async function getInquiry(inquiryId) {
  return apiRequest(`${ENDPOINTS.inquiries}/${inquiryId}`);
}

/** @param {string} inquiryId Also known as "reference number" or "inquiry number" */
export async function getInquiryStatus(inquiryId) {
  return apiRequest(`${ENDPOINTS.inquiries}/${inquiryId}/status`);
}

export async function getDiagnostics() {
  return apiRequest(ENDPOINTS.diagnostics);
}

/** @param {object} address Address object containing address details */
export async function validateAddress(address) {
  /* eslint-disable camelcase */
  const postData = {
    address_line1: address.street,
    address_line2: address.street2,
    city: address.city || address.militaryAddress?.militaryPostOffice,
    zip_code: address.postalCode,
    state_code: address.state || address.militaryAddress?.militaryState,
    country_name: 'United States',
    country_code_iso3: 'USA',
    address_pou: 'RESIDENCE',
    address_type: 'DOMESTIC',
  };
  /* eslint-enable camelcase */

  return apiRequest(ENDPOINTS.addressValidation, {
    body: JSON.stringify({ address: { ...postData } }),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
