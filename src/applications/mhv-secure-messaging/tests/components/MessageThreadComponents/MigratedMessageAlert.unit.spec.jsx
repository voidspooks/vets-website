import React from 'react';
import { renderWithStoreAndRouter } from '@department-of-veterans-affairs/platform-testing/react-testing-library-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import { waitFor } from '@testing-library/react';
import * as useOhMigrationAlertMetricModule from 'platform/mhv/hooks/useOhMigrationAlertMetric';
import reducer from '../../../reducers';
import messageResponse from '../../fixtures/message-response.json';
import MigratedMessageAlert from '../../../components/shared/MigratedMessageAlert';

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

  const setup = (state = defaultState) => {
    return renderWithStoreAndRouter(<MigratedMessageAlert />, {
      initialState: state,
      reducers: reducer,
    });
  };

  it('renders MigratedMessageAlert when at least one message has migratedToOracleHealth', async () => {
    const migratedMessage = {
      ...defaultMessage,
      migratedToOracleHealth: true,
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
    const screen = setup(state);
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
});
