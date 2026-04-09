import React from 'react';
import { render, cleanup, waitFor } from '@testing-library/react';
import { expect } from 'chai';
import sinon from 'sinon';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as useOhMigrationAlertMetricModule from 'platform/mhv/hooks/useOhMigrationAlertMetric';
import * as tooltipActions from '../../../actions/tooltip';
import ContactListMigrationAlert from '../../../components/shared/ContactListMigrationAlert';

const mockStore = configureStore([thunk]);

describe('ContactListMigrationAlert component', () => {
  let sandbox;
  let getTooltipByNameStub;
  let updateTooltipVisibilityStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    getTooltipByNameStub = sandbox
      .stub(tooltipActions, 'getTooltipByName')
      .returns(async () => ({ id: '123', hidden: false }));
    sandbox
      .stub(tooltipActions, 'createNewTooltip')
      .returns(async () => ({ id: '123', hidden: false }));
    sandbox.stub(tooltipActions, 'incrementTooltip').returns(async () => {});
    updateTooltipVisibilityStub = sandbox
      .stub(tooltipActions, 'updateTooltipVisibility')
      .returns(async () => {});
  });

  afterEach(() => {
    sandbox.restore();
    cleanup();
  });

  const store = mockStore({
    user: { profile: { facilities: [{ facilityId: '553' }] } },
    sm: { tooltip: {} },
  });

  const baseMigrationSchedule = {
    migrationDate: 'February 13, 2026',
    facilities: [
      { facilityId: '553', facilityName: 'VA Detroit Healthcare System' },
      { facilityId: '655', facilityName: 'VA Saginaw Healthcare System' },
    ],
    migrationStatus: 'ACTIVE',
    phases: {
      current: 'p6',
      p0: 'December 15, 2025 at 12:00AM ET',
      p1: 'December 30, 2025 at 12:00AM ET',
      p2: 'January 14, 2026 at 12:00AM ET',
      p3: 'February 7, 2026 at 12:00AM ET',
      p4: 'February 10, 2026 at 12:00AM ET',
      p5: 'February 13, 2026 at 12:00AM ET',
      p6: 'February 15, 2026 at 12:00AM ET',
      p7: 'February 20, 2026 at 12:00AM ET',
      p8: 'March 15, 2026 at 12:00AM ET',
      p9: 'March 30, 2026 at 12:00AM ET',
    },
  };

  const defaultProps = {
    userFacilityMigratingToOh: true,
    migrationSchedules: [baseMigrationSchedule],
  };

  const setup = (props = {}) => {
    return render(
      <Provider store={store}>
        <ContactListMigrationAlert {...defaultProps} {...props} />
      </Provider>,
    );
  };

  describe('POST_MIGRATION variant (phase p6)', () => {
    it('renders the alert when a facility is in phase p6', async () => {
      const screen = setup();

      await waitFor(() => {
        expect(screen.getByTestId('contact-list-migration-alert')).to.exist;
        expect(screen.getByText('We updated your contact list')).to.exist;
      });
    });

    it('displays migrating facility names', async () => {
      const screen = setup();

      await waitFor(() => {
        expect(screen.getByText('VA Detroit Healthcare System')).to.exist;
        expect(screen.getByText('VA Saginaw Healthcare System')).to.exist;
      });
    });

    it('displays the correct body text', async () => {
      const screen = setup();

      await waitFor(() => {
        expect(
          screen.getByText(
            'We removed care teams from these facilities from your contact list:',
          ),
        ).to.exist;
        expect(
          screen.getByText((_, el) => {
            return (
              el.tagName === 'P' &&
              el.textContent.includes(
                'You can still send messages to care teams at these facilities.',
              )
            );
          }),
        ).to.exist;
      });
    });

    it('is closeable', async () => {
      const screen = setup();

      await waitFor(() => {
        expect(screen.getByTestId('contact-list-migration-alert')).to.exist;
      });

      const alert = screen.getByTestId('contact-list-migration-alert');
      alert.__events.closeEvent();

      await waitFor(() => {
        expect(updateTooltipVisibilityStub.called).to.be.true;
      });
    });
  });

  describe('alert visibility conditions', () => {
    it('does not render when alert has been persistently dismissed', async () => {
      // Return a previously dismissed tooltip (hidden: true) — local state
      // will be set to visible: false, keeping the alert hidden.
      getTooltipByNameStub.returns(async () => ({ id: '123', hidden: true }));

      const dismissedStore = mockStore({
        user: { profile: { facilities: [{ facilityId: '553' }] } },
        sm: { tooltip: {} },
      });

      const { queryByTestId } = render(
        <Provider store={dismissedStore}>
          <ContactListMigrationAlert {...defaultProps} />
        </Provider>,
      );

      await waitFor(() => {
        expect(queryByTestId('contact-list-migration-alert')).to.not.exist;
      });
    });

    it('renders the alert when facility is in phase p7', async () => {
      const scheduleP7 = {
        ...baseMigrationSchedule,
        phases: { ...baseMigrationSchedule.phases, current: 'p7' },
      };
      const screen = setup({ migrationSchedules: [scheduleP7] });

      await waitFor(() => {
        expect(screen.getByTestId('contact-list-migration-alert')).to.exist;
        expect(screen.getByText('We updated your contact list')).to.exist;
      });
    });

    it('renders the alert when facility is in phase p8', async () => {
      const scheduleP8 = {
        ...baseMigrationSchedule,
        phases: { ...baseMigrationSchedule.phases, current: 'p8' },
      };
      const screen = setup({ migrationSchedules: [scheduleP8] });

      await waitFor(() => {
        expect(screen.getByTestId('contact-list-migration-alert')).to.exist;
        expect(screen.getByText('We updated your contact list')).to.exist;
      });
    });

    it('does not render when facility is in phase p9', async () => {
      const scheduleP9 = {
        ...baseMigrationSchedule,
        phases: { ...baseMigrationSchedule.phases, current: 'p9' },
      };
      const screen = setup({ migrationSchedules: [scheduleP9] });

      expect(screen.queryByTestId('contact-list-migration-alert')).to.not.exist;
    });

    it('does not render when migrationSchedules is empty', async () => {
      const screen = setup({ migrationSchedules: [] });

      expect(screen.queryByTestId('contact-list-migration-alert')).to.not.exist;
    });

    it('does not render when migrationSchedules is undefined', async () => {
      const screen = setup({ migrationSchedules: undefined });

      expect(screen.queryByTestId('contact-list-migration-alert')).to.not.exist;
    });

    it('does not render when userFacilityMigratingToOh is false', async () => {
      const screen = setup({ userFacilityMigratingToOh: false });

      expect(screen.queryByTestId('contact-list-migration-alert')).to.not.exist;
    });

    it('renders facilities from all matching-phase schedules when multiple schedules have mixed phases', async () => {
      const scheduleP7 = {
        ...baseMigrationSchedule,
        facilities: [
          { facilityId: '506', facilityName: 'VA Ann Arbor Healthcare System' },
        ],
        phases: { ...baseMigrationSchedule.phases, current: 'p7' },
      };
      const scheduleP6 = {
        ...baseMigrationSchedule,
        facilities: [
          { facilityId: '553', facilityName: 'VA Detroit Healthcare System' },
        ],
        phases: { ...baseMigrationSchedule.phases, current: 'p6' },
      };
      const scheduleP9 = {
        ...baseMigrationSchedule,
        facilities: [
          {
            facilityId: '612',
            facilityName: 'VA Northern Indiana Healthcare System',
          },
        ],
        phases: { ...baseMigrationSchedule.phases, current: 'p9' },
      };
      const screen = setup({
        migrationSchedules: [scheduleP7, scheduleP6, scheduleP9],
      });

      await waitFor(() => {
        expect(screen.getByTestId('contact-list-migration-alert')).to.exist;
        expect(screen.getByText('VA Detroit Healthcare System')).to.exist;
        expect(screen.getByText('VA Ann Arbor Healthcare System')).to.exist;
        expect(screen.queryByText('VA Northern Indiana Healthcare System')).to
          .not.exist;
      });
    });
  });

  describe('P1_TO_P5_MIGRATION variant', () => {
    const scheduleP3 = {
      ...baseMigrationSchedule,
      phases: { ...baseMigrationSchedule.phases, current: 'p3' },
    };

    it('renders the P1_TO_P5 headline when facility is in phase p3', async () => {
      const screen = setup({ migrationSchedules: [scheduleP3] });

      await waitFor(() => {
        expect(screen.getByTestId('contact-list-migration-alert')).to.exist;
        expect(screen.getByText("We're making changes to your contact list")).to
          .exist;
      });
    });

    it('renders the P1_TO_P5 headline when facility is in phase p1', async () => {
      const scheduleP1 = {
        ...baseMigrationSchedule,
        phases: { ...baseMigrationSchedule.phases, current: 'p1' },
      };
      const screen = setup({ migrationSchedules: [scheduleP1] });

      await waitFor(() => {
        expect(screen.getByTestId('contact-list-migration-alert')).to.exist;
        expect(screen.getByText("We're making changes to your contact list")).to
          .exist;
      });
    });

    it('displays the correct body text with computed dates', async () => {
      const screen = setup({ migrationSchedules: [scheduleP3] });

      await waitFor(() => {
        expect(
          screen.getByText(
            /remove care teams from these facilities from your contact list/i,
          ),
        ).to.exist;
        expect(screen.getByText(/you can still send messages to care teams/i))
          .to.exist;
      });
    });
  });

  describe('useOhMigrationAlertMetric integration', () => {
    let metricSpy;
    let metricSandbox;

    beforeEach(() => {
      metricSpy = sinon.spy();
      metricSandbox = sinon.createSandbox();
      metricSandbox
        .stub(useOhMigrationAlertMetricModule, 'default')
        .callsFake(metricSpy);
    });

    afterEach(() => {
      metricSandbox.restore();
    });

    it('calls useOhMigrationAlertMetric with isVisible true when alert renders', async () => {
      setup();

      await waitFor(() => {
        const call = metricSpy
          .getCalls()
          .find(
            c =>
              c.args[0].alertName === 'ContactListMigrationAlert' &&
              c.args[0].isVisible === true,
          );
        expect(call).to.exist;
      });
    });

    it('calls useOhMigrationAlertMetric with matched phases', () => {
      setup();

      const call = metricSpy
        .getCalls()
        .find(c => c.args[0].alertName === 'ContactListMigrationAlert');
      expect(call.args[0].currentPhase).to.deep.equal(['p6', 'p7', 'p8']);
    });

    it('calls useOhMigrationAlertMetric with isVisible false when alert does not render', () => {
      setup({ userFacilityMigratingToOh: false });

      const call = metricSpy
        .getCalls()
        .find(c => c.args[0].alertName === 'ContactListMigrationAlert');
      expect(call).to.exist;
      expect(call.args[0].isVisible).to.be.false;
    });
  });
});
