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
