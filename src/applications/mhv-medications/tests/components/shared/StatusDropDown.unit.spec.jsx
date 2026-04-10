import { expect } from 'chai';
import React from 'react';
import { renderWithStoreAndRouter } from '@department-of-veterans-affairs/platform-testing/react-testing-library-helpers';
import FEATURE_FLAG_NAMES from 'platform/utilities/feature-toggles/featureFlagNames';
import StatusDropdown from '../../../components/shared/StatusDropdown';
import { dispStatusObj } from '../../../util/constants';
import reducer from '../../../reducers';

describe('component that displays Status', () => {
  const renderStatus = (
    status,
    isCernerPilot = false,
    isV2StatusMapping = false,
  ) => {
    const initialState = {
      featureToggles: {
        [FEATURE_FLAG_NAMES.mhvMedicationsCernerPilot]: isCernerPilot,
        [FEATURE_FLAG_NAMES.mhvMedicationsV2StatusMapping]: isV2StatusMapping,
      },
    };

    return renderWithStoreAndRouter(<StatusDropdown status={status} />, {
      initialState,
      reducers: reducer,
    });
  };

  describe('when cernerPilot flag is disabled', () => {
    it('renders without errors', () => {
      const screen = renderStatus();
      expect(screen);
    });

    it('displays "Unknown" as status when there is no status being passed', () => {
      const screen = renderStatus();
      const unknownStatus = screen.getAllByText('Unknown');
      expect(unknownStatus).to.exist;
    });

    it('displays "Active: Parked" when status is passed as activeParked', () => {
      const screen = renderStatus('Active: Parked');
      const unknownStatus = screen.getAllByText('Active: Parked');
      expect(unknownStatus).to.exist;
    });

    it('displays correct "Active: Parked" description when drop down is clicked on', async () => {
      const screen = renderStatus('Active: Parked');
      const statusDescription = screen.getAllByText(
        'Your VA provider prescribed this medication or supply to you. But we won’t send any shipments until you request to fill or refill it.',
      );
      expect(statusDescription).to.exist;
    });

    it('displays all correctly formatted status', () => {
      Object.values(dispStatusObj).map(formattedStatus => {
        const screen = renderStatus(formattedStatus);
        expect(screen.getAllByText(formattedStatus, { exact: false })).to.exist;
        return null;
      });
    });
  });

  describe('when cernerPilot flag is enabled', () => {
    it('renders without errors with cernerPilot enabled', () => {
      const screen = renderStatus(undefined, true, false);
      expect(screen);
    });

    it('displays "Unknown" status when cernerPilot is enabled but v2StatusMapping is disabled', () => {
      const screen = renderStatus(undefined, true, false);
      // Still V1 behavior - requires BOTH flags
      const unknownStatus = screen.getAllByText('Unknown');
      expect(unknownStatus).to.exist;
    });

    it('displays "Status not available" only when BOTH CernerPilot and V2StatusMapping flags are enabled', () => {
      const screen = renderStatus(undefined, true, true);
      const unknownStatus = screen.getAllByText('Status not available');
      expect(unknownStatus).to.exist;
    });
  });

  describe('V2 status display when both CernerPilot and V2StatusMapping flags enabled', () => {
    it('renders Active correctly', () => {
      const screen = renderStatus('Active', true, true);
      expect(screen.getAllByText('Active')).to.exist;
    });

    it('renders In progress correctly', () => {
      const screen = renderStatus('In progress', true, true);
      expect(screen.getAllByText('In progress')).to.exist;
    });

    it('renders Inactive correctly', () => {
      const screen = renderStatus('Inactive', true, true);
      expect(screen.getAllByText('Inactive')).to.exist;
    });

    it('renders Transferred correctly', () => {
      const screen = renderStatus('Transferred', true, true);
      expect(screen.getAllByText('Transferred')).to.exist;
    });

    it('renders Status not available correctly', () => {
      const screen = renderStatus('Status not available', true, true);
      expect(screen.getAllByText('Status not available')).to.exist;
    });
  });

  describe('V1 status display when both CernerPilot and V2StatusMapping flags are disabled', () => {
    it('renders Active: Refill in Process', () => {
      const screen = renderStatus('Active: Refill in Process', false, false);
      expect(screen.getAllByText('Active: Refill in Process', { exact: false }))
        .to.exist;
    });

    it('renders Active: Parked', () => {
      const screen = renderStatus('Active: Parked', false, false);
      expect(screen.getAllByText('Active: Parked', { exact: false })).to.exist;
    });

    it('renders Active: Submitted', () => {
      const screen = renderStatus('Active: Submitted', false, false);
      expect(screen.getAllByText('Active: Submitted', { exact: false })).to
        .exist;
    });

    it('renders Active: On Hold', () => {
      const screen = renderStatus('Active: On Hold', false, false);
      expect(screen.getAllByText('Active: On Hold', { exact: false })).to.exist;
    });

    it('renders Expired', () => {
      const screen = renderStatus('Expired', false, false);
      expect(screen.getAllByText('Expired', { exact: false })).to.exist;
    });

    it('renders Discontinued', () => {
      const screen = renderStatus('Discontinued', false, false);
      expect(screen.getAllByText('Discontinued', { exact: false })).to.exist;
    });

    it('renders Transferred', () => {
      const screen = renderStatus('Transferred', false, false);
      expect(screen.getAllByText('Transferred', { exact: false })).to.exist;
    });

    it('renders Active: Non-VA', () => {
      const screen = renderStatus('Active: Non-VA', false, false);
      expect(screen.getAllByText('Active: Non-VA', { exact: false })).to.exist;
    });
  });

  describe('component rendering with both cernerPilot and V2StatusMapping flags disabled', () => {
    it('renders Active: Parked status correctly', () => {
      const screen = renderStatus('Active: Parked', false, false);
      expect(screen.getAllByText('Active: Parked')).to.exist;
    });
  });

  describe('component rendering with both cernerPilot and V2StatusMapping flags enabled', () => {
    it('renders Active status correctly', () => {
      const screen = renderStatus('Active', true, true);
      expect(screen.getAllByText('Active')).to.exist;
    });
  });

  describe('Shipped status handling', () => {
    it('handles Shipped status when both cernerPilot and V2StatusMapping flags disabled', () => {
      const screen = renderStatus('Shipped', false, false);
      expect(screen).to.exist;
      const statusElement =
        screen.container.querySelector('[data-testid="status-dropdown"]') ||
        screen.container.querySelector(
          '[trigger="What does this status mean?"]',
        );
      expect(statusElement).to.exist;
    });

    it('handles Shipped status when both cernerPilot and V2StatusMapping flags enabled', () => {
      const screen = renderStatus('Shipped', true, true);
      expect(screen).to.exist;
      const statusElement =
        screen.container.querySelector('[data-testid="status-dropdown"]') ||
        screen.container.querySelector(
          '[trigger="What does this status mean?"]',
        );
      expect(statusElement).to.exist;
    });
  });

  describe('Pending medication statuses', () => {
    it('displays NewOrder status correctly when both flags disabled', () => {
      const screen = renderStatus('NewOrder', false, false);
      expect(screen).to.exist;
    });

    it('displays NewOrder status correctly when both cernerPilot and V2StatusMapping flags enabled', () => {
      const screen = renderStatus('NewOrder', true, true);
      expect(screen).to.exist;
    });

    it('displays Renew status correctly when both cernerPilot and V2StatusMapping flags disabled', () => {
      const screen = renderStatus('Renew', false, false);
      expect(screen).to.exist;
    });

    it('displays Renew status correctly when both cernerPilot and V2StatusMapping flags enabled', () => {
      const screen = renderStatus('Renew', true, true);
      expect(screen).to.exist;
    });
  });

  describe('Status definition content validation', () => {
    it('V1 Active: Parked has correct definition text when BOTH CernerPilot and V2StatusMapping flags disabled', () => {
      const screen = renderStatus('Active: Parked', false, false);
      expect(screen.getByText(/Your VA provider prescribed this medication/)).to
        .exist;
    });

    it('V2 Active has correct definition text when BOTH CernerPilot and V2StatusMapping flags enabled', () => {
      const screen = renderStatus('Active', true, true);
      const definition = screen.getByTestId('active-status-definition');
      expect(definition.textContent).to.include(
        'A prescription you can fill at a local VA pharmacy',
      );
    });

    it('V2 In progress has correct definition text when BOTH CernerPilot and V2StatusMapping flags enabled', () => {
      const screen = renderStatus('In progress', true, true);
      const definition = screen.getByTestId('inprogress-status-definition');
      expect(definition.textContent).to.include(
        'A new prescription or a prescription you’ve requested',
      );
    });

    it('V2 Inactive has correct definition text when BOTH CernerPilot and V2StatusMapping flags enabled', () => {
      const screen = renderStatus('Inactive', true, true);
      const definition = screen.getByTestId('inactive-status-definition');
      expect(definition.textContent).to.include(
        'A prescription you can no longer fill',
      );
    });

    it('V2 Transferred has correct definition text when BOTH CernerPilot and V2StatusMapping flags enabled', () => {
      const screen = renderStatus('Transferred', true, true);
      const definition = screen.getByTestId('transferred-status-definition');
      expect(definition.textContent).to.include(
        'VA’s new electronic health record',
      );
    });

    it('V2 Status not available has correct definition text when BOTH CernerPilot and V2StatusMapping flags enabled', () => {
      const screen = renderStatus('Status not available', true, true);
      const definition = screen.getByTestId('unknown-status-definition');
      expect(definition.textContent).to.include(
        'There’s a problem with our system',
      );
    });
  });
  describe('Unfilled Oracle Health prescriptions', () => {
    const renderWithPrescription = (prescription, flags = {}) => {
      const initialState = {
        featureToggles: {
          [FEATURE_FLAG_NAMES.mhvMedicationsCernerPilot]:
            flags.cernerPilot || false,
          [FEATURE_FLAG_NAMES.mhvMedicationsV2StatusMapping]:
            flags.v2StatusMapping || false,
          [FEATURE_FLAG_NAMES.mhvMedicationsManagementImprovements]:
            flags.mhvMedicationsManagementImprovements || false,
        },
        drupalStaticData: {
          vamcEhrData: {
            data: {
              cernerFacilities: [
                { vhaId: '668', vamcFacilityName: 'Spokane VA Medical Center' },
              ],
            },
          },
        },
      };

      return renderWithStoreAndRouter(
        <StatusDropdown status="Active" prescription={prescription} />,
        { initialState, reducers: reducer },
      );
    };

    it('shows UnfilledOhMessage for unfilled OH prescription', () => {
      const prescription = {
        prescriptionId: 99999999,
        dispStatus: 'Active',
        dispensedDate: null,
        sourceEhr: 'OH',
        rxRfRecords: [],
        cmopDivisionPhone: '5551234567',
      };

      const screen = renderWithPrescription(prescription, {
        mhvMedicationsManagementImprovements: true,
      });
      const message = screen.getByTestId('active-unfilled-oh');

      expect(message).to.exist;
      expect(message.textContent).to.include('filled this prescription yet');
    });

    it('shows "phone number listed below" text (no inline phone)', () => {
      const prescription = {
        dispStatus: 'Active',
        dispensedDate: null,
        sourceEhr: 'OH',
        rxRfRecords: [],
        cmopDivisionPhone: '5551234567',
      };

      const screen = renderWithPrescription(prescription);
      const message = screen.getByTestId('active-unfilled-oh');

      expect(message.textContent).to.include('phone number listed below');
    });

    it('shows standard definition for dispensed OH prescription', () => {
      const prescription = {
        dispStatus: 'Active',
        dispensedDate: '2026-03-15T04:00:00.000Z',
        sourceEhr: 'OH',
        rxRfRecords: [],
      };

      const screen = renderWithPrescription(prescription);

      expect(screen.queryByTestId('active-unfilled-oh')).to.not.exist;
      expect(screen.getByText(/This is a current prescription/)).to.exist;
    });

    it('shows automated refill line message when no phone', () => {
      const prescription = {
        dispStatus: 'Active',
        dispensedDate: null,
        sourceEhr: 'OH',
        rxRfRecords: [],
        cmopDivisionPhone: null,
      };

      const screen = renderWithPrescription(prescription);
      const message = screen.getByTestId('active-unfilled-oh');

      expect(message.textContent).to.include('automated refill line');
      // Note: StatusDropdown doesn't pass page prop, so "medication details page" text won't show
      expect(message.textContent).to.not.include('medication details page');
      expect(message.textContent).to.include('prescription label');
    });

    describe('when mhvMedicationsManagementImprovements flag is enabled', () => {
      it('shows updated S3 messaging when phone is available', () => {
        const prescription = {
          prescriptionId: 99999999,
          dispStatus: 'Active',
          dispensedDate: null,
          sourceEhr: 'OH',
          rxRfRecords: [],
          cmopDivisionPhone: '5551234567',
        };

        const screen = renderWithPrescription(prescription, {
          mhvMedicationsManagementImprovements: true,
        });
        const message = screen.getByTestId('active-unfilled-oh');

        expect(message).to.exist;
        expect(message.textContent).to.match(
          /filled this prescription yet\. Details may change\./,
        );
        expect(message.textContent).to.include(
          'If you need this medication now, call your VA pharmacy at the phone number listed below.',
        );
      });

      it('shows updated S3 automated refill line messaging when no phone', () => {
        const prescription = {
          dispStatus: 'Active',
          dispensedDate: null,
          sourceEhr: 'OH',
          rxRfRecords: [],
          cmopDivisionPhone: null,
        };

        const screen = renderWithPrescription(prescription, {
          mhvMedicationsManagementImprovements: true,
        });
        const message = screen.getByTestId('active-unfilled-oh');

        expect(message.textContent).to.include('automated refill line');
        expect(message.textContent).to.include('medication details page');
      });
    });

    it('does not show facility finder link (showLinks=false)', () => {
      const prescription = {
        dispStatus: 'Active',
        dispensedDate: null,
        sourceEhr: 'OH',
        rxRfRecords: [],
        cmopDivisionPhone: null,
      };

      const screen = renderWithPrescription(prescription);

      expect(screen.queryByText('Find your VA facility')).to.not.exist;
    });
  });

  describe('when mhvMedicationsManagementImprovements flag is enabled', () => {
    const initialState = {
      featureToggles: {
        [FEATURE_FLAG_NAMES.mhvMedicationsManagementImprovements]: true,
      },
    };

    it('shows updated submitted status definition', () => {
      const screen = renderWithStoreAndRouter(
        <StatusDropdown status="Active: Submitted" />,
        { initialState, reducers: reducer },
      );
      const definition = screen.getByTestId('submitted-status-definition');

      expect(definition).to.exist;
      expect(definition.textContent).to.include(
        'You submitted a fill or refill request.',
      );
      expect(definition.textContent).to.include('reviewing your request');
      expect(screen.queryByText(/Check back for updates/)).to.not.exist;
    });

    describe('Initial fill in progress', () => {
      const renderWithPrescription = prescription => {
        const s5InitialState = {
          featureToggles: {
            [FEATURE_FLAG_NAMES.mhvMedicationsCernerPilot]: false,
            [FEATURE_FLAG_NAMES.mhvMedicationsV2StatusMapping]: false,
            [FEATURE_FLAG_NAMES.mhvMedicationsManagementImprovements]: true,
          },
          drupalStaticData: {
            vamcEhrData: {
              data: {
                cernerFacilities: [],
              },
            },
          },
        };

        return renderWithStoreAndRouter(
          <StatusDropdown
            status={prescription?.dispStatus || 'Active'}
            prescription={prescription}
          />,
          { initialState: s5InitialState, reducers: reducer },
        );
      };

      it('shows "Active: Fill in process" when rxRfRecords is empty', () => {
        const prescription = {
          prescriptionId: 99999999,
          dispStatus: 'Active: Refill in Process',
          rxRfRecords: [],
        };

        const screen = renderWithPrescription(prescription);

        expect(screen.getByText('Active: Fill in process')).to.exist;
      });

      it('shows "Active: Refill in process" when rxRfRecords has items', () => {
        const prescription = {
          prescriptionId: 99999999,
          dispStatus: 'Active: Refill in Process',
          rxRfRecords: [{ dispensedDate: '2025-10-03T04:00:00.000Z' }],
        };

        const screen = renderWithPrescription(prescription);

        expect(screen.getByText('Active: Refill in process')).to.exist;
      });
    });
  });

  describe('when mhvMedicationsManagementImprovements flag is disabled', () => {
    const initialState = {
      featureToggles: {
        [FEATURE_FLAG_NAMES.mhvMedicationsManagementImprovements]: false,
      },
    };

    it('shows original submitted status definition', () => {
      const screen = renderWithStoreAndRouter(
        <StatusDropdown status="Active: Submitted" />,
        { initialState, reducers: reducer },
      );
      const definition = screen.getByTestId('submitted-status-definition');

      expect(definition).to.exist;
      expect(definition.textContent).to.include(
        'We got your request to fill or refill this prescription',
      );
      expect(screen.getByText(/Check back for updates/)).to.exist;
    });

    describe('Initial fill in progress', () => {
      const renderWithPrescription = prescription => {
        const s5InitialState = {
          featureToggles: {
            [FEATURE_FLAG_NAMES.mhvMedicationsCernerPilot]: false,
            [FEATURE_FLAG_NAMES.mhvMedicationsV2StatusMapping]: false,
            [FEATURE_FLAG_NAMES.mhvMedicationsManagementImprovements]: false,
          },
          drupalStaticData: {
            vamcEhrData: {
              data: {
                cernerFacilities: [],
              },
            },
          },
        };

        return renderWithStoreAndRouter(
          <StatusDropdown
            status={prescription?.dispStatus || 'Active'}
            prescription={prescription}
          />,
          { initialState: s5InitialState, reducers: reducer },
        );
      };

      it('shows "Active: Refill in process" even with empty rxRfRecords', () => {
        const prescription = {
          prescriptionId: 99999999,
          dispStatus: 'Active: Refill in Process',
          rxRfRecords: [],
        };

        const screen = renderWithPrescription(prescription);

        expect(screen.getByText('Active: Refill in process')).to.exist;
      });
    });
  });
});
