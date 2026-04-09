/* eslint-disable camelcase */
/**
 * Class to create mock responses for POST /vaos/v2/unified_bookings
 */
class MockUnifiedBookingResponse {
  constructor(options = {}) {
    this.options = {
      appointmentId: 'EEKoGzEf',
      providerType: 'community_care',
      status: 'booked',
      start: '2026-04-15T14:00:00Z',
      success: true,
      notFound: false,
      serverError: false,
      ...options,
    };
  }

  /**
   * Creates a successful unified booking response
   *
   * @param {Object} options - Options for the response
   * @param {string} options.appointmentId - ID for the booked appointment
   * @param {string} options.providerType - 'va' or 'community_care'
   * @param {string} options.status - 'booked' or 'submitted'
   * @param {string} options.start - ISO 8601 UTC appointment start time
   * @returns {Object} A successful response object
   */
  static createSuccessResponse({
    appointmentId = 'EEKoGzEf',
    providerType = 'community_care',
    status = 'booked',
    start = '2026-04-15T14:00:00Z',
  } = {}) {
    return {
      data: {
        id: appointmentId,
        type: 'unified_booking',
        attributes: {
          appointment_id: appointmentId,
          provider_type: providerType,
          status,
          start,
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
          detail: 'An error occurred while booking the appointment',
          code: '500',
          status: '500',
        },
      ],
    };
  }

  /**
   * Creates an error response for unified booking
   *
   * @param {Object} options - Options for the error response
   * @param {string} options.code - Error code
   * @param {string} options.title - Error title
   * @param {string} options.detail - Error detail message
   * @returns {Object} An error response object
   */
  static createErrorResponse({
    code = '500',
    title = 'Internal Server Error',
    detail = 'An error occurred while booking the appointment',
  } = {}) {
    return {
      errors: [
        {
          title,
          detail,
          code,
          status: code,
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
      providerType,
      status,
      start,
      success,
      notFound,
      serverError,
    } = this.options;

    if (notFound) {
      return MockUnifiedBookingResponse.create404Response(appointmentId);
    }

    if (serverError) {
      return MockUnifiedBookingResponse.create500Response();
    }

    if (!success) {
      return MockUnifiedBookingResponse.createErrorResponse();
    }

    return MockUnifiedBookingResponse.createSuccessResponse({
      appointmentId,
      providerType,
      status,
      start,
    });
  }
}

module.exports = MockUnifiedBookingResponse;
