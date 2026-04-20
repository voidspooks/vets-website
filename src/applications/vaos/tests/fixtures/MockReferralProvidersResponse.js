/**
 * Class to create mock referral providers responses for Cypress tests
 */

/**
 * A small, deterministic pool of demo-ready provider records. CC entries live on
 * even indices and VA entries live on odd indices, matching the default
 * behavior of `createProvider` (even -> CC, odd -> VA).
 *
 * Each record contains enough information for the full referral scheduling
 * flow so that downstream endpoints (provider_slots, unified_bookings,
 * eps_appointments) can display the same provider, facility, address, and
 * timezone that the user selected on ProviderSelection.
 */
const DEMO_PROVIDERS = [
  // index 0 (CC)
  {
    name: 'Dr. Emma Chen',
    facilityName: 'Northside Community Clinic',
    organizationName: 'Northside Community Clinic',
    address: {
      street1: '1201 NW Couch St',
      city: 'Portland',
      state: 'OR',
      zip: '97209',
    },
    phone: '503-555-0110',
    latitude: 45.5235,
    longitude: -122.6835,
    timezone: 'America/Los_Angeles',
    visitMode: 'inPerson',
    specialty: { id: '208D00000X', name: 'Primary Care' },
  },
  // index 1 (VA)
  {
    name: 'Primary Care Clinic A',
    facilityName: 'Portland VA Medical Center',
    organizationName: 'Portland VA Medical Center',
    address: {
      street1: '3710 SW US Veterans Hospital Rd',
      city: 'Portland',
      state: 'OR',
      zip: '97239',
    },
    phone: '503-555-0101',
    latitude: 45.4977,
    longitude: -122.6834,
    timezone: 'America/Los_Angeles',
    visitMode: 'inPerson',
    locationId: '648',
    serviceType: 'primaryCare',
  },
  // index 2 (CC)
  {
    name: 'Dr. Marcus Johnson',
    facilityName: 'Summit Health Group',
    organizationName: 'Summit Health Group',
    address: {
      street1: '450 Peachtree St NE',
      city: 'Atlanta',
      state: 'GA',
      zip: '30308',
    },
    phone: '404-555-0120',
    latitude: 33.7756,
    longitude: -84.3863,
    timezone: 'America/New_York',
    visitMode: 'phone',
    specialty: { id: '207R00000X', name: 'Internal Medicine' },
  },
  // index 3 (VA)
  {
    name: 'Primary Care Clinic B',
    facilityName: 'Atlanta VA Medical Center',
    organizationName: 'Atlanta VA Medical Center',
    address: {
      street1: '1670 Clairmont Rd',
      city: 'Decatur',
      state: 'GA',
      zip: '30033',
    },
    phone: '404-555-0121',
    latitude: 33.8017,
    longitude: -84.3012,
    timezone: 'America/New_York',
    visitMode: 'inPerson',
    locationId: '508',
    serviceType: 'primaryCare',
  },
  // index 4 (CC)
  {
    name: 'Dr. Priya Patel',
    facilityName: 'Riverside Medical Plaza',
    organizationName: 'Riverside Medical Plaza',
    address: {
      street1: '25 Courtenay Dr',
      city: 'Charleston',
      state: 'SC',
      zip: '29403',
    },
    phone: '843-555-0140',
    latitude: 32.7878,
    longitude: -79.9483,
    timezone: 'America/New_York',
    visitMode: 'videoVirtual',
    specialty: { id: '207X00000X', name: 'Orthopaedic Surgery' },
  },
  // index 5 (VA)
  {
    name: 'Primary Care Clinic C',
    facilityName: 'Ralph H. Johnson VA Medical Center',
    organizationName: 'Ralph H. Johnson VA Medical Center',
    address: {
      street1: '109 Bee St',
      city: 'Charleston',
      state: 'SC',
      zip: '29401',
    },
    phone: '843-555-0141',
    latitude: 32.7841,
    longitude: -79.9355,
    timezone: 'America/New_York',
    visitMode: 'inPerson',
    locationId: '534',
    serviceType: 'primaryCare',
  },
  // index 6 (CC)
  {
    name: 'Dr. Luis Alvarez',
    facilityName: 'Harborview Wellness',
    organizationName: 'Harborview Wellness',
    address: {
      street1: '1105 Palmetto Ave',
      city: 'Melbourne',
      state: 'FL',
      zip: '32901',
    },
    phone: '321-555-0160',
    latitude: 28.0806,
    longitude: -80.6032,
    timezone: 'America/New_York',
    visitMode: 'inPerson',
    specialty: { id: '208100000X', name: 'Physical Medicine & Rehabilitation' },
  },
  // index 7 (VA)
  {
    name: 'Primary Care Clinic D',
    facilityName: 'Orlando VA Healthcare System',
    organizationName: 'Orlando VA Healthcare System',
    address: {
      street1: '13800 Veterans Way',
      city: 'Orlando',
      state: 'FL',
      zip: '32827',
    },
    phone: '407-555-0171',
    latitude: 28.3918,
    longitude: -81.2766,
    timezone: 'America/New_York',
    visitMode: 'inPerson',
    locationId: '675',
    serviceType: 'primaryCare',
  },
];

const DEMO_NETWORK_ID = 'sandbox-network-5vuTac8v';

/**
 * Returns the catalog entry for the given index, wrapping around if needed.
 */
function demoEntry(index) {
  return DEMO_PROVIDERS[index % DEMO_PROVIDERS.length];
}

/**
 * Resolves a provider id back to a full catalog entry shaped for display and
 * booking. Returns null when the id does not match either scheme.
 *
 * Accepted id schemes:
 *   - CC: `provider-${index}` (matches the list endpoint)
 *   - VA: `${1081 + index}` or `va-${1081 + index}` (matches the list endpoint)
 */
function getProviderById(rawId) {
  if (rawId == null) return null;
  const id = String(rawId);

  const ccMatch = id.match(/^provider-(\d+)$/);
  if (ccMatch) {
    const index = parseInt(ccMatch[1], 10);
    const entry = demoEntry(index);
    return {
      ...entry,
      id: `provider-${index}`,
      providerServiceId: `provider-${index}`,
      providerType: 'community_care',
      networkId: DEMO_NETWORK_ID,
      networkIds: [DEMO_NETWORK_ID],
      appointmentTypes: [
        {
          id: 'ov',
          name: 'Office Visit',
          isSelfSchedulable: true,
        },
      ],
    };
  }

  const vaMatch = id.match(/^(?:va-)?(\d+)$/);
  if (vaMatch) {
    const clinicId = vaMatch[1];
    const num = parseInt(clinicId, 10);
    const index = num >= 1081 ? num - 1081 : num;
    const entry = demoEntry(index);
    return {
      ...entry,
      id: clinicId,
      clinicId,
      locationId: entry.locationId || '534',
      serviceType: entry.serviceType || 'primaryCare',
      providerType: 'va',
    };
  }

  return null;
}

class MockReferralProvidersResponse {
  constructor(options = {}) {
    this.options = {
      page: 1,
      perPage: 5,
      totalEntries: 10,
      providerMode: null,
      success: true,
      notFound: false,
      serverError: false,
      ...options,
    };
  }

  /**
   * Creates a single unified provider row (matches /vaos/v2/providers JSON:API shape).
   *
   * @param {number} index - Index for unique provider generation
   * @param {Object} [options]
   * @param {'cc'|'va'|null} [options.providerMode] - When 'cc' or 'va', every row uses that type; when null, alternates by index (even CC, odd VA).
   * @returns {Object} A provider data object
   */
  static createProvider(index = 0, { providerMode = null } = {}) {
    let isVa;
    if (providerMode === 'va') {
      isVa = true;
    } else if (providerMode === 'cc') {
      isVa = false;
    } else {
      isVa = index % 2 === 1;
    }

    const entry = demoEntry(index);

    const shared = {
      driveTime: `${10 + index} min`,
      driveTimeInSeconds: (10 + index) * 60,
      distanceInMiles: 2 + index,
      nextAvailableDate: '2026-04-15T12:00:00.000Z',
      address: entry.address,
      phone: entry.phone,
      latitude: entry.latitude,
      longitude: entry.longitude,
    };

    if (isVa) {
      const clinicId = String(1081 + index);
      return {
        id: clinicId,
        type: 'unified_provider',
        attributes: {
          ...shared,
          name: entry.name,
          facilityName: entry.facilityName,
          providerType: 'va',
          locationId: entry.locationId || '534',
          serviceType: entry.serviceType || 'primaryCare',
        },
      };
    }

    return {
      id: `provider-${index}`,
      type: 'unified_provider',
      attributes: {
        ...shared,
        name: entry.name,
        facilityName: entry.facilityName,
        providerType: 'community_care',
        providerServiceId: `provider-${index}`,
        appointmentTypes: [
          {
            id: 'ov',
            name: 'Office Visit',
            isSelfSchedulable: true,
          },
        ],
        networkId: DEMO_NETWORK_ID,
      },
    };
  }

  /**
   * Creates a successful providers list response for a specific page
   *
   * @param {Object} options - Options for the response
   * @param {number} options.page - Current page number
   * @param {number} options.perPage - Number of providers per page
   * @param {number} options.totalEntries - Total number of providers across all pages
   * @returns {Object} A successful response object
   */
  static createSuccessResponse({
    page = 1,
    perPage = 5,
    totalEntries = 10,
    providerMode = null,
  } = {}) {
    const totalPages = Math.ceil(totalEntries / perPage);
    const startIndex = (page - 1) * perPage;
    const count = Math.min(perPage, totalEntries - startIndex);

    const providers = Array.from({ length: count }, (_, i) =>
      MockReferralProvidersResponse.createProvider(startIndex + i, {
        providerMode,
      }),
    );

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

  /**
   * Creates a 404 Not Found error response
   *
   * @param {string} referralId - ID of the referral that wasn't found
   * @returns {Object} A 404 error response object
   */
  static create404Response(referralId = 'unknown') {
    return {
      errors: [
        {
          title: 'Referral not found',
          detail: `Referral with ID ${referralId} was not found`,
          code: '404',
          status: '404',
        },
      ],
    };
  }

  /**
   * Creates a 500 Internal Server Error response
   *
   * @returns {Object} A 500 error response object
   */
  static create500Response() {
    return {
      errors: [
        {
          title: 'Internal Server Error',
          detail: 'An error occurred while retrieving providers',
          code: '500',
          status: '500',
        },
      ],
    };
  }

  /**
   * Gets the response object based on configuration
   *
   * @returns {Object} The complete response object
   */
  toJSON() {
    const {
      page,
      perPage,
      totalEntries,
      providerMode,
      notFound,
      serverError,
      success,
    } = this.options;

    if (notFound) {
      return MockReferralProvidersResponse.create404Response();
    }

    if (serverError) {
      return MockReferralProvidersResponse.create500Response();
    }

    if (!success) {
      return MockReferralProvidersResponse.create500Response();
    }

    return MockReferralProvidersResponse.createSuccessResponse({
      page,
      perPage,
      totalEntries,
      providerMode,
    });
  }
}

MockReferralProvidersResponse.getProviderById = getProviderById;
MockReferralProvidersResponse.DEMO_NETWORK_ID = DEMO_NETWORK_ID;

module.exports = MockReferralProvidersResponse;
module.exports.getProviderById = getProviderById;
module.exports.DEMO_NETWORK_ID = DEMO_NETWORK_ID;
