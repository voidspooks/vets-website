/* istanbul ignore file */
/* eslint-disable camelcase */
const delay = require('mocker-api/lib/delay');

// v2
const { formatInTimeZone } = require('date-fns-tz');
const {
  isAfter,
  isValid,
  isWithinInterval,
  differenceInMinutes,
} = require('date-fns');
const {
  getMockConfirmedAppointments,
  findNextBusinessDay,
} = require('./utils/confirmedAppointments');
const { getMockSlots } = require('./utils/slots');

// v2
const ccProviders = require('./v2/cc_providers.json');
const facilitiesV2 = require('./v2/facilities.json');
// const schedulingConfigurationsCC = require('./v2/scheduling_configurations_cc.json');
// const schedulingConfigurations = require('./v2/scheduling_configurations.json');

// Generate dynamic slots with conflicts based on confirmed appointments
const mockConfirmedAppointments = getMockConfirmedAppointments();

// Dynamically-dated upcoming CC appointment, always 3 days out.
// Ensures CCProofOfAttendanceSection is visible in local dev without
// depending on static dates in confirmed.json.
const upcomingCCDate = new Date();
upcomingCCDate.setDate(upcomingCCDate.getDate() + 3);
upcomingCCDate.setHours(10, 0, 0, 0);
const upcomingCCApptId = 'qa-upcoming-cc-appt';
mockConfirmedAppointments.data.push({
  id: upcomingCCApptId,
  type: 'appointments',
  attributes: {
    id: upcomingCCApptId,
    status: 'booked',
    modality: 'communityCare',
    kind: 'cc',
    type: 'COMMUNITY_CARE_APPOINTMENT',
    start: upcomingCCDate.toISOString(),
    past: false,
    future: true,
    lastRetrieved: new Date().toISOString(),
    isLatest: true,
    cancellable: false,
    provider: {
      id: upcomingCCApptId,
      name: 'Dr. QA Test @ QA Cardiology',
      practice: 'QA Cardiology',
      phone: '555-000-0001',
      location: {
        name: 'QA Test Hospital',
        address: '123 Test St, Philadelphia, PA 19111',
        latitude: 40.06999282694126,
        longitude: -75.08769957031448,
        timezone: 'America/New_York',
      },
    },
    location: {
      id: upcomingCCApptId,
      type: 'appointments',
      attributes: {
        name: 'QA Test Hospital',
        timezone: { timeZoneId: 'America/New_York' },
      },
    },
  },
});

// Find appointments scheduled for the next business day to force conflicts
const nextBusinessDay = findNextBusinessDay();
const nextBusinessDayString = nextBusinessDay.toISOString().split('T')[0]; // Get YYYY-MM-DD format

// To locally test appointment details null state behavior, comment out
// the inclusion of confirmed.json and uncomment the inclusion of
// confirmed_null_states.json
const confirmedV2 = require('./v2/confirmed.json');
// const confirmedV2 = require('./v2/confirmed_null_states.json');

// Oracle Health confirmed appointments
const confirmedOh = require('./v2/confirmed_oh.json');

const confirmedAppointmentsV3 = {
  data: mockConfirmedAppointments.data.concat(
    confirmedV2.data,
    confirmedOh.data,
  ),
};

const nextBusinessDayAppointments = confirmedAppointmentsV3.data.filter(
  appointment => {
    const appointmentDate = appointment.attributes.start.split('T')[0];
    return appointmentDate === nextBusinessDayString;
  },
);
const appointmentSlotsV2 = getMockSlots({
  existingAppointments: confirmedAppointmentsV3.data,
  futureMonths: 6,
  pastMonths: 1,
  slotsPerDay: 10,
  conflictRate: 0.4, // 40% of days with appointments will have conflicts
  forceConflictWithAppointments: nextBusinessDayAppointments,
});
const clinics983V2 = require('./v2/clinics_983.json');
const clinics984V2 = require('./v2/clinics_984.json');
const patientProviderRelationships = require('./v2/patient_provider_relationships.json');
// Comment out line above and uncomment line below to test relationship endpoint error states
// const patientProviderRelationships = require('./v2/patient_provider_relationships_errors.json');
const recentLocations = require('./v2/recent_locations.json');
const vamcEhr = require('./v2/vamc_ehr.json');
const { data: avsPdfData } = require('./v2/avs_pdf_data');

// To locally test appointment details null state behavior, comment out
// the inclusion of requests.json and uncomment the inclusion of
// requests_null_states.json.json
const requestsV2 = require('./v2/requests.json');
// const requestsV2 = require('./v2/requests_null_states.json.json');

// Oracle Health appointment requests
const requestsOh = require('./v2/requests_oh.json');
const schedulingConfigurationsVPG = require('./v2/scheduling_configurations_vpg.json');

const appointmentRequests = {
  data: requestsV2.data.concat(requestsOh.data),
};

// Dynamically-dated pending CC request, created 7 days ago.
// Provides a community care request that always appears in the pending list.
const qaCCRequestCreated = new Date();
qaCCRequestCreated.setDate(qaCCRequestCreated.getDate() - 7);
const qaCCRequestPeriodStart = new Date();
qaCCRequestPeriodStart.setDate(qaCCRequestPeriodStart.getDate() - 3);
const qaCCRequestId = 'qa-pending-cc-request';
appointmentRequests.data.push({
  id: qaCCRequestId,
  type: 'appointments',
  attributes: {
    id: qaCCRequestId,
    kind: 'cc',
    status: 'proposed',
    serviceType: 'primaryCare',
    patientIcn: null,
    locationId: '983',
    created: qaCCRequestCreated.toISOString(),
    requestedPeriods: [
      {
        start: qaCCRequestPeriodStart.toISOString(),
        end: qaCCRequestPeriodStart.toISOString(),
      },
    ],
    contact: {
      telecom: [
        { type: 'phone', value: '5550001234' },
        { type: 'email', value: 'veteran@example.com' },
      ],
    },
    preferredTimesForPhoneCall: ['Morning'],
    preferredLanguage: 'English',
    preferredDates: ['Next available'],
    preferredProviderName: null,
    cancellable: true,
    type: 'COMMUNITY_CARE_REQUEST',
    modality: 'communityCare',
    past: false,
    future: false,
    pending: true,
    location: {
      id: '983',
      type: 'appointments',
      attributes: {
        id: '983',
        name: 'Cheyenne VA Medical Center',
        timezone: { timeZoneId: 'America/Denver' },
      },
    },
  },
});

// CC Direct Scheduling mocks
const MockReferralListResponse = require('../../tests/fixtures/MockReferralListResponse');
const MockReferralDetailResponse = require('../../tests/fixtures/MockReferralDetailResponse');
const MockReferralDraftAppointmentResponse = require('../../tests/fixtures/MockReferralDraftAppointmentResponse');
const MockReferralAppointmentDetailsResponse = require('../../tests/fixtures/MockReferralAppointmentDetailsResponse');
const MockUnifiedBookingResponse = require('../../tests/fixtures/MockUnifiedBookingResponse');
const MockReferralProvidersResponse = require('../../tests/fixtures/MockReferralProvidersResponse');
const {
  getProviderById,
} = require('../../tests/fixtures/MockReferralProvidersResponse');

// Returns the meta object without any backend service errors
const meta = require('./v2/meta.json');
// Uncomment to produce backend service errors
// const meta = require('./v2/meta_failures.json');

const features = require('./featureFlags');
const {
  // defaultUser,
  // acceleratedCernerUser,
  cernerUser,
  // transitioningUser,
} = require('../../../../platform/mhv/api/mocks/user');

const mockAppts = [];
let currentMockId = 1;
const draftAppointmentPollCount = {};

// In-memory demo state used to keep the referral scheduling flow internally
// consistent when running against the mock server. See
// src/applications/vaos/referral-appointments/README.md for the flow.
// - referralCache: remembers each referral's categoryOfCare / careType / referralNumber
//   so we can attach the right context to booked appointments.
// - draftByReferralId: remembers the last draft generated for a referral (provider
//   + slot list) so we can look up the selected slot on POST.
// - bookedByAppointmentId: remembers each booked appointment's provider, start
//   time, referralId, categoryOfCare, and careType so the polling and details
//   endpoints can return the same data the user selected.
const referralCache = {};
const draftByReferralId = {};
const bookedByAppointmentId = {};

/**
 * Builds the provider object returned inside a draft appointment response from
 * a resolved catalog entry. Mirrors the shape the app expects on
 * `draftAppointmentInfo.attributes.provider`.
 */
function buildDraftProviderFromCatalog(entry) {
  if (!entry) return null;
  const address = entry.address
    ? `${entry.address.street1}, ${entry.address.city}, ${
        entry.address.state
      }, ${entry.address.zip}, US`
    : '';
  if (entry.providerType === 'va') {
    return {
      id: entry.clinicId || entry.id,
      name: entry.name,
      careType: 'VA',
      facilityName: entry.facilityName,
      phone: entry.phone,
      visitMode: entry.visitMode || 'inPerson',
      locationId: entry.locationId,
      clinicId: entry.clinicId || entry.id,
      serviceType: entry.serviceType || 'primaryCare',
      providerServiceId: null,
      networkId: null,
      networkIds: [],
      appointmentTypes: null,
      location: {
        name: entry.facilityName,
        address,
        latitude: entry.latitude,
        longitude: entry.longitude,
        timezone: entry.timezone,
      },
    };
  }

  return {
    id: entry.providerServiceId || entry.id,
    name: `${entry.name} @ ${entry.facilityName}`,
    isActive: true,
    phone: entry.phone,
    tty: '711',
    individualProviders: [
      {
        name: entry.name,
        npi: '91560381x',
      },
    ],
    providerOrganization: {
      name: entry.organizationName || entry.facilityName,
    },
    location: {
      name: entry.facilityName,
      address,
      latitude: entry.latitude,
      longitude: entry.longitude,
      timezone: entry.timezone,
    },
    networkIds: [
      entry.networkId || MockReferralProvidersResponse.DEMO_NETWORK_ID,
    ],
    schedulingNotes:
      'New patients need to send their previous records to the office prior to their appt.',
    appointmentTypes: entry.appointmentTypes || [
      {
        id: 'ov',
        name: 'Office Visit',
        isSelfSchedulable: true,
      },
    ],
    specialties: entry.specialty ? [entry.specialty] : [],
    visitMode: entry.visitMode || 'inPerson',
    features: {
      isDigital: true,
      directBooking: {
        isEnabled: true,
        requiredFields: ['phone', 'address', 'name', 'birthdate', 'gender'],
      },
    },
  };
}

/**
 * Reshapes the draft-provider object into the shape the appointment details
 * endpoints return (nested `provider.location` with address + timezone).
 */
function buildDetailsProviderFromDraftProvider(draftProvider, careType) {
  if (!draftProvider) return null;
  const locationName =
    careType === 'VA'
      ? draftProvider.location?.name
      : draftProvider.providerOrganization?.name ||
        draftProvider.location?.name;
  return {
    id: draftProvider.id,
    name: draftProvider.name,
    practice: draftProvider.providerOrganization?.name,
    phone: draftProvider.phone,
    location: {
      name: locationName,
      address: draftProvider.location?.address,
      latitude: draftProvider.location?.latitude,
      longitude: draftProvider.location?.longitude,
      timezone: draftProvider.location?.timezone,
    },
  };
}

// key: NPI, value: Provider Name
const providerMock = {
  1801312053: 'AJADI, ADEDIWURA',
  1952935777: 'OH, JANICE',
  1992228522: 'SMAWLEY, DONNA C',
  1053355479: 'LYONS, KRISTYN',
  1396153797: 'STEWART, DARRYL',
  1154867018: 'GUILD, MICHAELA',
  1205346533: 'FREEMAN, SHARON',
  1548796501: 'CHAIB, EMBARKA',
  1780016782: 'Lawton, Amanda',
  1558874636: 'MELTON, JOY C',
  1982005708: 'OLUBUNMI, ABOLANLE A',
  1649609736: 'REISER, KATRINA',
  1770999294: 'TUCKER JONES, MICHELLE A',
  1255962510: 'OYEKAN, ADETOLA O',
  1770904021: 'Jones, Tillie',
};

const responses = {
  'GET /facilities_api/v2/ccp/provider': ccProviders,
  'POST /vaos/v2/appointments': (req, res) => {
    const {
      practitioners = [{ identifier: [{ system: null, value: null }] }],
      kind,
    } = req.body;
    const selectedClinic = clinics983V2.data.filter(
      clinic => clinic.id === req.body.clinic,
    );
    const providerNpi = practitioners[0]?.identifier[0].value;
    const selectedTime = appointmentSlotsV2.data
      .filter(slot => slot.id === req.body.slot?.id)
      .map(slot => slot.attributes.start);
    // convert to local time in America/Denver timezone
    let localTime;
    if (selectedTime && selectedTime.length) {
      localTime = formatInTimeZone(
        selectedTime[0],
        'America/Denver',
        'yyyy-MM-ddTHH:mm:ss',
      );
    }
    const isCerner = req.body.systemType === 'cerner';
    const pending = req.body.status === 'proposed';
    const future = req.body.status === 'booked';
    let patientComments;
    let type;
    let modality;
    if (req.body.kind === 'cc') {
      patientComments = req.body.reasonCode?.text;
      type = pending ? 'COMMUNITY_CARE_REQUEST' : 'COMMUNITY_CARE_APPOINTMENT';
      modality = 'communityCare';
    } else {
      const tokens = req.body.reasonCode?.text?.split('|') || [];
      for (const token of tokens) {
        if (token.startsWith('comments:')) {
          patientComments = token.substring('comments:'.length);
        }
      }
      type = pending ? 'REQUEST' : 'VA';
      modality = 'vaInPerson';
    }

    const submittedAppt = {
      id: `mock${currentMockId}`,
      attributes: {
        ...req.body,
        kind,
        type,
        modality,
        localStartTime: req.body.slot?.id ? localTime : null,
        start: req.body.slot?.id ? selectedTime[0] : null,
        preferredProviderName: providerNpi ? providerMock[providerNpi] : null,
        contact: {
          telecom: [
            {
              type: 'phone',
              value: '6195551234',
            },
            {
              type: 'email',
              value: 'myemail72585885@unattended.com',
            },
          ],
        },
        physicalLocation:
          selectedClinic[0]?.attributes.physicalLocation || null,
        patientComments,
        future,
        pending,
      },
    };
    if (!isCerner) {
      submittedAppt.attributes.created = new Date().toISOString();
    }

    currentMockId += 1;
    mockAppts.push(submittedAppt);
    return res.json({ data: submittedAppt });
  },
  'PUT /vaos/v2/appointments/:id': (req, res) => {
    // TODO: also check through confirmed mocks, when those exist
    const appointments = appointmentRequests.data
      .concat(confirmedAppointmentsV3.data)
      .concat(mockAppts);

    const appt = appointments.find(item => item.id === req.params.id);
    if (req.body.status === 'cancelled') {
      appt.attributes.status = 'cancelled';
      appt.attributes.cancelationReason = { coding: [{ code: 'pat' }] };
      appt.attributes.cancellable = false;
      if (appt.attributes.start) {
        appt.attributes.future = isAfter(
          new Date(appt.attributes.start),
          new Date(),
        );
      }
    }

    return res.json({
      data: {
        id: req.params.id,
        attributes: {
          ...appt.attributes,
          ...req.body,
        },
      },
    });
  },
  'GET /vaos/v2/appointments': (req, res) => {
    // merge arrays together

    const appointments = confirmedAppointmentsV3.data.concat(
      appointmentRequests.data,
      mockAppts,
    );
    for (const appointment of appointments) {
      if (
        appointment.attributes.start &&
        !appointment.attributes.referral?.referralNumber
      ) {
        appointment.attributes.future = isAfter(
          new Date(appointment.attributes.start),
          new Date(),
        );

        if (appointment.attributes.modality === 'vaVideoCareAtHome') {
          const diff = differenceInMinutes(
            new Date(),
            new Date(appointment.attributes.start),
          );
          if (!appointment.attributes.telehealth) {
            appointment.attributes.telehealth = {};
          }
          appointment.attributes.telehealth.displayLink =
            diff > -30 && diff < 240;
        }
      }
    }
    const filteredAppointments = appointments.filter(appointment => {
      return req.query.statuses.some(status => {
        if (appointment.attributes.status === status) {
          // Automatically add appointments with these statuses to the collection
          if (
            appointment.id.startsWith('mock') ||
            appointment.attributes.status === 'cancelled'
          )
            return true;

          const { requestedPeriods } = appointment.attributes;
          let date;

          if (status === 'proposed') {
            if (
              Array.isArray(requestedPeriods) &&
              requestedPeriods.length > 0
            ) {
              date = new Date(requestedPeriods[0].start);
            }
          } else if (status === 'booked') {
            date = new Date(appointment.attributes.start);
          }

          if (
            isValid(date) &&
            isWithinInterval(date, {
              start: new Date(req.query.start),
              end: new Date(req.query.end),
            })
          ) {
            return true;
          }
        }
        return false;
      });
    });
    return res.json({ data: filteredAppointments, meta });
  },
  //  To test malformed appointmentID error response locally
  //  uncomment the inclusion of errors.json
  //  uncomment the get api with returned errors
  //  comment out the get api request with returned data

  // const errors = require('./v2/errors.json');
  // 'GET /vaos/v2/appointments/:id': (req, res) => {
  //   return res.json(errors);
  // },

  'GET /vaos/v2/appointments/:id': (req, res) => {
    const appointments = {
      data: appointmentRequests.data
        .concat(confirmedAppointmentsV3.data)
        .concat(mockAppts),
    };
    const appointment = appointments.data.find(
      appt => appt.id === req.params.id,
    );

    if (appointment?.start && !appointment.referral?.referralNumber) {
      appointment.future = isAfter(new Date(appointment.start), new Date());
    }
    return res.json({
      data: appointment,
    });
  },
  'GET /vaos/v2/appointments/avs_binaries/:appointmentId': (req, res) => {
    const { appointmentId } = req.params;
    const docIds = req.query.doc_ids ? req.query.doc_ids.split(',') : [];

    // Look up mock data for this appointment
    const appointmentData = avsPdfData[appointmentId];

    if (!appointmentData) {
      return res.status(404).json({
        errors: [
          {
            title: 'Appointment not found',
            status: '404',
            detail: `No AVS data found for appointment ${appointmentId}`,
          },
        ],
      });
    }

    // Filter to only requested doc_ids and format as JSON:API
    const filteredData = appointmentData
      .filter(item => docIds.includes(item.docId))
      .map(item => ({
        id: item.docId,
        attributes: item,
      }));

    return res.json({ data: filteredData });
  },
  'GET /vaos/v2/scheduling/configurations': (req, res) => {
    if (req.query.cc_enabled === 'true') {
      // Return VPG scheduling configurations
      const data = schedulingConfigurationsVPG.data.filter(
        config => config.attributes.communityCare === true,
      );
      return res.json({
        data,
      });
      // return res.json(schedulingConfigurationsCC);
    }

    // Return VPG scheduling configurations
    return res.json(schedulingConfigurationsVPG);
    // return res.json(schedulingConfigurations);
  },
  'GET /vaos/v2/community_care/eligibility/:id': (req, res) => {
    return res.json({
      data: {
        id: req.param.id,
        type: 'cc_eligibility',
        attributes: { eligible: true },
      },
    });
  },
  'GET /vaos/v2/facilities/:id': (req, res) => {
    return res.json({
      data: facilitiesV2.data.find(facility => facility.id === req.params.id),
    });
  },
  'GET /vaos/v2/facilities': (req, res) => {
    const { ids } = req.query;
    const { children } = req.query;
    const { sort_by } = req.query;

    if (sort_by === 'recentLocations') {
      return res.json({
        data: recentLocations?.data.filter(
          facility =>
            ids.includes(facility?.id) ||
            (children === 'true' &&
              ids?.some(id => facility?.id.startsWith(id))),
        ),
      });
    }

    return res.json({
      data: facilitiesV2.data.filter(
        facility =>
          ids.includes(facility.id) ||
          (children === 'true' && ids.some(id => facility.id.startsWith(id))),
      ),
    });
  },
  'GET /vaos/v2/locations/:facility_id/clinics/:clinic_id/slots': (
    req,
    res,
  ) => {
    const start = new Date(req.query.start);
    const end = new Date(req.query.end);
    const slots = appointmentSlotsV2.data.filter(slot => {
      const slotStartDate = new Date(slot.attributes.start);
      return isWithinInterval(slotStartDate, { start, end });
    });
    return res.json({
      data: slots,
    });
  },
  'GET /vaos/v2/locations/:facility_id/slots': (req, res) => {
    const start = new Date(req.query.start);
    const end = new Date(req.query.end);
    const slots = appointmentSlotsV2.data.filter(slot => {
      const slotStartDate = new Date(slot.attributes.start);
      return isWithinInterval(slotStartDate, { start, end });
    });
    return res.json({
      data: slots,
    });
  },
  'GET /vaos/v2/patients': (req, res) => {
    return res.json({
      data: {
        attributes: {
          hasRequiredAppointmentHistory:
            !req.query.facility_id.startsWith('984') ||
            req.query.clinical_service === 'primaryCare',
          isEligibleForNewAppointmentRequest: req.query.facility_id.startsWith(
            '983',
          ),
        },
      },
    });
  },
  'GET /vaos/v2/eligibility': (req, res) => {
    const isDirect = req.query.type === 'direct';
    const ineligibilityReasons = [];

    // Direct scheduling, Facility 983, not primaryCare or clinicalPharmacyPrimaryCare
    if (
      isDirect &&
      req.query.facility_id.startsWith('984') &&
      req.query.clinical_service_id !== 'primaryCare' &&
      req.query.clinical_service_id !== 'clinicalPharmacyPrimaryCare'
    ) {
      ineligibilityReasons.push({
        coding: [
          {
            code: 'patient-history-insufficient',
          },
        ],
      });
    }

    // Request, not Facility 983, not Facility 692 (OH)
    if (
      !isDirect &&
      !req.query.facility_id.startsWith('983') &&
      !req.query.facility_id.startsWith('692')
    ) {
      ineligibilityReasons.push({
        coding: [
          {
            code: 'facility-request-limit-exceeded',
          },
        ],
      });
    }

    return res.json({
      data: {
        attributes: {
          type: req.query.type,
          clinicalServiceId: req.query.clinical_service_id,
          eligible: ineligibilityReasons.length === 0,
          ineligibilityReasons:
            ineligibilityReasons.length === 0
              ? undefined
              : ineligibilityReasons,
        },
      },
    });
  },
  'GET /vaos/v2/locations/:id/clinics': (req, res) => {
    if (req.query.clinic_ids) {
      return res.json({
        data: clinics983V2.data.filter(clinic =>
          req.query.clinic_ids.includes(clinic.id),
        ),
      });
    }

    if (req.params.id === '983') {
      return res.json(clinics983V2);
    }

    if (req.params.id === '984') {
      return res.json(clinics984V2);
    }

    return res.json({
      data: [],
    });
  },
  'GET /vaos/v2/relationships': (req, res) => {
    return res.json(patientProviderRelationships);
  },
  'GET /vaos/v2/referrals': (req, res) => {
    return res.json(
      new MockReferralListResponse({
        predefined: true,
      }),
    );
  },
  'GET /vaos/v2/referrals/:referralId': (req, res) => {
    const { referralId } = req.params;
    if (referralId === 'error') {
      return res.status(500).json({ error: true });
    }

    // Look up the referral from the predefined list so the detail response
    // reflects the categoryOfCare/careType/referralNumber the list advertised.
    const predefined = MockReferralListResponse.getPredefinedReferrals().find(
      r => r.id === referralId,
    );
    const detailOverrides = predefined
      ? {
          categoryOfCare: predefined.attributes.categoryOfCare,
          careType: predefined.attributes.careType,
          referralNumber: predefined.attributes.referralNumber,
          stationId: predefined.attributes.stationId,
        }
      : {};

    let response;
    if (referralId === 'scheduled-referral') {
      response = new MockReferralDetailResponse({
        id: referralId,
        expirationDate: '2024-12-02',
        hasAppointments: true,
        ...detailOverrides,
      });
    } else if (referralId === 'online-schedule-false') {
      response = new MockReferralDetailResponse({
        id: referralId,
        referralNumber: referralId,
        onlineSchedule: false,
        ...detailOverrides,
      });
    } else if (referralId === 'no-veteran-address') {
      response = new MockReferralDetailResponse({
        id: referralId,
        referralNumber: referralId,
        veteranAddressPresent: false,
        ...detailOverrides,
      });
    } else {
      response = new MockReferralDetailResponse({
        id: referralId,
        referralNumber: referralId,
        ...detailOverrides,
      });
    }

    const payload = response.toJSON();
    if (payload?.data?.attributes) {
      referralCache[referralId] = {
        referralId,
        categoryOfCare: payload.data.attributes.categoryOfCare,
        careType: payload.data.attributes.careType,
        referralNumber: payload.data.attributes.referralNumber,
      };
    }
    return res.json(payload);
  },
  'GET /vaos/v2/providers': (req, res) => {
    const page = parseInt(req.query.page || '1', 10);
    const perPage = parseInt(req.query.perPage || '5', 10);
    const totalEntries = 8;

    return res.json(
      MockReferralProvidersResponse.createSuccessResponse({
        page,
        perPage,
        totalEntries,
      }),
    );
  },
  'GET /vaos/v2/provider_slots': (req, res) => {
    const referralId = req.query.referral_id;
    const providerType = req.query.provider_type;
    const providerId =
      req.query.provider_id ||
      (providerType === 'va'
        ? req.query.clinic_id
        : req.query.provider_service_id);
    if (!referralId) {
      return res.status(422).json({
        errors: [
          {
            title: 'Missing parameter',
            detail: 'param is missing or the value is empty: referral_id',
            code: '422',
            status: '422',
          },
        ],
      });
    }
    // empty referral number throws error
    if (referralId === '') {
      return res.status(500).json(
        new MockReferralDraftAppointmentResponse({
          referralNumber: referralId,
          serverError: true,
        }),
      );
    }
    if (referralId === 'draft-no-slots-error') {
      return res.json(
        new MockReferralDraftAppointmentResponse({
          referralNumber: referralId,
          categoryOfCare: 'PRIMARY CARE',
          startDate: new Date(),
          noSlotsError: true,
        }),
      );
    }

    // Resolve the provider the user selected on ProviderSelection so the
    // draft/slots page reflects that same provider instead of a hardcoded one.
    const catalogEntry = getProviderById(providerId);
    const cachedReferral = referralCache[referralId] || {};
    const categoryOfCare = cachedReferral.categoryOfCare || 'PRIMARY CARE';

    if (
      providerType === 'va' ||
      (providerId && String(providerId).startsWith('va-'))
    ) {
      const rawVaSlots = getMockSlots({
        existingAppointments: getMockConfirmedAppointments().data,
        futureMonths: 2,
        pastMonths: 0,
        conflictRate: 0,
        forceConflictWithAppointments: [],
      }).data;
      const vaSlots = rawVaSlots.map(slot => ({
        ...slot.attributes,
        end: undefined,
      }));

      const vaEntry =
        catalogEntry ||
        getProviderById(`va-${providerId}`) ||
        getProviderById('1082');
      const vaEntryForProvider = { ...vaEntry, providerType: 'va' };
      const draftProvider = buildDraftProviderFromCatalog(vaEntryForProvider);
      const { address } = vaEntry;
      const draftEnvelope = {
        data: {
          id: providerId,
          type: 'provider_slots',
          attributes: {
            careType: 'VA',
            provider: { ...draftProvider, careType: 'VA' },
            slots: vaSlots,
            drivetime: {
              origin: {
                latitude: vaEntry.latitude - 0.02,
                longitude: vaEntry.longitude - 0.01,
              },
              destination: {
                distanceInMiles: 3,
                driveTimeInSecondsWithoutTraffic: 600,
                driveTimeInSecondsWithTraffic: 900,
                latitude: vaEntry.latitude,
                longitude: vaEntry.longitude,
              },
            },
          },
        },
      };

      draftByReferralId[referralId] = {
        draftId: draftEnvelope.data.id,
        provider: draftEnvelope.data.attributes.provider,
        slots: vaSlots,
        careType: 'VA',
        categoryOfCare,
        providerType: 'va',
        address,
      };

      return res.json(draftEnvelope);
    }

    // Community care branch
    const ccEntry =
      catalogEntry ||
      getProviderById(providerId) ||
      getProviderById('provider-0');
    const ccEntryForProvider = { ...ccEntry, providerType: 'community_care' };
    const draftProvider = buildDraftProviderFromCatalog(ccEntryForProvider);

    const mockResponse = new MockReferralDraftAppointmentResponse({
      referralNumber: referralId,
      categoryOfCare,
      startDate: new Date(),
      providerOverride: draftProvider,
      drivetimeOverride: {
        origin: {
          latitude: ccEntry.latitude - 0.02,
          longitude: ccEntry.longitude - 0.01,
        },
        destination: {
          distanceInMiles: 3,
          driveTimeInSecondsWithoutTraffic: 600,
          driveTimeInSecondsWithTraffic: 900,
          latitude: ccEntry.latitude,
          longitude: ccEntry.longitude,
        },
      },
    });
    const payload = mockResponse.toJSON();

    draftByReferralId[referralId] = {
      draftId: payload?.data?.id,
      provider: payload?.data?.attributes?.provider,
      slots: payload?.data?.attributes?.slots || [],
      careType: 'CC',
      categoryOfCare,
      providerType: 'community_care',
      address: ccEntry.address,
    };

    return res.json(payload);
  },
  'GET /vaos/v2/unified_bookings/:appointmentId': (req, res) => {
    let successPollCount = 2;
    const { appointmentId } = req.params;

    const booked = bookedByAppointmentId[appointmentId];
    const bookedOverrides = booked
      ? {
          start: booked.start,
          referralId: booked.referralId,
          typeOfCare: booked.categoryOfCare,
          careType: booked.careType,
          provider: buildDetailsProviderFromDraftProvider(
            booked.provider,
            booked.careType,
          ),
          organizationName: booked.provider?.location?.name,
        }
      : {};

    let mockAppointment = new MockReferralAppointmentDetailsResponse({
      appointmentId,
      status: 'proposed',
      ...bookedOverrides,
    });

    const serverError = new MockReferralAppointmentDetailsResponse({
      appointmentId,
      serverError: true,
    });

    if (appointmentId === 'appointment-for-poll-retry-error') {
      successPollCount = 1000;
    }

    if (appointmentId === 'appointment-for-poll-error') {
      return res.status(500).json(serverError);
    }

    const count = draftAppointmentPollCount[appointmentId] || 0;

    if (count < successPollCount) {
      draftAppointmentPollCount[appointmentId] = count + 1;
    } else {
      draftAppointmentPollCount[appointmentId] = 0;
      mockAppointment = new MockReferralAppointmentDetailsResponse({
        appointmentId,
        status: 'booked',
        ...bookedOverrides,
      });
    }

    return res.json(mockAppointment);
  },
  'GET /vaos/v2/eps_appointments/:appointmentId': (req, res) => {
    const { appointmentId } = req.params;

    const serverError = new MockReferralAppointmentDetailsResponse({
      appointmentId,
      serverError: true,
    });

    const notFoundError = new MockReferralAppointmentDetailsResponse({
      appointmentId,
      notFound: true,
    });

    if (appointmentId === 'appointment-for-details-not-found-error') {
      return res.status(400).json(notFoundError);
    }

    if (appointmentId === 'appointment-for-details-error') {
      return res.status(500).json(serverError);
    }

    const booked = bookedByAppointmentId[appointmentId];
    const bookedOverrides = booked
      ? {
          start: booked.start,
          referralId: booked.referralId,
          typeOfCare: booked.categoryOfCare,
          careType: booked.careType,
          provider: buildDetailsProviderFromDraftProvider(
            booked.provider,
            booked.careType,
          ),
          organizationName: booked.provider?.location?.name,
        }
      : {};

    return res.json(
      new MockReferralAppointmentDetailsResponse({
        appointmentId,
        status: 'booked',
        ...bookedOverrides,
      }),
    );
  },
  'POST /vaos/v2/unified_bookings': (req, res) => {
    const {
      providerType,
      slotId,
      providerServiceId,
      referralNumber,
    } = req.body;

    if ((!providerType && !providerServiceId) || !slotId) {
      return res.status(400).json(
        new MockUnifiedBookingResponse({
          appointmentId: null,
          notFound: true,
        }),
      );
    }

    // Look up the cached draft (keyed by referralId) so we can resolve the
    // selected slot's actual start time and carry the selected provider
    // through to the polling/details endpoints.
    let draft;
    let referralIdForBooking;
    if (referralNumber && draftByReferralId[referralNumber]) {
      draft = draftByReferralId[referralNumber];
      referralIdForBooking = referralNumber;
    } else {
      // Fallback: find any cached draft that contains this slot. Handles the VA
      // booking payload, which doesn't include referralNumber.
      const match = Object.entries(draftByReferralId).find(([, d]) =>
        (d.slots || []).some(s => s.id === slotId),
      );
      if (match) {
        [referralIdForBooking, draft] = match;
      }
    }

    const selectedSlot = draft?.slots?.find(s => s.id === slotId);
    const start = selectedSlot?.start;

    const cachedReferral = referralIdForBooking
      ? referralCache[referralIdForBooking]
      : null;

    // Key the booked context under the draft's id so that when the app polls
    // GET /vaos/v2/unified_bookings/:appointmentId using draftAppointmentInfo.id
    // (passed through from ReviewAndConfirm), we hit this cached record and
    // return the user's selected slot + provider. Fall back to a generated id
    // for callers (like some unit tests) that POST without first hitting
    // /provider_slots.
    const appointmentId = draft?.draftId || `mock-${Date.now()}`;
    draftAppointmentPollCount[appointmentId] = 1;

    if (draft) {
      bookedByAppointmentId[appointmentId] = {
        provider: draft.provider,
        start,
        referralId: referralIdForBooking,
        categoryOfCare: cachedReferral?.categoryOfCare || draft.categoryOfCare,
        careType: draft.careType,
        providerType: draft.providerType,
      };
    }

    return res.json(
      new MockUnifiedBookingResponse({
        appointmentId,
        providerType: draft?.providerType || providerType,
        start: start || undefined,
      }),
    );
  },
  'GET /data/cms/vamc-ehr.json': (req, res) => {
    return res.json(vamcEhr);
  },
  // Required v0 APIs
  // 'GET /v0/user': transitioningUser, // use this user to test migration alerts
  'GET /v0/user': {
    data: {
      attributes: {
        profile: {
          sign_in: {
            service_name: 'idme',
          },
          email: 'fake@fake.com',
          loa: { current: 3 },
          first_name: 'Jane',
          middle_name: '',
          last_name: 'Doe',
          gender: 'F',
          birth_date: '1985-01-01',
          verified: true,
        },
        veteran_status: {
          status: 'OK',
          is_veteran: true,
          served_in_military: true,
        },
        in_progress_forms: [],
        prefills_available: ['21-526EZ'],
        services: [
          'facilities',
          'hca',
          'edu-benefits',
          'evss-claims',
          'form526',
          'user-profile',
          'health-records',
          'rx',
          'messaging',
        ],
        vaProfile: {
          ...cernerUser.data.attributes.vaProfile,
          facilities: [
            {
              facility_id: '556',
              is_cerner: false,
            },
            {
              facility_id: '692',
              is_cerner: true,
            },
            {
              facility_id: '653',
              is_cerner: true,
            },
            // v1 community care pilot stations
            {
              facility_id: '984',
              is_cerner: false,
            },
            {
              facility_id: '983',
              is_cerner: false,
            },
            // v2 community care pilot station
            {
              facility_id: '911',
              is_cerner: false,
            },
          ],
        },
        vet360ContactInformation: {
          email: {
            createdAt: '2018-04-20T17:24:13.000Z',
            emailAddress: 'myemail72585885@unattended.com',
            effectiveEndDate: null,
            effectiveStartDate: '2019-03-07T22:32:40.000Z',
            id: 20648,
            sourceDate: '2019-03-07T22:32:40.000Z',
            sourceSystemUser: null,
            transactionId: '44a0858b-3dd1-4de2-903d-38b147981a9c',
            updatedAt: '2019-03-08T05:09:58.000Z',
            vet360Id: '1273766',
          },
          residentialAddress: {
            addressLine1: '345 Home Address St.',
            addressLine2: 'line 2',
            addressLine3: 'line 3',
            addressPou: 'RESIDENCE/CHOICE',
            addressType: 'DOMESTIC',
            city: 'San Francisco',
            countryName: 'United States',
            countryCodeIso2: 'US',
            countryCodeIso3: 'USA',
            countryCodeFips: null,
            countyCode: null,
            countyName: null,
            createdAt: '2022-03-21T21:26:35.000Z',
            effectiveEndDate: null,
            effectiveStartDate: '2022-03-23T19:11:51.000Z',
            geocodeDate: '2022-03-23T19:11:51.000Z',
            geocodePrecision: null,
            id: 312003,
            internationalPostalCode: null,
            latitude: 37.781,
            longitude: -122.4605,
            province: null,
            sourceDate: '2022-03-23T19:11:51.000Z',
            sourceSystemUser: null,
            stateCode: 'CA',
            transactionId: 'c5adb989-3b87-47b6-afe3-dc18800cedc3',
            updatedAt: '2022-03-23T19:11:52.000Z',
            validationKey: null,
            vet360Id: '1273766',
            zipCode: '94118',
            zipCodeSuffix: null,
            badAddress: null,
          },
          mailingAddress: {
            addressLine1: '123 Mailing Address St.',
            addressLine2: 'Apt 1',
            addressLine3: null,
            addressPou: 'CORRESPONDENCE',
            addressType: 'DOMESTIC',
            city: 'Fulton',
            countryName: 'United States',
            countryCodeIso2: 'US',
            countryCodeIso3: 'USA',
            countryCodeFips: null,
            countyCode: null,
            countyName: null,
            createdAt: '2022-03-21T21:06:15.000Z',
            effectiveEndDate: null,
            effectiveStartDate: '2022-03-23T19:14:59.000Z',
            geocodeDate: '2022-03-23T19:15:00.000Z',
            geocodePrecision: null,
            id: 311999,
            internationalPostalCode: null,
            latitude: 45.2248,
            longitude: -121.3595,
            province: null,
            sourceDate: '2022-03-23T19:14:59.000Z',
            sourceSystemUser: null,
            stateCode: 'NY',
            transactionId: '3ea3ecf8-3ddf-46d9-8a4b-b5554385b3fb',
            updatedAt: '2022-03-23T19:15:01.000Z',
            validationKey: null,
            vet360Id: '1273766',
            zipCode: '97063',
            zipCodeSuffix: null,
            badAddress: null,
          },
          mobilePhone: {
            areaCode: '619',
            countryCode: '1',
            createdAt: '2022-01-12T16:22:03.000Z',
            extension: null,
            effectiveEndDate: null,
            effectiveStartDate: '2022-02-17T20:15:44.000Z',
            id: 269804,
            isInternational: false,
            isTextable: null,
            isTextPermitted: null,
            isTty: null,
            isVoicemailable: null,
            phoneNumber: '5551234',
            phoneType: 'MOBILE',
            sourceDate: '2022-02-17T20:15:44.000Z',
            sourceSystemUser: null,
            transactionId: 'fdb13953-f670-4bd3-a3bb-8881eb9165dd',
            updatedAt: '2022-02-17T20:15:45.000Z',
            vet360Id: '1273766',
          },
          homePhone: {
            areaCode: '989',
            countryCode: '1',
            createdAt: '2018-04-20T17:22:56.000Z',
            extension: null,
            effectiveEndDate: null,
            effectiveStartDate: '2022-03-11T16:31:55.000Z',
            id: 2272982,
            isInternational: false,
            isTextable: null,
            isTextPermitted: null,
            isTty: null,
            isVoicemailable: null,
            phoneNumber: '8981233',
            phoneType: 'HOME',
            sourceDate: '2022-03-11T16:31:55.000Z',
            sourceSystemUser: null,
            transactionId: '2814cdf6-7f2c-431b-95f3-d37f3837215d',
            updatedAt: '2022-03-11T16:31:56.000Z',
            vet360Id: '1273766',
          },
          workPhone: null,
          temporaryPhone: null,
          faxNumber: null,
          textPermission: null,
        },
      },
    },
    meta: { errors: null },
  },
  'OPTIONS /v0/maintenance_windows': 'OK',
  'GET /v0/maintenance_windows': { data: [] },
  'GET /v0/feature_toggles': {
    data: {
      type: 'feature_toggles',
      features,
    },
  },
  // End of required v0 APIs
};

module.exports = delay(responses, 1000);
