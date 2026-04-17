/**
 * Class to create mock referral providers responses for Cypress tests
 */
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

    const shared = {
      driveTime: `${10 + index} min`,
      driveTimeInSeconds: (10 + index) * 60,
      distanceInMiles: 2 + index,
      nextAvailableDate: '2026-04-15T12:00:00.000Z',
      address: {
        street1: `${100 + index} Main St`,
        city: 'Portland',
        state: 'OR',
        zip: '97201',
      },
      phone: `503-555-${String(1000 + index).slice(0, 4)}`,
      latitude: 45.5152 + index * 0.01,
      longitude: -122.6784 + index * 0.01,
    };

    if (isVa) {
      const clinicId = String(1081 + index);
      return {
        id: clinicId,
        type: 'unified_provider',
        attributes: {
          ...shared,
          name: `VA Clinic Provider ${index}`,
          facilityName: `VA Medical Center ${index}`,
          providerType: 'va',
          locationId: '534',
          serviceType: 'primaryCare',
        },
      };
    }

    return {
      id: `provider-${index}`,
      type: 'unified_provider',
      attributes: {
        ...shared,
        name: `Dr. Provider ${index}`,
        facilityName: `Facility ${index}`,
        providerType: 'community_care',
        providerServiceId: `provider-${index}`,
        appointmentTypes: [
          {
            id: 'ov',
            name: 'Office Visit',
            isSelfSchedulable: true,
          },
        ],
        networkId: 'sandbox-network-5vuTac8v',
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

module.exports = MockReferralProvidersResponse;
