import { expect } from 'chai';
import React from 'react';
import { renderWithStoreAndRouterV6 } from '@department-of-veterans-affairs/platform-testing/react-testing-library-helpers';
import FEATURE_FLAG_NAMES from 'platform/utilities/feature-toggles/featureFlagNames';
import reducers from '../../../reducers';
import prescriptionsListItem from '../../fixtures/prescriptionsListItem.json';
import ExtraDetails from '../../../components/shared/ExtraDetails';
import { dispStatusObj, dispStatusObjV2 } from '../../../util/constants';
import { pageType } from '../../../util/dataDogConstants';

describe('Medications List Card Extra Details', () => {
  const FLAG_COMBINATIONS = [
    {
      cernerPilot: false,
      v2StatusMapping: false,
      useV2: false,
      desc: 'both flags disabled',
    },
    {
      cernerPilot: true,
      v2StatusMapping: false,
      useV2: false,
      desc: 'only cernerPilot enabled',
    },
    {
      cernerPilot: false,
      v2StatusMapping: true,
      useV2: false,
      desc: 'only v2StatusMapping enabled',
    },
    {
      cernerPilot: true,
      v2StatusMapping: true,
      useV2: true,
      desc: 'both flags enabled',
    },
  ];

  const V1_STATUS_TESTS = [
    { status: dispStatusObj.unknown, testId: 'unknown' },
    {
      status: dispStatusObj.refillinprocess,
      testId: 'rx-refillinprocess-info',
    },
    { status: dispStatusObj.submitted, testId: 'submitted-refill-request' },
    { status: dispStatusObj.discontinued, testId: 'discontinued' },
    { status: dispStatusObj.activeParked, testId: 'active-parked' },
    { status: dispStatusObj.transferred, testId: 'transferred' },
    { status: dispStatusObj.onHold, testId: 'active-onHold' },
    { status: dispStatusObj.expired, testId: 'expired', refillRemaining: 0 },
  ];

  const V2_STATUS_TESTS = [
    { status: dispStatusObjV2.statusNotAvailable, testId: 'unknown' },
    { status: dispStatusObjV2.inprogress, testId: 'refill-in-process' },
    { status: dispStatusObjV2.inactive, testId: 'inactive' },
    { status: dispStatusObjV2.transferred, testId: 'transferred' },
  ];

  const prescription = prescriptionsListItem;

  // Reusable renewable VA prescription at an Oracle Health facility.
  const renewableOHRx = (overrides = {}) => ({
    ...prescription,
    isRenewable: true,
    prescriptionSource: 'VA',
    dispStatus: dispStatusObj.active,
    refillRemaining: 0,
    stationNumber: '668',
    ...overrides,
  });

  const setup = (
    rx = prescription,
    initialState = {},
    isCernerPilot = false,
    isV2StatusMapping = false,
    page,
  ) => {
    const featureToggleReducer = (state = {}) => state;
    const testReducers = {
      ...reducers,
      featureToggles: featureToggleReducer,
    };

    const state = {
      ...initialState,
      featureToggles: {
        [FEATURE_FLAG_NAMES.mhvSecureMessagingMedicationsRenewalRequest]: true,
        [FEATURE_FLAG_NAMES.mhvMedicationsCernerPilot]: isCernerPilot,
        [FEATURE_FLAG_NAMES.mhvMedicationsV2StatusMapping]: isV2StatusMapping,
        ...(initialState.featureToggles || {}),
      },
      drupalStaticData: {
        vamcEhrData: {
          data: {
            cernerFacilities: [
              { vhaId: '668', vamcFacilityName: 'Spokane VA' },
            ],
          },
        },
        ...(initialState.drupalStaticData || {}),
      },
    };

    const pageToPass = rx.page !== undefined ? rx.page : page;
    const rxWithoutPage = { ...rx };
    delete rxWithoutPage.page;

    return renderWithStoreAndRouterV6(
      <ExtraDetails {...rxWithoutPage} page={pageToPass} />,
      {
        initialState: state,
        reducers: testReducers,
      },
    );
  };

  const setupWithRenewalLink = (
    rx = prescription,
    renewalLinkShownAbove = false,
    initialState = {},
    isCernerPilot = false,
    isV2StatusMapping = false,
  ) => {
    const featureToggleReducer = (state = {}) => state;
    const testReducers = {
      ...reducers,
      featureToggles: featureToggleReducer,
    };

    const state = {
      ...initialState,
      featureToggles: {
        [FEATURE_FLAG_NAMES.mhvSecureMessagingMedicationsRenewalRequest]: true,
        [FEATURE_FLAG_NAMES.mhvMedicationsCernerPilot]: isCernerPilot,
        [FEATURE_FLAG_NAMES.mhvMedicationsV2StatusMapping]: isV2StatusMapping,
        ...(initialState.featureToggles || {}),
      },
      drupalStaticData: {
        vamcEhrData: {
          data: {
            cernerFacilities: [
              { vhaId: '668', vamcFacilityName: 'Spokane VA' },
            ],
          },
        },
        ...(initialState.drupalStaticData || {}),
      },
    };

    return renderWithStoreAndRouterV6(
      <ExtraDetails {...rx} renewalLinkShownAbove={renewalLinkShownAbove} />,
      {
        initialState: state,
        reducers: testReducers,
      },
    );
  };

  it('renders without errors', () => {
    const screen = setup();
    expect(screen);
  });

  // REFACTORED: Consolidated V1 status tests into parameterized block
  describe('V1 status handling (when flags disabled)', () => {
    V1_STATUS_TESTS.forEach(({ status, testId, refillRemaining }) => {
      it(`displays ${status} content correctly`, async () => {
        const rx = { ...prescription, dispStatus: status };
        if (refillRemaining !== undefined) rx.refillRemaining = refillRemaining;
        const screen = setup(rx);
        expect(await screen.findByTestId(testId)).to.exist;
      });
    });

    it('displays active with no refills content correctly', async () => {
      const screen = setup({
        ...prescription,
        dispStatus: dispStatusObj.active,
        refillRemaining: 0,
      });
      expect(
        await screen.findByTestId('active-no-refill-left'),
      ).to.contain.text(
        'Contact your VA provider if you need more of this medication.',
      );
    });

    it('displays OH-specific text for active with no refills for Oracle Health', async () => {
      const screen = setup({
        ...prescription,
        dispStatus: dispStatusObj.active,
        refillRemaining: 0,
        stationNumber: '668',
      });
      expect(
        await screen.findByTestId('active-no-refill-left'),
      ).to.contain.text('send a secure message to your care team');
    });

    it('displays fallback text for discontinued prescription (not renewable per spec Gate 1)', async () => {
      const screen = setup({
        ...prescription,
        dispStatus: dispStatusObj.discontinued,
      });
      expect(await screen.findByTestId('discontinued')).to.exist;
      expect(screen.queryByTestId('send-renewal-request-message-link')).to.not
        .exist;
    });
  });

  describe('V2 status handling (when BOTH CernerPilot and V2StatusMapping flags enabled)', () => {
    V2_STATUS_TESTS.forEach(({ status, testId, refillRemaining }) => {
      it(`displays ${status} message`, async () => {
        const rx = { ...prescription, dispStatus: status };
        if (refillRemaining !== undefined) rx.refillRemaining = refillRemaining;
        const screen = setup(rx, {}, true, true);
        expect(await screen.findByTestId(testId)).to.exist;
      });
    });

    it('displays no refills left message when Active with 0 refills', async () => {
      const screen = setup(
        {
          ...prescription,
          dispStatus: dispStatusObjV2.active,
          refillRemaining: 0,
        },
        {},
        true,
        true,
      );
      expect(await screen.findByTestId('active-no-refill-left')).to.exist;
    });

    it('renders nothing when Active with refills remaining', () => {
      const screen = setup(
        {
          ...prescription,
          dispStatus: dispStatusObjV2.active,
          refillRemaining: 3,
        },
        {},
        true,
        true,
      );
      // V2 Active with refills remaining returns null (component renders nothing)
      expect(screen.container.querySelector('.shipping-info')).to.not.exist;
    });
  });

  describe('when mhvMedicationsManagementImprovements flag is enabled', () => {
    const setupWithMedsImprovementsFlag = (rx, additionalFlags = {}) => {
      return setup(rx, {
        featureToggles: {
          [FEATURE_FLAG_NAMES.mhvMedicationsManagementImprovements]: true,
          ...additionalFlags,
        },
      });
    };

    describe('V1 Active unfilled prescriptions', () => {
      it('displays updated message for unfilled prescription with phone', async () => {
        const screen = setupWithMedsImprovementsFlag({
          ...prescription,
          dispStatus: dispStatusObj.active,
          refillRemaining: 5,
          dispensedDate: null,
          rxRfRecords: [],
          stationNumber: '668',
          cmopDivisionPhone: '(509) 434-7000',
        });
        const el = await screen.findByTestId('active-unfilled-oh');
        expect(el.textContent).to.include(
          'We haven’t filled this prescription yet. Details may change.',
        );
        expect(el.textContent).to.include(
          'If you need this medication now, call your VA pharmacy',
        );
      });

      it('displays updated message for unfilled prescription without phone', async () => {
        const screen = setupWithMedsImprovementsFlag({
          ...prescription,
          dispStatus: dispStatusObj.active,
          refillRemaining: 5,
          dispensedDate: null,
          rxRfRecords: [],
          stationNumber: '668',
          cmopDivisionPhone: null,
        });
        const el = await screen.findByTestId('active-unfilled-oh');
        expect(el.textContent).to.include(
          'We haven’t filled this prescription yet. Details may change.',
        );
        expect(el.textContent).to.include(
          'call your VA pharmacy’s automated refill line',
        );
        expect(el.textContent).to.include('medication details page');
      });
    });

    describe('onHold status', () => {
      it('displays no-phone fallback text when phone number is not available', async () => {
        const screen = setupWithMedsImprovementsFlag({
          ...prescription,
          dispStatus: dispStatusObj.onHold,
          cmopDivisionPhone: null,
          dialCmopDivisionPhone: null,
          rxRfRecords: [],
        });
        const el = await screen.findByTestId('active-onHold');
        expect(el.textContent).to.include(
          'You can’t refill this prescription online right now.',
        );
        expect(el.textContent).to.include(
          'If you need a refill, call your VA pharmacy’s automated refill line.',
        );
        expect(el.textContent).to.include(
          'The phone number is on your prescription label or in your medication details page.',
        );
      });

      it('displays phone number when phone is available', async () => {
        const screen = setupWithMedsImprovementsFlag({
          ...prescription,
          dispStatus: dispStatusObj.onHold,
          cmopDivisionPhone: '(509) 434-7000',
        });
        const el = await screen.findByTestId('active-onHold');
        expect(el.textContent).to.include(
          'You can’t refill this prescription online right now.',
        );
        expect(el.textContent).to.include(
          'If you need a refill, call your VA pharmacy',
        );
        expect(screen.getByTestId('pharmacy-phone-number')).to.exist;
      });
    });

    describe('Unknown status (S17)', () => {
      it('displays phone number when phone is available', async () => {
        const screen = setupWithMedsImprovementsFlag({
          ...prescription,
          dispStatus: dispStatusObj.unknown,
          cmopDivisionPhone: '(123) 456-7890',
          dialCmopDivisionPhone: '1234567890',
        });
        const el = await screen.findByTestId('unknown-rx');
        expect(el.textContent).to.include(
          'We’re sorry. There’s a problem with our system.',
        );
        expect(el.textContent).to.include(
          'If you have questions, call your VA pharmacy',
        );
        expect(screen.getByTestId('pharmacy-phone-number')).to.exist;
      });

      it('displays no-phone fallback text when phone is not available', async () => {
        const screen = setupWithMedsImprovementsFlag({
          ...prescription,
          dispStatus: dispStatusObj.unknown,
          cmopDivisionPhone: null,
          dialCmopDivisionPhone: null,
          rxRfRecords: [],
        });
        const el = await screen.findByTestId('unknown-rx');
        expect(el.textContent).to.include(
          'We’re sorry. There’s a problem with our system.',
        );
        expect(el.textContent).to.include(
          'If you have questions, call your VA pharmacy.',
        );
        expect(el.textContent).to.include(
          'The phone number is on your prescription label or in your medication details page.',
        );
      });

      it('displays V2 unknown status message when both CernerPilot and V2StatusMapping flags enabled', async () => {
        const rxWithUnknown = {
          ...prescription,
          dispStatus: dispStatusObjV2.statusNotAvailable,
          cmopDivisionPhone: '(123) 456-7890',
          dialCmopDivisionPhone: '1234567890',
        };
        const screen = setup(
          rxWithUnknown,
          {
            featureToggles: {
              [FEATURE_FLAG_NAMES.mhvMedicationsManagementImprovements]: true,
            },
          },
          true,
          true,
        );
        const el = await screen.findByTestId('unknown-rx');
        expect(el.textContent).to.include(
          'We’re sorry. There’s a problem with our system.',
        );
        expect(el.textContent).to.include(
          'If you have questions, call your VA pharmacy',
        );
        expect(screen.getByTestId('pharmacy-phone-number')).to.exist;
      });
    });
  });

  describe('when mhvMedicationsManagementImprovements flag is disabled', () => {
    it('displays legacy message with phone number for onHold prescription', async () => {
      const screen = setup(
        {
          ...prescription,
          dispStatus: dispStatusObj.onHold,
          cmopDivisionPhone: '(509) 434-7000',
        },
        {
          featureToggles: {
            [FEATURE_FLAG_NAMES.mhvMedicationsManagementImprovements]: false,
          },
        },
      );
      const el = await screen.findByTestId('active-onHold');
      expect(el).to.exist;
      expect(el.textContent).to.include('You can’t refill this prescription.');
      expect(el.textContent).to.include(
        'Contact your VA provider if you need more of this medication.',
      );
      expect(screen.getByTestId('pharmacy-phone-number')).to.exist;
    });

    it('displays legacy message with phone for Unknown status', async () => {
      const screen = setup(
        {
          ...prescription,
          dispStatus: dispStatusObj.unknown,
          cmopDivisionPhone: '(123) 456-7890',
          dialCmopDivisionPhone: '1234567890',
        },
        {
          featureToggles: {
            [FEATURE_FLAG_NAMES.mhvMedicationsManagementImprovements]: false,
          },
        },
      );
      const el = await screen.findByTestId('unknown-rx');
      expect(el.textContent).to.include(
        'We’re sorry. There’s a problem with our system.',
      );
      expect(el.textContent).to.include('Call your VA pharmacy');
      expect(screen.getByTestId('pharmacy-phone-number')).to.exist;
    });

    it('displays legacy message without phone for Unknown status when phone is not available', async () => {
      const screen = setup(
        {
          ...prescription,
          dispStatus: dispStatusObj.unknown,
          cmopDivisionPhone: null,
          dialCmopDivisionPhone: null,
          rxRfRecords: [],
        },
        {
          featureToggles: {
            [FEATURE_FLAG_NAMES.mhvMedicationsManagementImprovements]: false,
          },
        },
      );
      const el = await screen.findByTestId('unknown-rx');
      expect(el.textContent).to.include(
        'We’re sorry. There’s a problem with our system.',
      );
      expect(el.textContent).to.include('Call your VA pharmacy');
      // Phone link should not be rendered when no phone
      expect(screen.queryByTestId('pharmacy-phone-number')).to.not.exist;
    });
  });

  describe('Expired ≤120 days with renewal link shown above', () => {
    it('renders nothing when renewalLinkShownAbove is true and expired within 120 days', async () => {
      const recentExpirationDate = new Date(
        Date.now() - 60 * 24 * 60 * 60 * 1000,
      ).toISOString(); // 60 days ago
      const screen = setupWithRenewalLink(
        renewableOHRx({
          dispStatus: dispStatusObj.expired,
          expirationDate: recentExpirationDate,
        }),
        true,
      );
      expect(screen.queryByTestId('expired')).to.not.exist;
      expect(screen.queryByTestId('send-renewal-request-message-link')).to.not
        .exist;
    });

    it('shows fallback content when expiration date is > 120 days ago', async () => {
      const oldExpirationDate = new Date(
        Date.now() - 150 * 24 * 60 * 60 * 1000,
      ).toISOString(); // 150 days ago
      const screen = setupWithRenewalLink(
        renewableOHRx({
          dispStatus: dispStatusObj.expired,
          expirationDate: oldExpirationDate,
        }),
        true,
      );
      expect(await screen.findByTestId('expired')).to.exist;
    });
  });

  describe('CernerPilot and V2StatusMapping flag requirement validation', () => {
    FLAG_COMBINATIONS.forEach(
      ({ cernerPilot, v2StatusMapping, useV2, desc }) => {
        it(`uses ${
          useV2 ? 'V2' : 'V1'
        } status logic when ${desc}`, async () => {
          // Pass appropriate status based on flag combination
          // When both flags enabled, API returns V2 status; otherwise V1
          const statusToTest = useV2
            ? dispStatusObjV2.inactive
            : dispStatusObj.activeParked;
          const expectedTestId = useV2 ? 'inactive' : 'active-parked';
          const screen = setup(
            { ...prescription, dispStatus: statusToTest },
            {},
            cernerPilot,
            v2StatusMapping,
          );
          expect(await screen.findByTestId(expectedTestId)).to.exist;
        });
      },
    );
  });

  describe('Non-VA status preservation', () => {
    FLAG_COMBINATIONS.forEach(({ cernerPilot, v2StatusMapping, desc }) => {
      it(`preserves Non-VA behavior when ${desc}`, async () => {
        const screen = setup(
          {
            ...prescription,
            dispStatus: 'Active: Non-VA',
            prescriptionSource: 'NV',
          },
          {},
          cernerPilot,
          v2StatusMapping,
        );
        expect(await screen.findByTestId('non-VA-prescription')).to.exist;
      });
    });
  });

  describe('isRenewable for OH prescriptions', () => {
    it('does not display renewal link when isRenewable is true but prescription is non-VA', async () => {
      const screen = setup(renewableOHRx());
      expect(await screen.findByTestId('active-no-refill-left')).to.exist;
      expect(await screen.findByTestId('send-renewal-request-message-link')).to
        .exist;
    });

    it('displays renewal link when Expired and isRenewable is true for Oracle Health', async () => {
      const screen = setup(
        renewableOHRx({ dispStatus: dispStatusObj.expired }),
      );
      expect(await screen.findByTestId('send-renewal-request-message-link')).to
        .exist;
    });

    it('does not display renewal link for non-VA prescription even if isRenewable is true', async () => {
      const screen = setup(
        renewableOHRx({ prescriptionSource: 'NV', dispStatus: null }),
      );
      expect(screen.queryByTestId('send-renewal-request-message-link')).to.not
        .exist;
    });

    it('does not display renewal link when Active has refills even if isRenewable is true', async () => {
      const screen = setup(renewableOHRx({ refillRemaining: 5 }));
      expect(screen.queryByTestId('send-renewal-request-message-link')).to.not
        .exist;
    });

    it('does not display renewal link when isRenewable is false even for Active with 0 refills', async () => {
      const screen = setup(renewableOHRx({ isRenewable: false }));
      expect(await screen.findByTestId('active-no-refill-left')).to.exist;
      expect(screen.queryByTestId('send-renewal-request-message-link')).to.not
        .exist;
    });

    it('uses dispStatus logic when isRenewable is undefined', async () => {
      const screen = setup({
        ...prescription,
        isRenewable: undefined,
        prescriptionSource: 'VA',
        dispStatus: dispStatusObj.active,
        refillRemaining: 0,
      });
      expect(
        await screen.findByTestId('active-no-refill-left'),
      ).to.contain.text(
        'Contact your VA provider if you need more of this medication.',
      );
    });
  });
  describe('renewalLinkShownAbove prop suppresses renewal link in ExtraDetails', () => {
    it('suppresses renewal link when renewalLinkShownAbove is true for Active with 0 refills (OH)', async () => {
      const screen = setupWithRenewalLink(renewableOHRx(), true);
      expect(await screen.findByTestId('active-no-refill-left')).to.exist;
      expect(screen.queryByTestId('send-renewal-request-message-link')).to.not
        .exist;
    });

    it('shows renewal link when renewalLinkShownAbove is false for Active with 0 refills (OH)', async () => {
      const screen = setupWithRenewalLink(renewableOHRx(), false);
      expect(await screen.findByTestId('active-no-refill-left')).to.exist;
      expect(screen.queryByTestId('send-renewal-request-message-link')).to
        .exist;
    });

    it('suppresses renewal link when renewalLinkShownAbove is true for Expired (OH)', async () => {
      const screen = setupWithRenewalLink(
        renewableOHRx({ dispStatus: dispStatusObj.expired }),
        true,
      );
      expect(await screen.findByTestId('expired')).to.exist;
      expect(screen.queryByTestId('send-renewal-request-message-link')).to.not
        .exist;
    });

    it('suppresses renewal link when renewalLinkShownAbove is true for V2 Inactive (OH)', async () => {
      const screen = setupWithRenewalLink(
        renewableOHRx({ dispStatus: dispStatusObjV2.inactive }),
        true,
        {},
        true,
        true,
      );
      expect(await screen.findByTestId('inactive')).to.exist;
      expect(screen.queryByTestId('send-renewal-request-message-link')).to.not
        .exist;
    });
  });

  describe('V2 expired and nonVA statuses', () => {
    it('displays expired message for V2 Expired status', async () => {
      const screen = setup(
        {
          ...prescription,
          dispStatus: dispStatusObjV2.expired,
          refillRemaining: 0,
        },
        {},
        true,
        true,
      );
      expect(await screen.findByTestId('expired')).to.exist;
    });

    it('displays non-VA message for V2 Non-VA status', async () => {
      const screen = setup(
        {
          ...prescription,
          dispStatus: dispStatusObjV2.nonVA,
        },
        {},
        true,
        true,
      );
      expect(await screen.findByTestId('non-VA-prescription')).to.exist;
    });
  });

  describe('RefillButton rendering based on page prop', () => {
    it('renders refill button on list page for active prescription with refills', async () => {
      const screen = setup({
        ...prescription,
        dispStatus: dispStatusObj.active,
        isRefillable: true,
        refillRemaining: 3,
        page: pageType.LIST,
      });
      expect(await screen.findByTestId('refill-request-button')).to.exist;
    });

    it('renders refill button on list page for active parked prescription with refills', async () => {
      const screen = setup({
        ...prescription,
        dispStatus: dispStatusObj.activeParked,
        isRefillable: true,
        refillRemaining: 3,
        page: pageType.LIST,
      });
      expect(await screen.findByTestId('refill-request-button')).to.exist;
    });

    it('does not render refill button on details page for active parked prescription', async () => {
      const screen = setup({
        ...prescription,
        dispStatus: dispStatusObj.activeParked,
        isRefillable: true,
        refillRemaining: 3,
        page: pageType.DETAILS,
      });
      expect(screen.queryByTestId('refill-request-button')).to.not.exist;
    });

    it('does not render refill button when page prop is not provided', async () => {
      const screen = setup({
        ...prescription,
        dispStatus: dispStatusObj.activeParked,
        isRefillable: true,
        refillRemaining: 3,
      });
      expect(screen.queryByTestId('refill-request-button')).to.not.exist;
    });

    it('does not render refill button when prescription is not refillable', async () => {
      const screen = setup({
        ...prescription,
        dispStatus: dispStatusObj.activeParked,
        isRefillable: false,
        refillRemaining: 3,
        page: pageType.LIST,
      });
      expect(screen.queryByTestId('refill-request-button')).to.not.exist;
    });

    it('renders refill button for V2 Active status on list page', async () => {
      const screen = setup(
        {
          ...prescription,
          dispStatus: dispStatusObjV2.active,
          isRefillable: true,
          refillRemaining: 3,
          page: pageType.LIST,
        },
        {},
        true,
        true,
      );
      expect(await screen.findByTestId('refill-request-button')).to.exist;
    });

    it('does not render refill button for V2 Active status on details page', async () => {
      const screen = setup(
        {
          ...prescription,
          dispStatus: dispStatusObjV2.active,
          isRefillable: true,
          refillRemaining: 3,
          page: pageType.DETAILS,
        },
        {},
        true,
        true,
      );
      expect(screen.queryByTestId('refill-request-button')).to.not.exist;
    });
  });

  describe('isRenewalBlocked prop for Oracle Health transition', () => {
    const setupWithRenewalBlocked = (
      rx,
      isCernerPilot = false,
      isV2StatusMapping = false,
    ) => {
      return setup(
        { ...rx, isRenewalBlocked: true },
        {},
        isCernerPilot,
        isV2StatusMapping,
      );
    };

    // Assertion helpers for distinguishing transition alert vs renewal link
    const expectTransitionAlertShown = async screen => {
      expect(await screen.findByTestId('oracle-health-renewal-in-card-alert'))
        .to.exist;
    };

    const expectTransitionAlertNotShown = screen => {
      expect(screen.queryByTestId('oracle-health-renewal-in-card-alert')).to.not
        .exist;
    };

    const expectRenewalLinkShown = async screen => {
      expect(await screen.findByTestId('send-renewal-request-message-link')).to
        .exist;
    };

    const expectRenewalLinkNotShown = screen => {
      expect(screen.queryByTestId('send-renewal-request-message-link')).to.not
        .exist;
    };

    describe('when isRenewalBlocked is true (Oracle Health transition active)', () => {
      describe('renewable prescriptions: shows transition alert instead of renewal link', () => {
        it('V1 Active with 0 refills: shows transition alert, hides renewal link and status content', async () => {
          const screen = setupWithRenewalBlocked(renewableOHRx());
          await expectTransitionAlertShown(screen);
          expectRenewalLinkNotShown(screen);
          expect(screen.queryByTestId('active-no-refill-left')).to.not.exist;
        });

        it('V1 Expired: shows transition alert, hides renewal link and status content', async () => {
          const screen = setupWithRenewalBlocked(
            renewableOHRx({ dispStatus: dispStatusObj.expired }),
          );
          await expectTransitionAlertShown(screen);
          expectRenewalLinkNotShown(screen);
          expect(screen.queryByTestId('expired')).to.not.exist;
        });

        it('V2 Active with 0 refills: shows transition alert, hides renewal link and status content', async () => {
          const screen = setupWithRenewalBlocked(
            renewableOHRx({ dispStatus: dispStatusObjV2.active }),
            true,
            true,
          );
          await expectTransitionAlertShown(screen);
          expectRenewalLinkNotShown(screen);
          expect(screen.queryByTestId('active-no-refill-left')).to.not.exist;
        });

        it('V2 Inactive: shows transition alert, hides renewal link and status content', async () => {
          const screen = setupWithRenewalBlocked(
            renewableOHRx({ dispStatus: dispStatusObjV2.inactive }),
            true,
            true,
          );
          await expectTransitionAlertShown(screen);
          expectRenewalLinkNotShown(screen);
          expect(screen.queryByTestId('inactive')).to.not.exist;
        });
      });

      describe('non-renewable prescriptions: shows normal status content, no transition alert or renewal link', () => {
        it('V1 Active with 0 refills: shows status content, no transition alert or renewal link', async () => {
          const screen = setupWithRenewalBlocked(
            renewableOHRx({ isRenewable: false }),
          );
          expectTransitionAlertNotShown(screen);
          expectRenewalLinkNotShown(screen);
          expect(await screen.findByTestId('active-no-refill-left')).to.exist;
        });

        it('V1 Expired: shows status content, no transition alert or renewal link', async () => {
          const screen = setupWithRenewalBlocked(
            renewableOHRx({
              isRenewable: false,
              dispStatus: dispStatusObj.expired,
            }),
          );
          expectTransitionAlertNotShown(screen);
          expectRenewalLinkNotShown(screen);
          expect(await screen.findByTestId('expired')).to.exist;
        });

        it('V2 Inactive: shows status content, no transition alert or renewal link', async () => {
          const screen = setupWithRenewalBlocked(
            renewableOHRx({
              isRenewable: false,
              dispStatus: dispStatusObjV2.inactive,
            }),
            true,
            true,
          );
          expectTransitionAlertNotShown(screen);
          expectRenewalLinkNotShown(screen);
          expect(await screen.findByTestId('inactive')).to.exist;
        });
      });
    });

    describe('when isRenewalBlocked is false (no Oracle Health transition blocking)', () => {
      it('V1 Active with 0 refills: shows renewal link and status content, no transition alert', async () => {
        const screen = setup(renewableOHRx());
        expectTransitionAlertNotShown(screen);
        expect(await screen.findByTestId('active-no-refill-left')).to.exist;
        await expectRenewalLinkShown(screen);
      });
    });
  });

  describe('isRefillBlocked prop for Oracle Health transition', () => {
    // Helper to create refillable prescription for testing hideRefillButton
    const createRefillablePrescription = (overrides = {}) => ({
      ...prescription,
      dispStatus: dispStatusObj.active,
      isRefillable: true,
      refillRemaining: 3,
      page: pageType.LIST,
      ...overrides,
    });

    // Assertion helpers
    const expectRefillButtonHidden = screen => {
      expect(screen.queryByTestId('refill-request-button')).to.not.exist;
    };

    const expectRefillButtonVisible = async screen => {
      expect(await screen.findByTestId('refill-request-button')).to.exist;
    };

    describe('when isRefillBlocked is true (prescription blocked by Oracle Health transition)', () => {
      it('hides refill button', async () => {
        const rx = createRefillablePrescription({ isRefillBlocked: true });
        const screen = setup(rx, {}, false, false);
        expectRefillButtonHidden(screen);
      });
    });

    describe('when isRefillBlocked is not provided (no Oracle Health transition blocking)', () => {
      it('shows refill button when isRefillBlocked is not provided (default behavior)', async () => {
        const rx = createRefillablePrescription();
        const screen = setup(rx, {}, false, false);
        await expectRefillButtonVisible(screen);
      });
    });
  });

  describe('when mhvMedicationsOracleHealthCutover feature flag is enabled', () => {
    const setupWithCutoverFlagEnabled = rx => {
      return setup(rx, {
        featureToggles: {
          [FEATURE_FLAG_NAMES.mhvMedicationsOracleHealthCutover]: true,
        },
      });
    };

    it('shows renewal alert when isRenewalBlocked prop is true', async () => {
      const rx = renewableOHRx({ isRenewalBlocked: true });
      const screen = setupWithCutoverFlagEnabled(rx);
      expect(await screen.findByTestId('oracle-health-renewal-in-card-alert'))
        .to.exist;
    });

    it('shows cutover text for V1 transferred status', async () => {
      const screen = setupWithCutoverFlagEnabled({
        ...prescription,
        dispStatus: dispStatusObj.transferred,
      });
      const el = await screen.findByTestId('transferred');
      expect(el).to.contain.text('This is a previous record');
      expect(screen.queryByTestId('prescription-VA-health-link')).to.not.exist;
    });

    it('shows cutover text for V2 transferred status', async () => {
      const screen = setup(
        { ...prescription, dispStatus: dispStatusObjV2.transferred },
        {
          featureToggles: {
            [FEATURE_FLAG_NAMES.mhvMedicationsOracleHealthCutover]: true,
          },
        },
        true,
        true,
      );
      const el = await screen.findByTestId('transferred');
      expect(el).to.contain.text('This is a previous record');
      expect(screen.queryByTestId('prescription-VA-health-link')).to.not.exist;
    });
  });

  describe('when mhvMedicationsOracleHealthCutover feature flag is disabled', () => {
    const setupWithCutoverFlagDisabled = rx => {
      return setup(rx, {
        featureToggles: {
          [FEATURE_FLAG_NAMES.mhvMedicationsOracleHealthCutover]: false,
        },
      });
    };

    it('shows legacy My VA Health link for V1 transferred status', async () => {
      const screen = setupWithCutoverFlagDisabled({
        ...prescription,
        dispStatus: dispStatusObj.transferred,
      });
      const el = await screen.findByTestId('transferred');
      expect(el).to.contain.text('go to our My VA Health portal');
      expect(screen.queryByTestId('prescription-VA-health-link')).to.exist;
    });

    it('shows legacy My VA Health link for V2 transferred status', async () => {
      const screen = setup(
        { ...prescription, dispStatus: dispStatusObjV2.transferred },
        {
          featureToggles: {
            [FEATURE_FLAG_NAMES.mhvMedicationsOracleHealthCutover]: false,
          },
        },
        true,
        true,
      );
      const el = await screen.findByTestId('transferred');
      expect(el).to.contain.text('go to our My VA Health portal');
      expect(screen.queryByTestId('prescription-VA-health-link')).to.exist;
    });
  });

  describe('unfilled Oracle Health prescriptions (V2)', () => {
    it('displays unfilled OH message for Active prescription with no dispense history', async () => {
      const unfilledOH = {
        ...prescription,
        dispStatus: dispStatusObjV2.active,
        refillRemaining: 5,
        stationNumber: '668', // OH facility
        dispensedDate: null,
        rxRfRecords: [],
      };
      const screen = setup(
        unfilledOH,
        {
          featureToggles: {
            [FEATURE_FLAG_NAMES.mhvMedicationsManagementImprovements]: true,
          },
        },
        true,
        true,
        pageType.LIST,
      );
      const message = await screen.findByTestId('active-unfilled-oh');
      expect(message).to.exist;
      expect(message).to.contain.text('filled this prescription yet');
      expect(message).to.contain.text('If you need this medication now');
      expect(screen.queryByTestId('refill-request-button')).to.not.exist;
    });

    it('displays unfilled OH message even with refills remaining', async () => {
      const unfilledOH = {
        ...prescription,
        dispStatus: dispStatusObjV2.active,
        refillRemaining: 10,
        stationNumber: '668', // OH facility
        dispensedDate: null,
        rxRfRecords: [],
      };
      const screen = setup(unfilledOH, {}, true, true, pageType.LIST);
      expect(await screen.findByTestId('active-unfilled-oh')).to.exist;
      expect(screen.queryByTestId('refill-request-button')).to.not.exist;
    });

    it('does not show unfilled OH message when prescription has been dispensed', async () => {
      const filledOH = {
        ...prescription,
        dispStatus: dispStatusObjV2.active,
        refillRemaining: 2,
        stationNumber: '668', // OH facility
        dispensedDate: '2024-01-15',
        rxRfRecords: [],
        isRefillable: true,
      };
      const screen = setup(filledOH, {}, true, true, pageType.LIST);
      expect(screen.queryByTestId('active-unfilled-oh')).to.not.exist;
      expect(await screen.findByTestId('refill-request-button')).to.exist;
    });

    it('does not show unfilled OH message when rxRfRecords has dispense', async () => {
      const filledOH = {
        ...prescription,
        dispStatus: dispStatusObjV2.active,
        refillRemaining: 2,
        stationNumber: '668', // OH facility
        dispensedDate: null,
        rxRfRecords: [{ dispensedDate: '2024-02-01' }],
        isRefillable: true,
      };
      const screen = setup(filledOH, {}, true, true, pageType.LIST);
      expect(screen.queryByTestId('active-unfilled-oh')).to.not.exist;
      expect(await screen.findByTestId('refill-request-button')).to.exist;
    });

    it('does not show unfilled OH message for non-OH facility', async () => {
      const nonOH = {
        ...prescription,
        dispStatus: dispStatusObjV2.active,
        refillRemaining: 5,
        stationNumber: '500', // Non-OH facility
        dispensedDate: null,
        rxRfRecords: [],
        isRefillable: true,
      };
      const screen = setup(nonOH, {}, true, true, pageType.LIST);
      expect(screen.queryByTestId('active-unfilled-oh')).to.not.exist;
      expect(await screen.findByTestId('refill-request-button')).to.exist;
    });

    it('shows unfilled OH message', async () => {
      const unfilledOH = {
        ...prescription,
        dispStatus: dispStatusObj.active,
        refillRemaining: 5,
        stationNumber: '668', // OH facility
        dispensedDate: null,
        rxRfRecords: [],
        isRefillable: false,
      };
      const screen = setup(unfilledOH, {}, false, false, pageType.LIST);
      expect(await screen.findByTestId('active-unfilled-oh')).to.exist;
      expect(screen.queryByTestId('refill-request-button')).to.not.exist;
    });
    it('shows unfilled OH message on details page as well', async () => {
      const unfilledOH = {
        ...prescription,
        dispStatus: dispStatusObjV2.active,
        refillRemaining: 5,
        stationNumber: '668', // OH facility
        dispensedDate: null,
        rxRfRecords: [],
        isRefillable: false,
      };
      const screen = setup(unfilledOH, {}, true, true, pageType.DETAILS);
      expect(await screen.findByTestId('active-unfilled-oh')).to.exist;
      expect(screen.queryByTestId('refill-request-button')).to.not.exist;
    });

    it('shows facility finder link when pharmacy phone is null', async () => {
      const unfilledOH = {
        ...prescription,
        dispStatus: dispStatusObjV2.active,
        refillRemaining: 5,
        stationNumber: '668', // OH facility
        dispensedDate: null,
        rxRfRecords: [],
        cmopDivisionPhone: null,
        pharmacyPhoneNumber: null,
        dialCmopDivisionPhone: null,
      };
      const screen = setup(
        unfilledOH,
        {
          featureToggles: {
            [FEATURE_FLAG_NAMES.mhvMedicationsManagementImprovements]: true,
          },
        },
        true,
        true,
        pageType.LIST,
      );
      const message = await screen.findByTestId('active-unfilled-oh');
      expect(message).to.exist;
      expect(message).to.contain.text('If you need this medication now');
      expect(message).to.contain.text('automated refill line');
      expect(message).to.contain.text('medication details page');
    });

    it('shows pharmacy phone when available', async () => {
      const unfilledOH = {
        ...prescription,
        dispStatus: dispStatusObjV2.active,
        refillRemaining: 5,
        stationNumber: '668', // OH facility
        dispensedDate: null,
        rxRfRecords: [],
        cmopDivisionPhone: '509-434-7000',
        pharmacyPhoneNumber: '509-434-7000',
      };
      const screen = setup(unfilledOH, {}, true, true, pageType.LIST);
      const message = await screen.findByTestId('active-unfilled-oh');
      expect(message).to.exist;
      expect(message).to.contain.text('call your VA pharmacy');
      expect(screen.getByTestId('pharmacy-phone-number')).to.exist;
    });

    it('shows facility finder link for V1 Active when phone is null', async () => {
      const unfilledOH = {
        ...prescription,
        dispStatus: dispStatusObj.active,
        refillRemaining: 5,
        stationNumber: '668', // OH facility
        dispensedDate: null,
        rxRfRecords: [],
        cmopDivisionPhone: null,
        pharmacyPhoneNumber: null,
      };
      const screen = setup(
        unfilledOH,
        {
          featureToggles: {
            [FEATURE_FLAG_NAMES.mhvMedicationsManagementImprovements]: true,
          },
        },
        false,
        false,
        pageType.LIST,
      );
      const message = await screen.findByTestId('active-unfilled-oh');
      expect(message).to.exist;
      expect(message).to.contain.text('automated refill line');
      expect(message).to.contain.text('medication details page');
    });
  });
});
