// Query parameter name for station number (used for v2 API with Cerner pilot)
export const STATION_NUMBER_PARAM = 'station_number';

export const medicationsUrls = {
  VA_HOME: '/../../../',
  MHV_HOME: '/../../my-health',
  MEDICATIONS_URL: '/my-health/medications',
  MEDICATIONS_REFILL_STATUS: '/my-health/medications/refill-status',
  MEDICATIONS_LIST: '/my-health/medications/list',
  MEDICATIONS_LOGIN: '/my-health/medications?next=loginModal&oauth=true',
  MEDICATIONS_REFILL: '/my-health/medications/refill',
  PRESCRIPTION_DETAILS: '/my-health/medications/prescription',
  RENEW_PRESCRIPTIONS_URL:
    'https://www.va.gov/resources/how-to-renew-a-va-prescription/',
  subdirectories: {
    BASE: '/',
    DOCUMENTATION: '/documentation',
    REFILL_STATUS: '/refill-status',
    REFILL: '/refill',
    DETAILS: '/prescription',
    LIST: '/list',
  },
};
