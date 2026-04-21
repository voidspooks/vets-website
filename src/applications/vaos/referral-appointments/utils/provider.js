/* eslint-disable no-plusplus */

const {
  snapshotMatchesProviderSlotsParams,
  PROVIDER_TYPE_VA,
  PROVIDER_TYPE_COMMUNITY_CARE,
  PROVIDER_TYPE_EPS,
} = require('./referrals');

const createDefaultDraftAppointment = () => ({
  id: 'EEKoGzEf',
  type: 'draft_appointment',
  attributes: {
    careType: 'CC',
    // Mirrors GET /vaos/v2/provider_slots → attributes.provider (unified_provider).
    provider: {
      id: '9mN718pH',
      type: 'unified_provider',
      attributes: {
        name: 'Dr. Bones @ FHA South Melbourne Medical Complex',
        facilityName: 'Meridian Health',
        providerType: PROVIDER_TYPE_COMMUNITY_CARE,
        providerServiceId: '9mN718pH',
        networkId: 'sandboxnetwork-5vuTac8v',
        phone: '(321) 555-1234',
        tty: '711',
        visitMode: 'phone',
        timezone: 'America/New_York',
        address: {
          street1: '1105 Palmetto Ave',
          city: 'Melbourne',
          state: 'FL',
          zip: '32901',
        },
      },
    },
    slots: [],
    drivetime: {
      origin: {
        latitude: 40.7128,
        longitude: -74.006,
      },
      destination: {
        distanceInMiles: 313,
        driveTimeInSecondsWithoutTraffic: 19096,
        driveTimeInSecondsWithTraffic: 19561,
        latitude: 44.475883,
        longitude: -73.212074,
      },
    },
  },
});

/**
 * Creates a draftAppointmentInfo object with a configurable number of slots an hour apart.
 *
 * @param {Number} numberOfSlots How many slots to create
 * @param {String} referralNumber The number for the referral
 * @returns {Object} draftAppointmentInfo object
 */
const createDraftAppointmentInfo = (
  referralNumber = '6cg8T26YivnL68JzeTaV0w==',
) => {
  const draftApppointmentInfo = createDefaultDraftAppointment();

  if (referralNumber === 'draft-no-slots-error') {
    return draftApppointmentInfo;
  }
  if (referralNumber === 'details-error') {
    draftApppointmentInfo.id = 'details-error';
  }
  if (referralNumber === 'details-retry-error') {
    draftApppointmentInfo.id = 'details-retry-error';
  }
  draftApppointmentInfo.attributes.slots = [];
  return draftApppointmentInfo;
};

/**
 * Returns Slot by given date
 *
 * @param {Array} slots Array of slots
 * @param {String} dateTime Time stamp of date
 * @returns {Object} Slot object
 */
const getSlotByDate = (slots, dateTime) => {
  if (!slots) {
    return {};
  }
  return slots.find(slot => slot.start === dateTime);
};

// Same phrasing as ConfirmationAppointmentCard when names are missing.
const SLOTS_PROVIDER_DISPLAY_FALLBACK_CC = 'Provider name not available';
const SLOTS_PROVIDER_DISPLAY_FALLBACK_VA = 'Not available';

// Maps GET /vaos/v2/provider_slots unified_provider (VAOS::V2::UnifiedProviderSerializer)
// into the flat provider shape referral UI and booking payloads expect.
const normalizeSlotsProvider = provider => {
  if (provider == null) {
    return provider;
  }

  if (provider.type !== 'unified_provider') {
    throw new Error(
      `VAOS referral: expected provider.type "unified_provider", got ${JSON.stringify(
        provider.type,
      )}`,
    );
  }

  const providerAttrs = provider.attributes;
  if (!providerAttrs || typeof providerAttrs !== 'object') {
    throw new Error('VAOS referral: unified_provider missing attributes');
  }
  if (providerAttrs.providerType == null || providerAttrs.providerType === '') {
    throw new Error(
      'VAOS referral: unified_provider.attributes missing providerType',
    );
  }

  const isVa = providerAttrs.providerType === PROVIDER_TYPE_VA;

  const trimmed = value => {
    if (value == null) {
      return '';
    }
    const s = String(value).trim();
    return s === '' ? '' : s;
  };

  // UnifiedProviderSerializer sets name and facilityName from the VAProvider
  // model. If both are empty, the model was never given those fields — for
  // VA provider_slots that happens in UnifiedSlotsController#build_va_provider.
  // Do not throw: render should degrade like ConfirmationAppointmentCard (fallback copy).
  const displayNameFallback = isVa
    ? SLOTS_PROVIDER_DISPLAY_FALLBACK_VA
    : SLOTS_PROVIDER_DISPLAY_FALLBACK_CC;
  const name =
    trimmed(providerAttrs.name) ||
    trimmed(providerAttrs.facilityName) ||
    displayNameFallback;
  const place =
    trimmed(providerAttrs.facilityName) || trimmed(providerAttrs.name) || name;

  return {
    id: isVa ? provider.id : providerAttrs.providerServiceId || provider.id,
    name,
    providerType: providerAttrs.providerType,
    phone: providerAttrs.phone,
    tty: providerAttrs.tty,
    visitMode: providerAttrs.visitMode,
    networkIds: providerAttrs.networkId ? [providerAttrs.networkId] : [],
    clinicId: isVa ? provider.id : undefined,
    locationId: providerAttrs.locationId,
    serviceType: providerAttrs.serviceType,
    providerOrganization: { name: place },
    location: {
      name: place,
      address: providerAttrs.address,
      timezone:
        providerAttrs.timezone ||
        Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    individualProviders: [{ name }],
  };
};

const isBlankString = value =>
  value == null || (typeof value === 'string' && value.trim() === '');

const addressIsEmpty = address => {
  if (address == null || typeof address !== 'object') {
    return true;
  }
  return !Object.values(address).some(
    v => v != null && String(v).trim() !== '',
  );
};

/**
 * Clones draft appointment from provider_slots and fills missing unified_provider
 * display fields from a selection-time snapshot when ids match params.
 *
 * @param {Object|null} draftAppointmentInfo
 * @param {Object|null} snapshot
 * @param {Object|null} providerSlotsParams
 * @returns {Object|null}
 */
function mergeProviderSlotsWithSnapshot(
  draftAppointmentInfo,
  snapshot,
  providerSlotsParams,
) {
  if (!draftAppointmentInfo?.attributes) {
    return draftAppointmentInfo;
  }
  if (!snapshotMatchesProviderSlotsParams(snapshot, providerSlotsParams)) {
    return draftAppointmentInfo;
  }

  const merged = JSON.parse(JSON.stringify(draftAppointmentInfo));
  const providerNode = merged.attributes?.provider;
  if (providerNode?.type !== 'unified_provider' || !providerNode.attributes) {
    return merged;
  }

  const providerAttrs = providerNode.attributes;
  const setIfBlank = (key, value) => {
    if (value == null || value === '') {
      return;
    }
    if (isBlankString(providerAttrs[key])) {
      providerAttrs[key] = value;
    }
  };

  setIfBlank('name', snapshot.name);
  setIfBlank('facilityName', snapshot.facilityName);
  setIfBlank('phone', snapshot.phone);
  setIfBlank('tty', snapshot.tty);
  setIfBlank('visitMode', snapshot.visitMode);
  setIfBlank('timezone', snapshot.timezone);

  if (
    addressIsEmpty(providerAttrs.address) &&
    snapshot.address &&
    !addressIsEmpty(snapshot.address)
  ) {
    providerAttrs.address = snapshot.address;
  }

  if (providerAttrs.providerType === PROVIDER_TYPE_VA) {
    setIfBlank('locationId', snapshot.locationId);
    setIfBlank('serviceType', snapshot.serviceType);
  } else if (
    providerAttrs.providerType === PROVIDER_TYPE_COMMUNITY_CARE ||
    providerAttrs.providerType === PROVIDER_TYPE_EPS
  ) {
    setIfBlank('networkId', snapshot.networkId);
  }

  return merged;
}

/**
 * @param {Object|null} provider Draft attributes.provider (unified_provider or legacy flat)
 * @returns {Object|null} Flat display shape from normalizeSlotsProvider, or legacy object unchanged
 */
function normalizeSlotsProviderIfUnified(provider) {
  if (provider == null) {
    return provider;
  }
  if (provider.type === 'unified_provider') {
    return normalizeSlotsProvider(provider);
  }
  return provider;
}

module.exports = {
  createDraftAppointmentInfo,
  getSlotByDate,
  normalizeSlotsProvider,
  normalizeSlotsProviderIfUnified,
  mergeProviderSlotsWithSnapshot,
};
