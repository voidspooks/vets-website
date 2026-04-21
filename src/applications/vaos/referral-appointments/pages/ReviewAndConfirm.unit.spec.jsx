import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { waitFor } from '@testing-library/dom';
import { cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import environment from '@department-of-veterans-affairs/platform-utilities/environment';
import { defaultSerializeQueryArgs } from '@reduxjs/toolkit/query';
import {
  createPostHandler,
  jsonResponse,
} from 'platform/testing/unit/msw-adapter';
import { server } from 'platform/testing/unit/mocha-setup';
import ReviewAndConfirm from './ReviewAndConfirm';
import {
  createTestStore,
  renderWithStoreAndRouter,
} from '../../tests/mocks/setup';
import { createReferralById, getReferralSlotKey } from '../utils/referrals';
import { FETCH_STATUS } from '../../utils/constants';
import { createDraftAppointmentInfo } from '../utils/provider';
import * as flow from '../flow';
import { vaosApi } from '../../redux/api/vaosApi';
import {
  generateSlotsForDay,
  transformSlotsForCommunityCare,
} from '../../services/mocks/utils/slots';

describe('VAOS Component: ReviewAndConfirm', () => {
  const slotDate = '2024-09-09T16:00:00.000Z';
  const sandbox = sinon.createSandbox();
  const providerId = '9mN718pH';
  const draftAppointmentInfo = createDraftAppointmentInfo();

  const slots = generateSlotsForDay(slotDate, {
    slotsPerDay: 1,
    slotDuration: 60,
    businessHours: {
      start: 12,
      end: 18,
    },
  });
  draftAppointmentInfo.attributes.slots = transformSlotsForCommunityCare(slots);
  draftAppointmentInfo.attributes.slots[0].start = slotDate;

  const providerSlotsSessionDefaults = {
    providerType: 'community_care',
    providerServiceId: providerId,
    appointmentTypeId: 'ov',
  };
  const providerSlotsQueryArgs = {
    referralId: 'UUID',
    ...providerSlotsSessionDefaults,
  };
  const providerSlotsQueryKey = defaultSerializeQueryArgs({
    endpointName: 'getProviderSlots',
    queryArgs: providerSlotsQueryArgs,
  });

  const createStateWithSlots = (overrides = {}) => ({
    featureToggles: {
      vaOnlineSchedulingCCDirectScheduling: true,
    },
    referral: {
      selectedSlotStartTime: slotDate,
      selectedProviderId: providerId,
      providerSlotsParams: providerSlotsSessionDefaults,
      currentPage: 'reviewAndConfirm',
      appointmentCreateStatus: FETCH_STATUS.notStarted,
      pollingRequestStart: null,
      appointmentInfoError: false,
      appointmentInfoLoading: false,
      referralAppointmentInfo: {},
      ...overrides,
    },
    appointmentApi: {
      queries: {
        [providerSlotsQueryKey]: {
          status: 'fulfilled',
          data: draftAppointmentInfo,
          endpoint: 'getProviderSlots',
          requestId: 'abc',
          startedTimeStamp: 1758046349181,
          fulfilledTimeStamp: 1758046349182,
        },
      },
      subscriptions: {
        [providerSlotsQueryKey]: {
          abc: { pollingInterval: 0 },
        },
      },
    },
  });

  const initialFullState = createStateWithSlots();
  const initialEmptyState = createStateWithSlots({
    selectedSlotStartTime: slotDate,
  });

  const testPath = '/';

  afterEach(async () => {
    await cleanup();
    sandbox.restore();
    server.resetHandlers();
    sessionStorage.clear();
    vaosApi.util.resetApiState();
  });

  it('should get selected slot from session storage if not in redux', async () => {
    const selectedSlotKey = getReferralSlotKey('UUID');
    sessionStorage.setItem(selectedSlotKey, slotDate);

    const noSelectState = createStateWithSlots({
      selectedSlotStartTime: '',
    });

    const screen = renderWithStoreAndRouter(
      <ReviewAndConfirm
        currentReferral={createReferralById('2024-09-09', 'UUID')}
      />,
      {
        store: createTestStore(noSelectState),
        path: testPath,
      },
    );

    await waitFor(() => {
      expect(screen.getByTestId('referral-layout-heading')).to.exist;
      expect(screen.getByTestId('slot-day-time')).to.contain.text(
        'Monday, September 9, 2024',
      );
      expect(screen.getByTestId('slot-day-time')).to.contain.text(
        '12:00 p.m. ET',
      );
    });
  });

  it('should route to scheduleReferral if no slot selected', async () => {
    const selectedSlotKey = getReferralSlotKey('UUID');
    sessionStorage.removeItem(selectedSlotKey);

    const noSelectState = createStateWithSlots({
      selectedSlotStartTime: '',
    });
    const screen = renderWithStoreAndRouter(
      <ReviewAndConfirm
        currentReferral={createReferralById('2024-09-09', 'UUID')}
      />,
      {
        store: createTestStore(noSelectState),
        path: `/schedule-referral/date-time?providerId=${providerId}`,
      },
    );
    await waitFor(() => {
      const pushCalls = screen.history.push.args.map(args => args[0]);
      const matched = pushCalls.some(url =>
        url.includes('/schedule-referral?id=UUID'),
      );
      expect(matched).to.be.true;
    });
  });

  it('should route to scheduleReferral if no providerId', async () => {
    sessionStorage.clear();
    const noProviderState = createStateWithSlots({
      selectedProviderId: null,
      providerSlotsParams: null,
    });
    const screen = renderWithStoreAndRouter(
      <ReviewAndConfirm
        currentReferral={createReferralById('2024-09-09', 'UUID')}
      />,
      {
        store: createTestStore(noProviderState),
        path: '/',
      },
    );
    await waitFor(() => {
      const pushCalls = screen.history.push.args.map(args => args[0]);
      const matched = pushCalls.some(url =>
        url.includes('/schedule-referral?id=UUID'),
      );
      expect(matched).to.be.true;
    });
  });

  it('should call create appointment post when "continue" is pressed', async () => {
    let submitCalled = false;

    server.use(
      createPostHandler(
        `${environment.API_URL}/vaos/v2/unified_bookings`,
        () => {
          submitCalled = true;
          return jsonResponse({
            data: { appointmentId: draftAppointmentInfo?.id },
          });
        },
      ),
    );

    const store = createTestStore(initialFullState);

    const screen = renderWithStoreAndRouter(
      <ReviewAndConfirm
        currentReferral={createReferralById('2024-09-09', 'UUID')}
      />,
      {
        store,
        path: testPath,
      },
    );
    await screen.findByTestId('continue-button');
    await userEvent.click(screen.getByTestId('continue-button'));
    await waitFor(() => {
      expect(submitCalled).to.be.true;
    });
  });

  it('should call "routeToNextReferralPage" when appointment creation is successful', async () => {
    server.use(
      createPostHandler(`${environment.API_URL}/vaos/v2/unified_bookings`, () =>
        jsonResponse({ data: draftAppointmentInfo }),
      ),
    );

    const store = createTestStore(initialEmptyState);
    sandbox.spy(flow, 'routeToNextReferralPage');

    const screen = renderWithStoreAndRouter(
      <ReviewAndConfirm
        currentReferral={createReferralById('2024-09-09', 'UUID')}
      />,
      {
        store,
        path: testPath,
      },
    );

    await screen.findByTestId('continue-button');
    expect(screen.getByTestId('continue-button')).to.exist;
    await userEvent.click(screen.getByTestId('continue-button'));
    await waitFor(() => {
      const mutation = Object.keys(
        store.getState().appointmentApi.mutations,
      )[0];
      expect(
        store.getState().appointmentApi.mutations[mutation].status,
      ).to.equal('fulfilled');
    });
    await waitFor(
      () => {
        const pushCalls = screen.history.push.args.map(args => args[0]);
        const matched = pushCalls.some(
          url =>
            url.includes('/schedule-referral/complete/EEKoGzEf') &&
            url.includes('id=UUID'),
        );
        expect(matched).to.be.true;
      },
      { timeout: 5000 },
    );
  });

  it('should display an error message when appointment creation fails', async () => {
    server.use(
      createPostHandler(`${environment.API_URL}/vaos/v2/unified_bookings`, () =>
        jsonResponse(
          { error: { status: 500, message: 'Failed to create appointment' } },
          { status: 500 },
        ),
      ),
    );

    const store = createTestStore(initialFullState);
    const screen = renderWithStoreAndRouter(
      <ReviewAndConfirm
        currentReferral={createReferralById('2024-09-09', 'UUID')}
      />,
      {
        store,
        path: testPath,
      },
    );
    await screen.findByTestId('continue-button');
    expect(screen.getByTestId('continue-button')).to.exist;
    await userEvent.click(screen.getByTestId('continue-button'));
    await waitFor(() => {
      const mutation = Object.keys(
        store.getState().appointmentApi.mutations,
      )[0];
      expect(
        store.getState().appointmentApi.mutations[mutation].status,
      ).to.equal('rejected');
    });
    await screen.findByTestId('create-error-alert');
    expect(screen.getByTestId('create-error-alert')).to.exist;
    expect(screen.getByText(/We couldn.t schedule this appointment/)).to.exist;
    expect(screen.getByTestId('referral-community-care-office')).to.exist;
  });

  describe('Provider slots failed (review layout)', () => {
    const rejectedQueryEntry = {
      status: 'rejected',
      error: {
        status: 500,
        data: {
          errors: [
            {
              title: 'Internal Server Error',
              detail:
                'An error occurred while retrieving the draft appointment',
              code: '500',
              status: '500',
            },
          ],
        },
      },
      endpoint: 'getProviderSlots',
      requestId: 'slots-rejected',
    };

    it('should display CC slots load error when getProviderSlots is rejected', async () => {
      const store = createTestStore({
        ...createStateWithSlots(),
        appointmentApi: {
          queries: {
            [providerSlotsQueryKey]: rejectedQueryEntry,
          },
          subscriptions: {
            [providerSlotsQueryKey]: {
              'slots-rejected': { pollingInterval: 0 },
            },
          },
        },
      });

      const screen = renderWithStoreAndRouter(
        <ReviewAndConfirm
          currentReferral={createReferralById('2024-09-09', 'UUID')}
        />,
        { store, path: testPath },
      );

      expect(await screen.findByTestId('error')).to.exist;
      expect(
        screen.getByText(/We\u2019re sorry. We\u2019ve run into a problem/i),
      ).to.exist;
      expect(screen.getByTestId('referral-community-care-office')).to.exist;
    });

    it('should display VA slots load error when getProviderSlots is rejected', async () => {
      const vaProviderId = 'va-provider-1';
      const vaProviderSlotsQueryArgs = {
        referralId: 'UUID',
        providerType: 'va',
        clinicId: vaProviderId,
        locationId: '648',
        clinicalService: 'primaryCare',
      };
      const vaProviderSlotsQueryKey = defaultSerializeQueryArgs({
        endpointName: 'getProviderSlots',
        queryArgs: vaProviderSlotsQueryArgs,
      });

      const store = createTestStore({
        featureToggles: {
          vaOnlineSchedulingCCDirectScheduling: true,
        },
        referral: {
          selectedSlotStartTime: slotDate,
          selectedProviderId: vaProviderId,
          providerSlotsParams: vaProviderSlotsQueryArgs,
          currentPage: 'reviewAndConfirm',
          appointmentCreateStatus: FETCH_STATUS.notStarted,
          pollingRequestStart: null,
          appointmentInfoError: false,
          appointmentInfoLoading: false,
          referralAppointmentInfo: {},
        },
        appointmentApi: {
          queries: {
            [vaProviderSlotsQueryKey]: rejectedQueryEntry,
          },
          subscriptions: {
            [vaProviderSlotsQueryKey]: {
              'slots-rejected': { pollingInterval: 0 },
            },
          },
        },
      });

      const screen = renderWithStoreAndRouter(
        <ReviewAndConfirm
          currentReferral={createReferralById(
            '2024-09-09',
            'UUID',
            undefined,
            undefined,
            true,
            '534QD',
            true,
            'VA',
          )}
        />,
        { store, path: testPath },
      );

      expect(await screen.findByTestId('error')).to.exist;
      expect(screen.getByText(/This tool isn\u2019t working right now/i)).to
        .exist;
      expect(screen.getByTestId('find-va-facility-link')).to.exist;
    });
  });

  it('should display Community Care details section with correct content', async () => {
    const store = createTestStore(initialFullState);

    const screen = renderWithStoreAndRouter(
      <ReviewAndConfirm
        currentReferral={createReferralById('2024-09-09', 'UUID')}
      />,
      {
        store,
        path: testPath,
      },
    );

    await screen.findByTestId('continue-button');

    expect(screen.getByRole('heading', { name: 'Details' })).to.exist;
    expect(screen.getByText('Community care')).to.exist;
    expect(screen.getByText(draftAppointmentInfo.attributes.provider.name)).to
      .exist;
    expect(
      screen.getByText(
        draftAppointmentInfo.attributes.provider.providerOrganization.name,
      ),
    ).to.exist;
    expect(screen.getByText('Phone')).to.exist;
    expect(screen.getByTestId('edit-details-link')).to.exist;
    expect(screen.getByTestId('continue-button')).to.have.attr(
      'text',
      'Confirm appointment',
    );
  });

  it('should display the Date and time section with Edit link', async () => {
    const store = createTestStore(initialFullState);

    const screen = renderWithStoreAndRouter(
      <ReviewAndConfirm
        currentReferral={createReferralById('2024-09-09', 'UUID')}
      />,
      {
        store,
        path: testPath,
      },
    );

    await screen.findByTestId('continue-button');

    expect(screen.getByRole('heading', { name: 'Date and time' })).to.exist;
    expect(screen.getByTestId('edit-when-information-link')).to.exist;
    expect(screen.getByTestId('slot-day-time')).to.exist;
  });

  it('should display modality from shared config', async () => {
    const store = createTestStore(initialFullState);

    const screen = renderWithStoreAndRouter(
      <ReviewAndConfirm
        currentReferral={createReferralById('2024-09-09', 'UUID')}
      />,
      {
        store,
        path: testPath,
      },
    );

    await screen.findByTestId('continue-button');
    expect(screen.getByTestId('review-modality')).to.exist;
    expect(screen.getByTestId('review-modality')).to.contain.text('Phone');
  });

  it('should display provider address via ProviderAddress component', async () => {
    const store = createTestStore(initialFullState);

    const screen = renderWithStoreAndRouter(
      <ReviewAndConfirm
        currentReferral={createReferralById('2024-09-09', 'UUID')}
      />,
      {
        store,
        path: testPath,
      },
    );

    await screen.findByTestId('continue-button');
    expect(screen.getByTestId('address-block')).to.exist;
  });

  it('should replace history with the date-time page when inline Back is clicked', async () => {
    const store = createTestStore(initialFullState);
    const screen = renderWithStoreAndRouter(
      <ReviewAndConfirm
        currentReferral={createReferralById('2024-09-09', 'UUID')}
      />,
      {
        store,
        path: testPath,
      },
    );

    const backButton = await screen.findByTestId('back-button');
    screen.history.replace.resetHistory();
    await userEvent.click(backButton);

    const replaceCalls = screen.history.replace.args.map(args => args[0]);
    const matched = replaceCalls.some(
      url =>
        typeof url === 'string' &&
        url.includes('/schedule-referral/date-time') &&
        url.includes('id=UUID'),
    );
    expect(matched).to.be.true;
  });

  it('should replace history with the date-time page when "Edit date and time" is clicked', async () => {
    const store = createTestStore(initialFullState);
    const screen = renderWithStoreAndRouter(
      <ReviewAndConfirm
        currentReferral={createReferralById('2024-09-09', 'UUID')}
      />,
      {
        store,
        path: testPath,
      },
    );

    const editLink = await screen.findByTestId('edit-when-information-link');
    screen.history.replace.resetHistory();
    editLink.click();

    const replaceCalls = screen.history.replace.args.map(args => args[0]);
    const matched = replaceCalls.some(
      url =>
        typeof url === 'string' &&
        url.includes('/schedule-referral/date-time') &&
        url.includes('id=UUID'),
    );
    expect(matched).to.be.true;
  });

  it('should push history to the provider-selection page when "Edit details" is clicked', async () => {
    const store = createTestStore(initialFullState);
    const screen = renderWithStoreAndRouter(
      <ReviewAndConfirm
        currentReferral={createReferralById('2024-09-09', 'UUID')}
      />,
      {
        store,
        path: testPath,
      },
    );

    const editLink = await screen.findByTestId('edit-details-link');
    screen.history.push.resetHistory();
    editLink.click();

    const pushCalls = screen.history.push.args.map(args => args[0]);
    const matched = pushCalls.some(
      url =>
        typeof url === 'string' &&
        url.includes('/schedule-referral/provider-selection') &&
        url.includes('id=UUID'),
    );
    expect(matched).to.be.true;
  });

  describe('VA appointment flow', () => {
    const vaProviderId = 'va-provider-1';
    const vaProviderSlotsQueryArgs = {
      referralId: 'UUID',
      providerType: 'va',
      clinicId: vaProviderId,
      locationId: '648',
      clinicalService: 'primaryCare',
    };
    const vaProviderSlotsQueryKey = defaultSerializeQueryArgs({
      endpointName: 'getProviderSlots',
      queryArgs: vaProviderSlotsQueryArgs,
    });

    const vaDraftAppointmentInfo = {
      id: vaProviderId,
      type: 'provider_slots',
      attributes: {
        careType: 'VA',
        provider: {
          id: vaProviderId,
          name: 'Primary Care Clinic A',
          careType: 'VA',
          facilityName: 'Portland VA Medical Center',
          phone: '(503) 555-0100',
          visitMode: 'inPerson',
          locationId: '648',
          clinicId: vaProviderId,
          serviceType: 'primaryCare',
          providerServiceId: null,
          networkId: null,
          networkIds: [],
          appointmentTypes: null,
          location: {
            name: 'Portland VA Medical Center',
            address: '3710 SW US Veterans Hospital Rd, Portland, OR 97239',
            latitude: 45.4977,
            longitude: -122.6834,
            timezone: 'America/Los_Angeles',
          },
        },
        slots: [],
      },
    };

    const vaSlots = generateSlotsForDay(slotDate, {
      slotsPerDay: 1,
      slotDuration: 60,
      businessHours: { start: 12, end: 18 },
    });
    vaDraftAppointmentInfo.attributes.slots = transformSlotsForCommunityCare(
      vaSlots,
    );
    vaDraftAppointmentInfo.attributes.slots[0].start = slotDate;

    const createVAState = (overrides = {}) => ({
      featureToggles: {
        vaOnlineSchedulingCCDirectScheduling: true,
      },
      referral: {
        selectedSlotStartTime: slotDate,
        selectedProviderId: vaProviderId,
        providerSlotsParams: {
          providerType: 'va',
          clinicId: vaProviderId,
          locationId: '648',
          clinicalService: 'primaryCare',
        },
        currentPage: 'reviewAndConfirm',
        appointmentCreateStatus: FETCH_STATUS.notStarted,
        pollingRequestStart: null,
        appointmentInfoError: false,
        appointmentInfoLoading: false,
        referralAppointmentInfo: {},
        ...overrides,
      },
      appointmentApi: {
        queries: {
          [vaProviderSlotsQueryKey]: {
            status: 'fulfilled',
            data: vaDraftAppointmentInfo,
            endpoint: 'getProviderSlots',
            requestId: 'va-abc',
            startedTimeStamp: 1758046349181,
            fulfilledTimeStamp: 1758046349182,
          },
        },
        subscriptions: {
          [vaProviderSlotsQueryKey]: {
            'va-abc': { pollingInterval: 0 },
          },
        },
      },
    });

    const vaTestPath = '/';

    it('should display VA Details section with clinic name and facility', async () => {
      const store = createTestStore(createVAState());

      const screen = renderWithStoreAndRouter(
        <ReviewAndConfirm
          currentReferral={createReferralById('2024-09-09', 'UUID')}
        />,
        {
          store,
          path: vaTestPath,
        },
      );

      await screen.findByTestId('continue-button');

      expect(screen.getByRole('heading', { name: 'Details' })).to.exist;
      expect(screen.getByText('VA care')).to.exist;
      expect(screen.getByText(/Clinic: Primary Care Clinic A/)).to.exist;
      expect(screen.getByText('Portland VA Medical Center')).to.exist;
      expect(screen.getByTestId('address-block')).to.exist;
    });

    it('should send VA booking payload when confirming', async () => {
      let capturedBody;

      server.use(
        createPostHandler(
          `${environment.API_URL}/vaos/v2/unified_bookings`,
          async ({ request }) => {
            capturedBody = await request.json();
            return jsonResponse({
              data: { appointmentId: 'mock-va-appt' },
            });
          },
        ),
      );

      const store = createTestStore(createVAState());

      const screen = renderWithStoreAndRouter(
        <ReviewAndConfirm
          currentReferral={createReferralById('2024-09-09', 'UUID')}
        />,
        {
          store,
          path: vaTestPath,
        },
      );

      await screen.findByTestId('continue-button');
      await userEvent.click(screen.getByTestId('continue-button'));

      await waitFor(() => {
        expect(capturedBody).to.exist;
        expect(capturedBody.providerType).to.equal('va');
        expect(capturedBody.clinicId).to.equal(vaProviderId);
        expect(capturedBody.locationId).to.equal('648');
        expect(capturedBody.serviceType).to.equal('primaryCare');
        expect(capturedBody.slotId).to.exist;
      });
    });
  });
});
