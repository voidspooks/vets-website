export const mockProviderDetails = {
  id: '9mN718pH',
  name: 'Dr. Kristina Jones',
  careType: 'COMMUNITY CARE',
  facilityName: 'Facility Name',
  driveTime: '7 min',
  driveTimeInSeconds: 420,
  distanceInMiles: 2,
  nextAvailableDate: '2026-03-26',
  address: {
    street1: '123 Main St',
    city: 'Portland',
    state: 'OR',
    zip: '97201',
  },
  phone: '503-555-1234',
  latitude: 45.5152,
  longitude: -122.6784,
};

export function createMockProviderData(overrides = {}, index = 0) {
  return {
    ...mockProviderDetails,
    id: `provider-${index}`,
    name: `Dr. Provider ${index}`,
    ...overrides,
  };
}

export function createMockProvidersResponse({
  page = 1,
  perPage = 5,
  totalEntries = 10,
} = {}) {
  const totalPages = Math.ceil(totalEntries / perPage);
  const startIndex = (page - 1) * perPage;
  const count = Math.min(perPage, totalEntries - startIndex);

  const providers = Array.from({ length: count }, (_, i) => {
    const globalIndex = startIndex + i;
    return {
      id: `provider-${globalIndex}`,
      type: 'provider',
      attributes: createMockProviderData({}, globalIndex),
    };
  });

  return {
    data: providers,
    meta: {
      pagination: {
        currentPage: page,
        perPage,
        totalPages,
        totalEntries,
      },
    },
  };
}

export const mockProviders = [
  {
    id: 'va-provider-1',
    name: 'Primary Care Clinic A',
    careType: 'VA',
    facilityName: 'Portland VA Medical Center',
    driveTime: '12 min',
    driveTimeInSeconds: 720,
    distanceInMiles: 5,
    nextAvailableDate: '2026-04-02',
  },
  mockProviderDetails,
  {
    id: 'va-provider-2',
    name: 'Cardiology Clinic B',
    careType: 'VA',
    facilityName: 'Vancouver VA Clinic',
    driveTime: '18 min',
    driveTimeInSeconds: 1080,
    distanceInMiles: 8,
    nextAvailableDate: '2026-04-05',
  },
  {
    ...mockProviderDetails,
    id: '654321',
    name: 'Dr. Emily Carter',
  },
  {
    ...mockProviderDetails,
    id: '789012',
    name: 'Dr. Robert Kim',
  },
];

export const vaClinicInfo = {
  clinicName: 'VA Clinic Name',
  vaFacilityName: 'VA Facility Name',
  facilityDetails: {
    name: 'VA Facility Name',
    phone: '123-456-7890',
    tty: '711',
  },
};

export const ccProviderInfo = {
  providerName: 'CC Provider Name',
  providerOrganizationName: 'CC Provider Organization Name',
  facilityDetails: {
    name: 'CC Facility Name',
    phone: '123-456-7890',
    tty: '711',
  },
};
