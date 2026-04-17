/* eslint-disable camelcase */
const { addDays, addMonths, format, subMonths } = require('date-fns');

const defaultUUIDBase = '6cg8T26YivnL68JzeTaV0w==';
const expiredUUIDBase = '445e2d1b-7150-4631-97f2-f6f473bdef';

const errorUUIDs = [
  'appointment-submit-error',
  'details-retry-error',
  'details-error',
  'draft-no-slots-error',
  'eps-error-appointment-id',
];

const ALLOWED_CATEGORIES_OF_CARE = ['primary care'];

/**
 * Creates a referral list object relative to a start date.
 *
 * @param {String} expirationDate The date in 'yyyy-MM-dd' format for the referral expiration
 * @param {String} uuid The UUID for the referral
 * @param {String} [categoryOfCare='PRIMARY CARE'] The category of care for the referral
 * @param {String} [stationId='534'] The station id for the referral
 * @param {Boolean} [onlineSchedule=true] Whether the referral can be scheduled online
 * @param {String} [careType='CC'] The care type for the referral
 * @param {Boolean} [hasAppointments=false] Whether the referral has appointments
 * @returns {Object} Referral object
 */
const createReferralListItem = (
  expirationDate,
  uuid,
  categoryOfCare = 'PRIMARY CARE',
  stationId = '534',
  onlineSchedule = true,
  careType = 'CC',
  hasAppointments = false,
) => {
  const [year, month, day] = expirationDate.split('-');
  const relativeDate = new Date(year, month - 1, day);
  const mydFormat = 'yyyy-MM-dd';
  return {
    id: uuid,
    type: 'referrals',
    attributes: {
      expirationDate:
        expirationDate || format(addMonths(relativeDate, 6), mydFormat),
      uuid,
      categoryOfCare,
      careType,
      referralNumber: 'VA0000007241',
      referralConsultId: '984_646907',
      stationId,
      onlineSchedule,
      hasAppointments,
    },
  };
};

/* Creates a list of error referrals with specific UUIDs.
 * These are used to test error handling.
 */
const errorReferralsList = (errorUUIDs || []).map(uuid => {
  return createReferralListItem('2025-11-14', uuid, 'OPTOMETRY');
});

/**
 * Creates a referral object with specified uuid and expiration date.
 *
 * @param {String} startDate The date in 'yyyy-MM-dd' format to base the referrals around
 * @param {String} uuid The UUID for the referral
 * @param {String} expirationDate The date in 'yyyy-MM-dd' format to expire the referral
 * @param {String} categoryOfCare The category of care for the referral
 * @param {Boolean} hasProvider Whether the referral has a provider
 * @param {String} stationId The station id for the referral
 * @param {Boolean} onlineSchedule Whether the referral can be scheduled online
 * @param {String} [careType='CC'] The care type for the referral
 * @param {Boolean} veteranAddressPresent Whether the veteran has a home address on file
 * @returns {Object} Referral object
 */
const createReferralById = (
  startDate,
  uuid,
  expirationDate,
  categoryOfCare = 'PRIMARY CARE',
  hasProvider = true,
  stationId = '534QD',
  onlineSchedule = true,
  careType = 'CC',
  veteranAddressPresent = true,
) => {
  const [year, month, day] = startDate.split('-');
  const relativeDate = new Date(year, month - 1, day);

  const mydFormat = 'yyyy-MM-dd';

  const provider = hasProvider
    ? {
        name: 'Dr. Moreen S. Rafa',
        npi: '1346206547',
        phone: '(937) 236-6750',
        facilityName: 'fake facility name',
        address: {
          street1: '76 Veterans Avenue',
          city: 'BATH',
          state: null,
          zip: '14810',
        },
      }
    : null;

  return {
    id: uuid,
    type: 'referrals',
    attributes: {
      uuid,
      referralDate: '2023-01-01',
      stationId,
      expirationDate:
        expirationDate || format(addMonths(relativeDate, 6), mydFormat),
      referralNumber: uuid.includes('error') ? uuid : 'VA0000007241',
      categoryOfCare,
      careType,
      referralConsultId: '984_646907',
      hasAppointments: false,
      onlineSchedule,
      referringFacility: {
        name: 'Batavia VA Medical Center',
        phone: '(585) 297-1000',
        code: '528A4',
        address: {
          street1: '222 Richmond Avenue',
          city: 'BATAVIA',
          state: null,
          zip: '14020',
        },
      },
      provider,
    },
    meta: {
      veteranAddressPresent,
    },
  };
};

/**
 * Creates a referral array of any length.
 *
 * @param {Number} numberOfReferrals The number of referrals to create in the array
 * @param {String} baseDate The date in 'yyyy-MM-dd' format to base the referrals around
 * @param {Number} numberOfExpiringReferrals The number of referrals that should be expired
 * @param {Boolean} includeErrorReferrals Whether to include error referrals in the array
 * @param {Boolean} includeOutOfPilotStation Whether to include an out of pilot station referral
 * @returns {Array} Referrals array
 */
const createReferrals = (
  numberOfReferrals = 3,
  baseDate,
  numberOfExpiringReferrals = 0,
  includeErrorReferrals = false,
  includeOutOfPilotStation = false,
) => {
  // create a date object for today that is not affected by the time zone
  const dateOjbect = baseDate ? new Date(baseDate) : new Date();
  const baseDateObject = new Date(
    dateOjbect.getUTCFullYear(),
    dateOjbect.getUTCMonth(),
    dateOjbect.getUTCDate(),
  );
  const referrals = [];

  for (let i = 0; i < numberOfReferrals; i++) {
    const isExpired = i < numberOfExpiringReferrals;
    const uuidBase = isExpired ? expiredUUIDBase : defaultUUIDBase;
    const modifiedDate = addDays(
      isExpired ? subMonths(baseDateObject, 6) : addMonths(baseDateObject, 6),
      i,
    );
    const mydFormat = 'yyyy-MM-dd';
    const expirationDate = format(modifiedDate, mydFormat);
    referrals.push(
      createReferralListItem(
        expirationDate,
        `${uuidBase}${i.toString().padStart(2, '0')}`,
        'PRIMARY CARE',
      ),
    );
  }
  if (includeOutOfPilotStation) {
    referrals.push(
      createReferralListItem(
        '2025-11-14',
        'out-of-pilot-station',
        'OPTOMETRY',
        '123',
      ),
    );
  }
  if (includeErrorReferrals) {
    return [...referrals, ...errorReferralsList];
  }
  return [...referrals];
};

/**
 * Returns the session key for a stored slot by referral id.
 *
 * @param {String} id The id of the referral.
 * @returns {String} The storage key.
 */
const getReferralSlotKey = id => {
  return `selected-slot-referral-${id}`;
};

/**
 * Returns the session key for a stored provider id by referral id.
 *
 * @param {String} id The id of the referral.
 * @returns {String} The storage key.
 */
const getReferralProviderKey = id => {
  return `selected-provider-referral-${id}`;
};

function appointmentTypeIsSelfSchedulable(apt) {
  if (!apt) {
    return false;
  }
  return apt.isSelfSchedulable === true || apt.is_self_schedulable === true;
}

function firstSelfSchedulableAppointmentTypeId(appointmentTypes) {
  if (!Array.isArray(appointmentTypes)) {
    return null;
  }
  const found = appointmentTypes.find(appointmentTypeIsSelfSchedulable);
  return found?.id ?? null;
}

/**
 * Builds query params for GET /vaos/v2/provider_slots after provider selection.
 *
 * @param {Object} provider Unified provider row ({ id, providerType, ...attributes })
 * @returns {Object|null}
 */
function buildProviderSlotsQueryParams(provider) {
  if (!provider?.providerType) {
    return null;
  }

  const { providerType } = provider;

  if (providerType === 'va') {
    if (!provider.id || !provider.locationId) {
      return null;
    }
    const payload = {
      providerType: 'va',
      clinicId: String(provider.id),
      locationId: String(provider.locationId),
    };
    if (provider.serviceType) {
      payload.clinicalService = String(provider.serviceType);
    }
    return payload;
  }

  if (providerType === 'community_care') {
    const providerServiceId = provider.providerServiceId || provider.id;
    const appointmentTypeId = firstSelfSchedulableAppointmentTypeId(
      provider.appointmentTypes,
    );
    if (!providerServiceId || !appointmentTypeId) {
      return null;
    }
    const payload = {
      providerType: 'community_care',
      providerServiceId: String(providerServiceId),
      appointmentTypeId: String(appointmentTypeId),
    };
    if (provider.networkId) {
      payload.networkId = String(provider.networkId);
    }
    return payload;
  }

  return null;
}

/**
 * Filters referrals by category of care.
 * @param {Array} referrals The referrals to filter
 * @returns {Array} The filtered referrals
 */
const filterReferrals = referrals => {
  if (!referrals?.length) {
    return [];
  }
  return referrals.filter(referral =>
    ALLOWED_CATEGORIES_OF_CARE.includes(
      referral.attributes.categoryOfCare?.toLowerCase(),
    ),
  );
};

/**
 * Creates an address string from object
 *
 * @param {Object} addressObject Address object
 * @returns {String} Address string
 */
const getAddressString = addressObject => {
  if (!addressObject) {
    return '';
  }
  const { street1, street2, street3, city, state, zip } = addressObject;

  const addressParts = [street1, street2, street3, city, state, zip];

  // Filter out any undefined or empty parts and join with a comma
  return addressParts.filter(Boolean).join(', ');
};

module.exports = {
  createReferralById,
  createReferralListItem,
  createReferrals,
  getReferralSlotKey,
  getReferralProviderKey,
  buildProviderSlotsQueryParams,
  filterReferrals,
  expiredUUIDBase,
  getAddressString,
};
