import React from 'react';
import { renderWithStoreAndRouter } from '@department-of-veterans-affairs/platform-testing/react-testing-library-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import { waitFor } from '@testing-library/react';
import * as useOhMigrationAlertMetricModule from 'platform/mhv/hooks/useOhMigrationAlertMetric';
import reducer from '../../../reducers';
import messageResponse from '../../fixtures/message-response.json';
import MigratedMessageAlert from '../../../components/shared/MigratedMessageAlert';
import { Paths } from '../../../util/constants';

describe('MigratedMessageAlert', () => {
  const defaultMessage = {
    ...messageResponse,
    threadId: 12345,
    category: 'APPOINTMENTS',
    subject: 'Test Subject',
    sentDate: new Date().toISOString(),
    recipientId: 7107671,
    isOhMessage: false,
  };

  const defaultState = {
    sm: {
      threadDetails: {
        messages: [defaultMessage],
        ohMigrationPhase: null,
      },
    },
    user: {
      profile: {
        migrationSchedules: [],
      },
    },
    featureToggles: {},
  };

  const migratedState = {
    ...defaultState,
    sm: {
      ...defaultState.sm,
      threadDetails: {
        ...defaultState.sm.threadDetails,
        messages: [{ ...defaultMessage, migratedToOracleHealth: true }],
      },
    },
  };

  const setup = (state = defaultState) => {
    return renderWithStoreAndRouter(<MigratedMessageAlert />, {
      initialState: state,
      reducers: reducer,
    });
  };

  it('renders MigratedMessageAlert when at least one message has migratedToOracleHealth', async () => {
    const screen = setup(migratedState);
    await waitFor(() => {
      expect(screen.queryByTestId('migrated-message-alert')).to.exist;
    });
  });

  it('does not render MigratedMessageAlert when no messages have migratedToOracleHealth', async () => {
    const nonMigratedMessage = {
      ...defaultMessage,
      migratedToOracleHealth: false,
    };
    const state = {
      ...defaultState,
      sm: {
        ...defaultState.sm,
        threadDetails: {
          ...defaultState.sm.threadDetails,
          messages: [nonMigratedMessage],
        },
      },
    };
    const screen = setup(state);
    await waitFor(() => {
      expect(screen.queryByTestId('migrated-message-alert')).to.not.exist;
    });
  });

  it('renders the Start a new message link with compose URL', async () => {
    const screen = setup(migratedState);
    const expectedHref = `${Paths.ROOT_URL}${Paths.COMPOSE}`;
    await waitFor(() => {
      const link = screen.container.querySelector(
        `va-link-action[href="${expectedHref}"]`,
      );
      expect(link).to.exist;
      expect(link.getAttribute('text')).to.equal('Start a new message');
    });
  });

  describe('useOhMigrationAlertMetric integration', () => {
    let metricSpy;
    let metricStub;

    beforeEach(() => {
      metricSpy = sinon.spy();
      metricStub = sinon
        .stub(useOhMigrationAlertMetricModule, 'default')
        .callsFake(metricSpy);
    });

    afterEach(() => {
      metricStub.restore();
    });

    it('calls useOhMigrationAlertMetric with isVisible true and message data when migrated', () => {
      const migratedMessage = {
        ...defaultMessage,
        migratedToOracleHealth: true,
        triageGroup: { stationNumber: '442' },
        ohMigrationPhase: 'p6',
      };
      const state = {
        ...defaultState,
        sm: {
          ...defaultState.sm,
          threadDetails: {
            ...defaultState.sm.threadDetails,
            messages: [migratedMessage],
          },
        },
      };
      setup(state);

      const call = metricSpy
        .getCalls()
        .find(c => c.args[0].alertName === 'PostMigrationMessageAlert-OH');
      expect(call).to.exist;
      expect(call.args[0].isVisible).to.be.true;
      expect(call.args[0].stationNumber).to.equal('442');
      expect(call.args[0].currentPhase).to.equal('p6');
    });

    it('calls useOhMigrationAlertMetric with isVisible false when not migrated', () => {
      const nonMigratedMessage = {
        ...defaultMessage,
        migratedToOracleHealth: false,
        triageGroup: { stationNumber: '442' },
        ohMigrationPhase: 'p6',
      };
      const state = {
        ...defaultState,
        sm: {
          ...defaultState.sm,
          threadDetails: {
            ...defaultState.sm.threadDetails,
            messages: [nonMigratedMessage],
          },
        },
      };
      setup(state);

      const call = metricSpy
        .getCalls()
        .find(c => c.args[0].alertName === 'PostMigrationMessageAlert-OH');
      expect(call).to.exist;
      expect(call.args[0].isVisible).to.be.false;
    });

    it('passes stationNumber and currentPhase from the first message', () => {
      const message1 = {
        ...defaultMessage,
        migratedToOracleHealth: true,
        triageGroup: { stationNumber: '983' },
        ohMigrationPhase: 'p5',
      };
      const message2 = {
        ...defaultMessage,
        messageId: 99999,
        migratedToOracleHealth: false,
        triageGroup: { stationNumber: '984' },
        ohMigrationPhase: 'p3',
      };
      const state = {
        ...defaultState,
        sm: {
          ...defaultState.sm,
          threadDetails: {
            ...defaultState.sm.threadDetails,
            messages: [message1, message2],
          },
        },
      };
      setup(state);

      const call = metricSpy
        .getCalls()
        .find(c => c.args[0].alertName === 'PostMigrationMessageAlert-OH');
      expect(call.args[0].stationNumber).to.equal('983');
      expect(call.args[0].currentPhase).to.equal('p5');
    });
  });

  describe('crosswalk name mapping', () => {
    it('displays old and new team names when crosswalk match exists', async () => {
      const state = {
        ...migratedState,
        sm: {
          ...migratedState.sm,
          careTeamChanges: {
            changes: [
              {
                vistaTriageGroupId: 7107671,
                vistaTriageGroupName: 'SM668 PRIMARY CARE BLUE',
                ohTriageGroupId: 6238822,
                ohTriageGroupName: 'VHA SPO ALS - Clinical',
              },
            ],
            isLoading: false,
            error: null,
          },
        },
      };
      const screen = setup(state);
      await waitFor(() => {
        expect(screen.queryByTestId('migrated-message-alert')).to.exist;
        expect(screen.getByText('SM668 PRIMARY CARE BLUE', { exact: false })).to
          .exist;
        expect(screen.getByText('VHA SPO ALS - Clinical', { exact: false })).to
          .exist;
      });
    });

    it('does not display team names when no crosswalk match exists', async () => {
      const state = {
        ...migratedState,
        sm: {
          ...migratedState.sm,
          careTeamChanges: {
            changes: [
              {
                vistaTriageGroupId: 9999999,
                vistaTriageGroupName: 'SOME OTHER TEAM',
                ohTriageGroupId: 8888888,
                ohTriageGroupName: 'VHA OTHER - Clinical',
              },
            ],
            isLoading: false,
            error: null,
          },
        },
      };
      const screen = setup(state);
      await waitFor(() => {
        expect(screen.queryByTestId('migrated-message-alert')).to.exist;
      });
      expect(screen.queryByText('SOME OTHER TEAM')).to.not.exist;
    });

    it('does not display team names when crosswalk changes is empty', async () => {
      const state = {
        ...migratedState,
        sm: {
          ...migratedState.sm,
          careTeamChanges: {
            changes: [],
            isLoading: false,
            error: null,
          },
        },
      };
      const screen = setup(state);
      await waitFor(() => {
        expect(screen.queryByTestId('migrated-message-alert')).to.exist;
      });
      expect(screen.queryByText('SM668 PRIMARY CARE BLUE')).to.not.exist;
      expect(screen.queryByText('VHA SPO ALS - Clinical')).to.not.exist;
    });
  });
});
