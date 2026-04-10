import { expect } from 'chai';
import React from 'react';
import { renderWithStoreAndRouterV6 } from '@department-of-veterans-affairs/platform-testing/react-testing-library-helpers';
import reducers from '../../../reducers';
import prescriptionsListItem from '../../fixtures/prescriptionsListItem.json';
import UnfilledOhMessage from '../../../components/shared/UnfilledOhMessage';
import { pageType } from '../../../util/dataDogConstants';

describe('UnfilledOhMessage', () => {
  const cleanPrescription = {
    ...prescriptionsListItem,
    cmopDivisionPhone: null,
    dialCmopDivisionPhone: null,
    rxRfRecords: prescriptionsListItem.rxRfRecords
      ? prescriptionsListItem.rxRfRecords.map(record => ({
          ...record,
          cmopDivisionPhone: null,
          dialCmopDivisionPhone: null,
        }))
      : [],
  };

  const setup = (
    prescription = cleanPrescription,
    initialState = {},
    page = pageType.LIST,
    isMedicationsImprovementsEnabled = false,
    additionalProps = {},
  ) => {
    const featureToggleReducer = (state = {}) => state;
    const testReducers = {
      ...reducers,
      featureToggles: featureToggleReducer,
    };

    const state = {
      ...initialState,
      featureToggles: {
        ...(initialState.featureToggles || {}),
      },
    };

    return renderWithStoreAndRouterV6(
      <UnfilledOhMessage
        prescription={prescription}
        page={page}
        isMedicationsImprovementsEnabled={isMedicationsImprovementsEnabled}
        {...additionalProps}
      />,
      {
        initialState: state,
        reducers: testReducers,
      },
    );
  };

  describe('when mhvMedicationsManagementImprovements flag is disabled', () => {
    it('shows legacy messaging for active unfilled prescription', async () => {
      const screen = setup(cleanPrescription, {}, pageType.LIST, false);
      const message = await screen.findByTestId('active-unfilled-oh');
      expect(message.textContent).to.include(
        'You can’t refill this prescription online right now.',
      );
    });

    it('shows legacy messaging with pharmacy phone when available', async () => {
      const rx = { ...cleanPrescription, cmopDivisionPhone: '(509) 434-7000' };
      const screen = setup(rx, {}, pageType.LIST, false);
      const message = await screen.findByTestId('active-unfilled-oh');
      expect(message.textContent).to.include(
        'If you need a refill, call your VA pharmacy',
      );
    });

    it('shows legacy messaging without phone when not available', async () => {
      const rx = { ...cleanPrescription, cmopDivisionPhone: null };
      const screen = setup(rx, {}, pageType.LIST, false);
      const message = await screen.findByTestId('active-unfilled-oh');
      expect(message.textContent).to.include(
        'To refill now, call your VA pharmacy’s automated refill line.',
      );
      expect(message.textContent).to.include('prescription label');
    });
  });

  describe('when mhvMedicationsManagementImprovements flag is enabled', () => {
    it('shows updated messaging for active unfilled prescription', async () => {
      const screen = setup(cleanPrescription, {}, pageType.LIST, true);
      const message = await screen.findByTestId('active-unfilled-oh');
      expect(message.textContent).to.include(
        'We haven’t filled this prescription yet. Details may change.',
      );
    });

    it('shows updated messaging with pharmacy phone when available on list page', async () => {
      const rx = { ...cleanPrescription, cmopDivisionPhone: '(509) 434-7000' };
      const screen = setup(rx, {}, pageType.LIST, true);
      const message = await screen.findByTestId('active-unfilled-oh');
      expect(message.textContent).to.include(
        'If you need this medication now, call your VA pharmacy',
      );
      // CallPharmacyPhone component should render with testid
      expect(await screen.findByTestId('pharmacy-phone-number')).to.exist;
    });

    it('shows updated messaging with phone descriptor on details page', async () => {
      const rx = { ...cleanPrescription, cmopDivisionPhone: '(509) 434-7000' };
      const screen = setup(rx, {}, pageType.DETAILS, true);
      const message = await screen.findByTestId('active-unfilled-oh');
      expect(message.textContent).to.include(
        'If you need this medication now, call your VA pharmacy at the phone number listed below.',
      );
      // CallPharmacyPhone should NOT render on details page
      expect(screen.queryByTestId('pharmacy-phone-number')).to.not.exist;
    });

    it('shows updated messaging without phone when not available', async () => {
      const rx = { ...cleanPrescription, cmopDivisionPhone: null };
      const screen = setup(rx, {}, pageType.LIST, true);
      const message = await screen.findByTestId('active-unfilled-oh');
      expect(message.textContent).to.include('call your VA pharmacy');
      expect(message.textContent).to.include('automated refill line');
      expect(message.textContent).to.include('medication details page');
    });
  });

  describe('testId customization', () => {
    it('uses default testId when not provided', async () => {
      const screen = setup(cleanPrescription, {}, pageType.LIST, true);
      expect(await screen.findByTestId('active-unfilled-oh')).to.exist;
    });

    it('uses custom testId when provided', () => {
      const screen = setup(cleanPrescription, {}, pageType.LIST, true, {
        testId: 'custom-test-id',
      });
      expect(screen.getByTestId('custom-test-id')).to.exist;
    });
  });

  describe('showPhoneInline prop', () => {
    it('shows phone inline when showPhoneInline is true and page is LIST', async () => {
      const rx = { ...cleanPrescription, cmopDivisionPhone: '(509) 434-7000' };
      const screen = setup(rx, {}, pageType.LIST, true, {
        showPhoneInline: true,
      });
      const message = await screen.findByTestId('active-unfilled-oh');
      // CallPharmacyPhone component renders
      expect(message.textContent).to.include('call your VA pharmacy');
      expect(await screen.findByTestId('pharmacy-phone-number')).to.exist;
    });

    it('does not show phone inline when showPhoneInline is false', async () => {
      const rx = { ...cleanPrescription, cmopDivisionPhone: '(509) 434-7000' };
      const screen = setup(rx, {}, pageType.LIST, true, {
        showPhoneInline: false,
      });
      const message = await screen.findByTestId('active-unfilled-oh');
      expect(message.textContent).to.include(
        'If you need this medication now, call your VA pharmacy at the phone number listed below.',
      );
      expect(screen.queryByTestId('pharmacy-phone-number')).to.not.exist;
    });

    it('does not show phone inline when page is not LIST even if showPhoneInline is true', async () => {
      const rx = { ...cleanPrescription, cmopDivisionPhone: '(509) 434-7000' };
      const screen = setup(rx, {}, pageType.DETAILS, true, {
        showPhoneInline: true,
      });
      const message = await screen.findByTestId('active-unfilled-oh');
      expect(message.textContent).to.include(
        'If you need this medication now, call your VA pharmacy at the phone number listed below.',
      );
      expect(screen.queryByTestId('pharmacy-phone-number')).to.not.exist;
    });
  });

  describe('no-print class', () => {
    it('renders with no-print CSS class', async () => {
      const screen = setup(cleanPrescription, {}, pageType.LIST, true);
      const message = await screen.findByTestId('active-unfilled-oh');
      expect(message.classList.contains('no-print')).to.be.true;
    });
  });
});
