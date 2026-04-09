import React from 'react';
import { render, cleanup, waitFor } from '@testing-library/react';
import { expect } from 'chai';
import sinon from 'sinon';
import * as useOhMigrationAlertMetricModule from 'platform/mhv/hooks/useOhMigrationAlertMetric';
import SmMigratingFacilitiesAlerts from '../../../components/shared/SmMigratingFacilitiesAlerts';
import { Alerts } from '../../../util/constants';

describe('SmMigratingFacilitiesAlerts component', () => {
  let metricStub;

  const baseMigrationSchedule = {
    migrationDate: '2026-02-13',
    facilities: [{ facilityId: '983', facilityName: 'Test VA Medical Center' }],
    phases: {
      current: 'p3',
      p0: '2025-12-15',
      p1: '2025-12-30',
      p2: '2026-01-14',
      p3: '2026-02-07',
      p4: '2026-02-10',
      p5: '2026-02-13',
      p6: '2026-02-15',
      p7: '2026-02-20',
    },
  };

  const setup = (props = {}) => {
    const defaultProps = {
      migratingFacilities: [baseMigrationSchedule],
      className: 'test-class',
      stationNumber: '983',
      ...props,
    };
    return render(<SmMigratingFacilitiesAlerts {...defaultProps} />);
  };

  beforeEach(() => {
    // Mock useOhMigrationAlertMetric hook globally
    metricStub = sinon.stub(useOhMigrationAlertMetricModule, 'default');
  });

  afterEach(() => {
    metricStub.restore();
    cleanup();
  });

  describe('Error Phase Alerts (p3, p4, p5)', () => {
    it('renders error alert when current phase is p3', async () => {
      const screen = setup();

      await waitFor(() => {
        const alert = screen.container.querySelector('va-alert');
        expect(alert).to.exist;
        expect(alert.getAttribute('status')).to.equal('error');
        expect(alert.getAttribute('data-testid')).to.equal(
          'cerner-facilities-transition-alert-error-phase',
        );
      });
    });

    it('displays the correct error headline', async () => {
      const screen = setup();

      await waitFor(() => {
        const headline = screen.getByText(
          Alerts.Message.MIGRATING_FACILITIES_ERROR_HEADLINE,
        );
        expect(headline).to.exist;
        expect(headline.tagName).to.equal('H2');
      });
    });

    it('displays the error message and facility names', async () => {
      const screen = setup();

      await waitFor(() => {
        expect(
          screen.getByText(Alerts.Message.MIGRATING_FACILITIES_ERROR_MESSAGE),
        ).to.exist;
        expect(screen.getByText('Test VA Medical Center')).to.exist;
      });
    });

    it('displays multiple facilities in error phase', async () => {
      const multiSchedule = {
        ...baseMigrationSchedule,
        facilities: [
          { facilityId: '983', facilityName: 'Test VA Medical Center' },
          { facilityId: '984', facilityName: 'Another VA Medical Center' },
        ],
      };
      const screen = setup({ migratingFacilities: [multiSchedule] });

      await waitFor(() => {
        expect(screen.getByText('Test VA Medical Center')).to.exist;
        expect(screen.getByText('Another VA Medical Center')).to.exist;
      });
    });

    it('displays the subnote with migration date plus 2 days', async () => {
      const screen = setup();

      await waitFor(() => {
        // Migration date is 2026-02-13, plus 2 days (date calculation may vary by timezone)
        const expectedText = screen.getByText((content, element) => {
          return (
            element.tagName === 'P' &&
            (content.includes('After February 15, 2026') ||
              content.includes('After February 14, 2026'))
          );
        });
        expect(expectedText).to.exist;
      });
    });

    it('displays the error note with facility contact information', async () => {
      const screen = setup();

      await waitFor(() => {
        expect(screen.getByText(Alerts.Message.MIGRATING_FACILITIES_ERROR_NOTE))
          .to.exist;
        const link = screen.container.querySelector('va-link');
        expect(link).to.exist;
        expect(link.getAttribute('href')).to.equal(
          'https://www.va.gov/find-locations/',
        );
        expect(link.getAttribute('text')).to.equal(
          "Find your facility's contact information",
        );
      });
    });

    it('renders error alert when current phase is p4', async () => {
      const scheduleP4 = {
        ...baseMigrationSchedule,
        phases: { ...baseMigrationSchedule.phases, current: 'p4' },
      };
      const screen = setup({ migratingFacilities: [scheduleP4] });

      await waitFor(() => {
        const alert = screen.container.querySelector('va-alert');
        expect(alert).to.exist;
        expect(alert.getAttribute('status')).to.equal('error');
      });
    });

    it('renders error alert when current phase is p5', async () => {
      const scheduleP5 = {
        ...baseMigrationSchedule,
        phases: { ...baseMigrationSchedule.phases, current: 'p5' },
      };
      const screen = setup({ migratingFacilities: [scheduleP5] });

      await waitFor(() => {
        const alert = screen.container.querySelector('va-alert');
        expect(alert).to.exist;
        expect(alert.getAttribute('status')).to.equal('error');
      });
    });

    it('applies background-only attribute to error alert', async () => {
      const screen = setup();

      await waitFor(() => {
        const alert = screen.container.querySelector('va-alert');
        expect(alert.hasAttribute('background-only')).to.be.true;
      });
    });

    it('applies correct CSS classes to error alert', async () => {
      const screen = setup();

      await waitFor(() => {
        const alert = screen.container.querySelector('va-alert');
        expect(alert.getAttribute('class')).to.include(
          'vads-u-margin-bottom--2p5',
        );
        expect(alert.getAttribute('class')).to.include('test-class');
        expect(alert.getAttribute('class')).to.include('vads-u-margin-top--2');
      });
    });
  });

  describe('Warning Phase Alerts (p1, p2)', () => {
    it('renders warning alert when current phase is p1', async () => {
      const scheduleP1 = {
        ...baseMigrationSchedule,
        phases: { ...baseMigrationSchedule.phases, current: 'p1' },
      };
      const screen = setup({ migratingFacilities: [scheduleP1] });

      await waitFor(() => {
        const alert = screen.container.querySelector('va-alert-expandable');
        expect(alert).to.exist;
        expect(alert.getAttribute('status')).to.equal('warning');
      });
    });

    it('renders warning alert when current phase is p2', async () => {
      const scheduleP2 = {
        ...baseMigrationSchedule,
        phases: { ...baseMigrationSchedule.phases, current: 'p2' },
      };
      const screen = setup({ migratingFacilities: [scheduleP2] });

      await waitFor(() => {
        const alert = screen.container.querySelector('va-alert-expandable');
        expect(alert).to.exist;
        expect(alert.getAttribute('status')).to.equal('warning');
      });
    });

    it('displays warning trigger text with start date', async () => {
      const scheduleP1 = {
        ...baseMigrationSchedule,
        phases: { ...baseMigrationSchedule.phases, current: 'p1' },
      };
      const screen = setup({ migratingFacilities: [scheduleP1] });

      await waitFor(() => {
        const alert = screen.container.querySelector('va-alert-expandable');
        expect(alert.getAttribute('trigger')).to.include(
          'Updates will begin on',
        );
        expect(alert.getAttribute('trigger')).to.include('2026-02-07');
      });
    });

    it('displays warning message with date range and single facility text', async () => {
      const scheduleP1 = {
        ...baseMigrationSchedule,
        phases: { ...baseMigrationSchedule.phases, current: 'p1' },
      };
      const screen = setup({ migratingFacilities: [scheduleP1] });

      await waitFor(() => {
        const allText = screen.container.textContent;
        expect(allText).to.include('be able to send or receive new messages');
        expect(allText).to.include('this facility');
      });
    });

    it('displays "these facilities" when multiple facilities exist', async () => {
      const multiSchedule = {
        ...baseMigrationSchedule,
        facilities: [
          { facilityId: '983', facilityName: 'Test VA Medical Center' },
          { facilityId: '984', facilityName: 'Another VA Medical Center' },
        ],
        phases: { ...baseMigrationSchedule.phases, current: 'p1' },
      };
      const screen = setup({ migratingFacilities: [multiSchedule] });

      await waitFor(() => {
        const allText = screen.container.textContent;
        expect(allText).to.include('be able to send or receive new messages');
        expect(allText).to.include('these facilities');
      });
    });

    it('lists facility names in warning alert', async () => {
      const scheduleP1 = {
        ...baseMigrationSchedule,
        phases: { ...baseMigrationSchedule.phases, current: 'p1' },
      };
      const screen = setup({ migratingFacilities: [scheduleP1] });

      await waitFor(() => {
        expect(screen.getByText('Test VA Medical Center')).to.exist;
      });
    });

    it('displays warning note with correct facility text', async () => {
      const scheduleP1 = {
        ...baseMigrationSchedule,
        phases: { ...baseMigrationSchedule.phases, current: 'p1' },
      };
      const screen = setup({ migratingFacilities: [scheduleP1] });

      await waitFor(() => {
        // Check for Note: text
        const allText = screen.container.textContent;
        expect(allText).to.include('Note:');
        expect(allText).to.include('During this time, you can still call');
      });
    });
  });

  describe('Alert Visibility Conditions', () => {
    it('does not render when current phase is not in warning or error arrays', async () => {
      const scheduleP0 = {
        ...baseMigrationSchedule,
        phases: { ...baseMigrationSchedule.phases, current: 'p0' },
      };
      const screen = setup({ migratingFacilities: [scheduleP0] });

      expect(screen.container.querySelector('va-alert')).to.not.exist;
      expect(screen.container.querySelector('va-alert-expandable')).to.not
        .exist;
    });

    it('does not render when current phase is p6', async () => {
      const scheduleP6 = {
        ...baseMigrationSchedule,
        phases: { ...baseMigrationSchedule.phases, current: 'p6' },
      };
      const screen = setup({ migratingFacilities: [scheduleP6] });

      expect(screen.container.querySelector('va-alert')).to.not.exist;
      expect(screen.container.querySelector('va-alert-expandable')).to.not
        .exist;
    });

    it('does not render when current phase is p7', async () => {
      const scheduleP7 = {
        ...baseMigrationSchedule,
        phases: { ...baseMigrationSchedule.phases, current: 'p7' },
      };
      const screen = setup({ migratingFacilities: [scheduleP7] });

      expect(screen.container.querySelector('va-alert')).to.not.exist;
      expect(screen.container.querySelector('va-alert-expandable')).to.not
        .exist;
    });

    it('does not render when migratingFacilities is empty array', () => {
      const screen = setup({ migratingFacilities: [] });

      expect(screen.container.querySelector('va-alert')).to.not.exist;
      expect(screen.container.querySelector('va-alert-expandable')).to.not
        .exist;
    });

    it('returns null when all migrations have non-alertable phases', async () => {
      const scheduleP6 = {
        ...baseMigrationSchedule,
        phases: { ...baseMigrationSchedule.phases, current: 'p6' },
      };
      const scheduleP7 = {
        ...baseMigrationSchedule,
        phases: { ...baseMigrationSchedule.phases, current: 'p7' },
      };
      const screen = setup({
        migratingFacilities: [scheduleP6, scheduleP7],
      });

      expect(screen.container.querySelector('va-alert')).to.not.exist;
      expect(screen.container.querySelector('va-alert-expandable')).to.not
        .exist;
    });
  });

  describe('Multiple Migration Schedules', () => {
    it('renders multiple alerts for different phase types', async () => {
      const scheduleP1 = {
        ...baseMigrationSchedule,
        facilities: [{ facilityId: '983', facilityName: 'Facility A' }],
        phases: { ...baseMigrationSchedule.phases, current: 'p1' },
      };
      const scheduleP3 = {
        ...baseMigrationSchedule,
        migrationDate: '2026-03-13',
        facilities: [{ facilityId: '984', facilityName: 'Facility B' }],
        phases: { ...baseMigrationSchedule.phases, current: 'p3' },
      };
      const screen = setup({
        migratingFacilities: [scheduleP1, scheduleP3],
      });

      await waitFor(() => {
        const errorAlert = screen.container.querySelector('va-alert');
        const warningAlert = screen.container.querySelector(
          'va-alert-expandable',
        );
        expect(errorAlert).to.exist;
        expect(warningAlert).to.exist;
        expect(screen.getByText('Facility A')).to.exist;
        expect(screen.getByText('Facility B')).to.exist;
      });
    });

    it('filters out null alerts from non-alertable phases', async () => {
      const scheduleP1 = {
        ...baseMigrationSchedule,
        phases: { ...baseMigrationSchedule.phases, current: 'p1' },
      };
      const scheduleP6 = {
        ...baseMigrationSchedule,
        phases: { ...baseMigrationSchedule.phases, current: 'p6' },
      };
      const screen = setup({
        migratingFacilities: [scheduleP1, scheduleP6],
      });

      await waitFor(() => {
        // Only one alert should be rendered (p1)
        const alerts = screen.container.querySelectorAll('va-alert-expandable');
        expect(alerts.length).to.equal(1);
      });
    });
  });

  describe('CSS Classes', () => {
    it('applies custom className prop', async () => {
      const screen = setup({ className: 'custom-class' });

      await waitFor(() => {
        const alert = screen.container.querySelector('va-alert');
        expect(alert.getAttribute('class')).to.include('custom-class');
      });
    });

    it('applies margin-top class when migratingFacilities has items', async () => {
      const screen = setup();

      await waitFor(() => {
        const alert = screen.container.querySelector('va-alert');
        expect(alert.getAttribute('class')).to.include('vads-u-margin-top--2');
      });
    });

    it('does not apply margin-top class when migratingFacilities is empty', () => {
      const screen = setup({ migratingFacilities: [] });

      // Component should not render any alerts
      expect(screen.container.querySelector('va-alert')).to.not.exist;
    });
  });

  describe('useOhMigrationAlertMetric integration', () => {
    let metricSpy;

    beforeEach(() => {
      metricSpy = sinon.spy();
      metricStub.callsFake(metricSpy);
    });

    afterEach(() => {
      metricStub.resetBehavior();
    });

    it('calls useOhMigrationAlertMetric for error alert with correct params', async () => {
      setup();

      await waitFor(() => {
        const call = metricSpy
          .getCalls()
          .find(
            c => c.args[0].alertName === 'SmMigratingFacilitiesAlerts-error',
          );
        expect(call).to.exist;
        expect(call.args[0].isVisible).to.be.true;
        expect(call.args[0].currentPhase).to.equal('p3');
        expect(call.args[0].stationNumber).to.equal('983');
      });
    });

    it('calls useOhMigrationAlertMetric for warning alert with correct params', async () => {
      const scheduleP1 = {
        ...baseMigrationSchedule,
        phases: { ...baseMigrationSchedule.phases, current: 'p1' },
      };
      setup({ migratingFacilities: [scheduleP1] });

      await waitFor(() => {
        const call = metricSpy
          .getCalls()
          .find(
            c => c.args[0].alertName === 'SmMigratingFacilitiesAlerts-warning',
          );
        expect(call).to.exist;
        expect(call.args[0].isVisible).to.be.true;
        expect(call.args[0].currentPhase).to.equal('p1');
        expect(call.args[0].stationNumber).to.equal('983');
      });
    });

    it('calls useOhMigrationAlertMetric for each alert when multiple schedules render', async () => {
      const scheduleP1 = {
        ...baseMigrationSchedule,
        phases: { ...baseMigrationSchedule.phases, current: 'p1' },
      };
      const scheduleP3 = {
        ...baseMigrationSchedule,
        phases: { ...baseMigrationSchedule.phases, current: 'p3' },
      };
      setup({ migratingFacilities: [scheduleP1, scheduleP3] });

      await waitFor(() => {
        const warningCall = metricSpy
          .getCalls()
          .find(
            c => c.args[0].alertName === 'SmMigratingFacilitiesAlerts-warning',
          );
        const errorCall = metricSpy
          .getCalls()
          .find(
            c => c.args[0].alertName === 'SmMigratingFacilitiesAlerts-error',
          );

        expect(warningCall).to.exist;
        expect(errorCall).to.exist;
        expect(warningCall.args[0].isVisible).to.be.true;
        expect(errorCall.args[0].isVisible).to.be.true;
      });
    });

    it('does not call useOhMigrationAlertMetric when no alerts render', () => {
      setup({ migratingFacilities: [] });

      // No calls should be made to the metric hook
      const calls = metricSpy
        .getCalls()
        .filter(
          c =>
            c.args[0] &&
            (c.args[0].alertName === 'SmMigratingFacilitiesAlerts-error' ||
              c.args[0].alertName === 'SmMigratingFacilitiesAlerts-warning'),
        );
      expect(calls.length).to.equal(0);
    });

    it('calls useOhMigrationAlertMetric with undefined stationNumber when not provided', async () => {
      setup({ stationNumber: undefined });

      await waitFor(() => {
        const call = metricSpy
          .getCalls()
          .find(
            c => c.args[0].alertName === 'SmMigratingFacilitiesAlerts-error',
          );
        expect(call).to.exist;
        expect(call.args[0].isVisible).to.be.true;
        expect(call.args[0].currentPhase).to.equal('p3');
        expect(call.args[0].stationNumber).to.be.undefined;
      });
    });
  });

  describe('Data Attribute Tests', () => {
    it('sets correct data-testid on error alert', async () => {
      const screen = setup();

      await waitFor(() => {
        const alert = screen.getByTestId(
          'cerner-facilities-transition-alert-error-phase',
        );
        expect(alert).to.exist;
      });
    });

    it('sets correct data-testid on warning alert', async () => {
      const scheduleP1 = {
        ...baseMigrationSchedule,
        phases: { ...baseMigrationSchedule.phases, current: 'p1' },
      };
      const screen = setup({ migratingFacilities: [scheduleP1] });

      await waitFor(() => {
        const alert = screen.getByTestId('cerner-facilities-transition-alert');
        expect(alert).to.exist;
      });
    });

    it('sets data-testid on find-facility-link', async () => {
      const screen = setup();

      await waitFor(() => {
        const link = screen.container.querySelector(
          '[data-testid="find-facility-link"]',
        );
        expect(link).to.exist;
      });
    });
  });
});
