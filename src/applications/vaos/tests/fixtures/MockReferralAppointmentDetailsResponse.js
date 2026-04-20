/**
 * Class to create mock appointment details responses for Cypress tests
 */
class MockReferralAppointmentDetailsResponse {
  constructor(options = {}) {
    this.options = {
      appointmentId: 'EEKoGzEf',
      success: true,
      notFound: false,
      serverError: false,
      ...options,
    };
  }

  /**
   * Creates a successful appointment details response
   *
   * @param {Object} options - Options for the response
   * @param {string} options.appointmentId - ID for the appointment
   * @param {string} [options.status] - 'booked' or 'proposed'
   * @param {string} [options.start] - ISO timestamp for the booked appointment start
   * @param {string} [options.referralId] - Referral id to attach to the appointment
   * @param {string} [options.typeOfCare] - Category of care for the appointment
   * @param {string} [options.careType] - 'CC' or 'VA'
   * @param {Object} [options.provider] - Pre-built provider object to use instead of the default Dr. Smith
   * @param {string} [options.organizationName] - Location/organization display name
   * @returns {Object} A successful response object
   */
  static createSuccessResponse({
    appointmentId = 'EEKoGzEf',
    organizationName = 'Meridian Health',
    status = 'booked',
    start,
    referralId = '123abc',
    typeOfCare,
    careType = 'CC',
    provider,
  } = {}) {
    const resolvedStart =
      start ||
      new Date(new Date().setDate(new Date().getDate() + 30)).toISOString();

    const baseAttributes =
      status === 'booked'
        ? {
            id: appointmentId,
            status,
            careType,
            start: resolvedStart,
            isLatest: true,
            lastRetrieved: new Date().toISOString(),
            referralId,
            past: false,
            ...(typeOfCare ? { typeOfCare } : {}),
          }
        : {
            id: appointmentId,
            status,
            careType,
            modality: careType === 'VA' ? 'clinic' : 'communityCareUnified',
          };

    const resolvedProvider = provider || {
      id: 'test-provider-id',
      name: 'Dr. Smith @ Acme Cardiology - Anywhere, USA',
      practice: 'Acme Cardiology',
      phone: '555-555-0001',
      location: {
        name: organizationName,
        address: '7500 CENTRAL AVE, STE 108, PHILADELPHIA, PA 19111-2430',
        latitude: 40.06999282694126,
        longitude: -75.08769957031448,
        timezone: 'America/New_York',
      },
    };

    const resolvedOrganizationName =
      resolvedProvider?.location?.name || organizationName;
    const resolvedTimezone =
      resolvedProvider?.location?.timezone || 'America/New_York';

    const bookedAttributes =
      status === 'booked'
        ? {
            modality: careType === 'VA' ? 'clinic' : 'communityCareUnified',
            provider: resolvedProvider,
            location: {
              id: 'test-location-id',
              type: 'appointments',
              attributes: {
                name: resolvedOrganizationName,
                timezone: {
                  timeZoneId: resolvedTimezone,
                },
              },
            },
          }
        : {};

    return {
      data: {
        id: appointmentId,
        type: 'appointment',
        attributes: {
          ...baseAttributes,
          ...bookedAttributes,
        },
      },
    };
  }

  /**
   * Creates a 404 Not Found error response
   *
   * @param {string} appointmentId - ID of the appointment that wasn't found
   * @returns {Object} A 404 error response object
   */
  static create404Response(appointmentId = 'EEKoGzEf') {
    return {
      errors: [
        {
          title: 'Appointment not found',
          detail: `Appointment with ID ${appointmentId} was not found`,
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
          detail: 'An error occurred while retrieving appointment details',
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
      appointmentId,
      typeOfCare,
      organizationName = 'Meridian Health',
      success,
      notFound,
      serverError,
      status = 'booked',
      start,
      referralId,
      careType,
      provider,
    } = this.options;

    // Return 404 error if notFound is true
    if (notFound) {
      return MockReferralAppointmentDetailsResponse.create404Response(
        appointmentId,
      );
    }

    // Return 500 error if serverError is true
    if (serverError) {
      return MockReferralAppointmentDetailsResponse.create500Response();
    }

    // Return error response if success is false
    if (!success) {
      return MockReferralAppointmentDetailsResponse.createErrorResponse();
    }

    // Return successful response
    return MockReferralAppointmentDetailsResponse.createSuccessResponse({
      appointmentId,
      typeOfCare,
      organizationName,
      status,
      start,
      referralId,
      careType,
      provider,
    });
  }
}

module.exports = MockReferralAppointmentDetailsResponse;
