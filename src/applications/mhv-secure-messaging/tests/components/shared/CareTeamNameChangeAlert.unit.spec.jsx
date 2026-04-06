import React from 'react';
import { renderWithStoreAndRouter } from '@department-of-veterans-affairs/platform-testing/react-testing-library-helpers';
import { expect } from 'chai';
import { cleanup, waitFor } from '@testing-library/react';
import sinon from 'sinon';
import reducer from '../../../reducers';
import CareTeamNameChangeAlert from '../../../components/shared/CareTeamNameChangeAlert';
import * as SmApi from '../../../api/SmApi';
import { Alerts } from '../../../util/constants';

describe('CareTeamNameChangeAlert', () => {
  let sandbox;

  const mockChanges = [
    {
      vistaTriageGroupId: 6723554,
      vistaTriageGroupName: 'SM668 PRIMARY CARE BLUE',
      ohTriageGroupId: 6238822,
      ohTriageGroupName: 'VHA SPO ALS - Clinical',
    },
    {
      vistaTriageGroupId: 6723555,
      vistaTriageGroupName: 'SM668 CARDIOLOGY GREEN',
      ohTriageGroupId: 6238823,
      ohTriageGroupName: 'VHA SPO Cardiology - Clinical',
    },
  ];

  // Mock Sent folder response — raw message data before any allowedRecipients filtering
  const mockSentMessages = {
    data: [
      { attributes: { recipientId: 6723554 } },
      { attributes: { recipientId: 6723555 } },
    ],
  };

  const baseState = {
    sm: {
      careTeamChanges: {
        changes: mockChanges,
        isLoading: false,
        error: null,
      },
      alerts: {
        alertVisible: false,
        alertList: [],
      },
    },
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
    cleanup();
  });

  const renderComponent = (
    state = baseState,
    sentResponse = mockSentMessages,
  ) => {
    sandbox.stub(SmApi, 'searchFolderAdvanced').resolves(sentResponse);
    sandbox.stub(SmApi, 'getTooltipsList').resolves([
      {
        id: 'mock-tooltip-id',
        tooltipName: 'sm_care_team_name_change',
        hidden: false,
        counter: 1,
      },
    ]);
    sandbox.stub(SmApi, 'createTooltip').resolves({});
    sandbox.stub(SmApi, 'hideTooltip').resolves({});

    return renderWithStoreAndRouter(<CareTeamNameChangeAlert />, {
      initialState: state,
      reducers: reducer,
      path: '/',
    });
  };

  it('renders the alert when changes exist and tooltip is visible', async () => {
    const { container } = renderComponent();

    await waitFor(() => {
      const alert = container.querySelector('va-alert');
      expect(alert).to.exist;
      expect(alert.getAttribute('status')).to.equal('warning');
      expect(alert.hasAttribute('closeable')).to.be.true;
    });
  });

  it('displays the correct headline', async () => {
    const { container } = renderComponent();

    await waitFor(() => {
      const alert = container.querySelector('va-alert');
      const headline = alert.querySelector('h2[slot="headline"]');
      expect(headline.textContent).to.equal(
        Alerts.Message.CARE_TEAM_CHANGE_HEADLINE(2),
      );
    });
  });

  it('displays the intro text with correct count', async () => {
    const { container } = renderComponent();

    await waitFor(() => {
      const alert = container.querySelector('va-alert');
      expect(alert.textContent).to.include(
        Alerts.Message.CARE_TEAM_CHANGE_INTRO(2),
      );
    });
  });

  it('renders a list item for each change', async () => {
    const { container } = renderComponent();

    await waitFor(() => {
      const listItems = container.querySelectorAll('va-alert li');
      expect(listItems).to.have.lengthOf(2);
      expect(listItems[0].textContent).to.include(
        'SM668 PRIMARY CARE BLUE is now VHA SPO ALS - Clinical',
      );
      expect(listItems[1].textContent).to.include(
        'SM668 CARDIOLOGY GREEN is now VHA SPO Cardiology - Clinical',
      );
    });
  });

  it('displays the footer text with bold message title', async () => {
    const { container } = renderComponent();

    await waitFor(() => {
      const alert = container.querySelector('va-alert');
      expect(alert.textContent).to.include(
        Alerts.Message.CARE_TEAM_CHANGE_FOOTER_PREFIX,
      );
      expect(alert.textContent).to.include(
        Alerts.Message.CARE_TEAM_CHANGE_FOOTER_MESSAGE_TITLE,
      );
      const strong = alert.querySelector('strong');
      expect(strong).to.exist;
      expect(strong.textContent).to.equal(
        Alerts.Message.CARE_TEAM_CHANGE_FOOTER_MESSAGE_TITLE,
      );
    });
  });

  it('does not render when changes array is empty', () => {
    const emptyState = {
      ...baseState,
      sm: {
        ...baseState.sm,
        careTeamChanges: {
          ...baseState.sm.careTeamChanges,
          changes: [],
        },
      },
    };

    sandbox.stub(SmApi, 'searchFolderAdvanced').resolves({ data: [] });
    sandbox.stub(SmApi, 'getTooltipsList').resolves([]);

    const { container } = renderWithStoreAndRouter(
      <CareTeamNameChangeAlert />,
      {
        initialState: emptyState,
        reducers: reducer,
        path: '/',
      },
    );

    const alert = container.querySelector('va-alert');
    expect(alert).to.not.exist;
  });

  it('does not render when isLoading is true', () => {
    const loadingState = {
      ...baseState,
      sm: {
        ...baseState.sm,
        careTeamChanges: {
          ...baseState.sm.careTeamChanges,
          isLoading: true,
        },
      },
    };

    sandbox.stub(SmApi, 'searchFolderAdvanced').resolves(mockSentMessages);
    sandbox.stub(SmApi, 'getTooltipsList').resolves([]);

    const { container } = renderWithStoreAndRouter(
      <CareTeamNameChangeAlert />,
      {
        initialState: loadingState,
        reducers: reducer,
        path: '/',
      },
    );

    const alert = container.querySelector('va-alert');
    expect(alert).to.not.exist;
  });

  it('does not render when an active error alert is present', async () => {
    const errorAlertState = {
      ...baseState,
      sm: {
        ...baseState.sm,
        alerts: {
          alertVisible: true,
          alertList: [
            {
              datestamp: '2024-01-01T00:00:00.000Z',
              isActive: true,
              alertType: 'error',
              header: 'Error',
              content: 'Something went wrong',
            },
          ],
        },
      },
    };

    sandbox.stub(SmApi, 'searchFolderAdvanced').resolves(mockSentMessages);
    sandbox.stub(SmApi, 'getTooltipsList').resolves([
      {
        id: 'mock-tooltip-id',
        tooltipName: 'sm_care_team_name_change',
        hidden: false,
        counter: 1,
      },
    ]);

    const { container } = renderWithStoreAndRouter(
      <CareTeamNameChangeAlert />,
      {
        initialState: errorAlertState,
        reducers: reducer,
        path: '/',
      },
    );

    await waitFor(() => {
      const alert = container.querySelector(
        '[data-testid="care-team-name-change-alert"]',
      );
      expect(alert).to.not.exist;
    });
  });

  it('calls hideTooltip API when close event fires', async () => {
    const { container } = renderComponent();

    await waitFor(() => {
      expect(container.querySelector('va-alert')).to.exist;
    });

    const alert = container.querySelector('va-alert');
    alert.dispatchEvent(new CustomEvent('closeEvent', { bubbles: true }));

    await waitFor(() => {
      expect(SmApi.hideTooltip.calledOnce).to.be.true;
    });
  });

  it('creates a new tooltip when none exists', async () => {
    sandbox.stub(SmApi, 'searchFolderAdvanced').resolves(mockSentMessages);
    const createStub = sandbox.stub(SmApi, 'createTooltip').resolves({
      id: 'new-tooltip-id',
      tooltipName: 'sm_care_team_name_change',
      hidden: false,
      counter: 1,
    });
    sandbox.stub(SmApi, 'getTooltipsList').resolves([]);

    renderWithStoreAndRouter(<CareTeamNameChangeAlert />, {
      initialState: baseState,
      reducers: reducer,
      path: '/',
    });

    await waitFor(() => {
      expect(createStub.calledOnce).to.be.true;
    });
  });

  it('shows alert when tooltip API errors', async () => {
    sandbox.stub(SmApi, 'searchFolderAdvanced').resolves(mockSentMessages);
    sandbox.stub(SmApi, 'getTooltipsList').rejects(new Error('API error'));

    const { container } = renderWithStoreAndRouter(
      <CareTeamNameChangeAlert />,
      {
        initialState: baseState,
        reducers: reducer,
        path: '/',
      },
    );

    await waitFor(() => {
      const alert = container.querySelector('va-alert');
      expect(alert).to.exist;
    });
  });

  it('falls back to crosswalk entries when sent folder search returns no messages', async () => {
    const { container } = renderComponent(baseState, { data: [] });

    await waitFor(() => {
      const listItems = container.querySelectorAll('va-alert li');
      expect(listItems).to.have.lengthOf(2);
      expect(listItems[0].textContent).to.include(
        'SM668 PRIMARY CARE BLUE is now VHA SPO ALS - Clinical',
      );
    });
  });

  it('does not render when sent folder search fails', async () => {
    sandbox.stub(SmApi, 'searchFolderAdvanced').rejects(new Error('API error'));
    sandbox.stub(SmApi, 'getTooltipsList').resolves([]);
    sandbox.stub(SmApi, 'createTooltip').resolves({});
    sandbox.stub(SmApi, 'hideTooltip').resolves({});

    const { container } = renderWithStoreAndRouter(
      <CareTeamNameChangeAlert />,
      {
        initialState: baseState,
        reducers: reducer,
        path: '/',
      },
    );

    // Wait for searchFolderAdvanced to reject and set recentSentIds to []
    await waitFor(() => {
      expect(SmApi.searchFolderAdvanced.calledOnce).to.be.true;
    });

    const alert = container.querySelector('va-alert');
    expect(alert).to.not.exist;
  });

  it('only shows crosswalk entries matching sent recipient IDs', async () => {
    const sentWithOneMatch = {
      data: [{ attributes: { recipientId: 6723554 } }],
    };

    const { container } = renderComponent(baseState, sentWithOneMatch);

    await waitFor(() => {
      const listItems = container.querySelectorAll('va-alert li');
      expect(listItems).to.have.lengthOf(1);
      expect(listItems[0].textContent).to.include(
        'SM668 PRIMARY CARE BLUE is now VHA SPO ALS - Clinical',
      );
    });
  });

  it('uses singular headline and intro when only 1 change matches', async () => {
    const sentWithOneMatch = {
      data: [{ attributes: { recipientId: 6723554 } }],
    };

    const { container } = renderComponent(baseState, sentWithOneMatch);

    await waitFor(() => {
      const alert = container.querySelector('va-alert');
      const headline = alert.querySelector('h2[slot="headline"]');
      expect(headline.textContent).to.equal(
        Alerts.Message.CARE_TEAM_CHANGE_HEADLINE(1),
      );
      expect(alert.textContent).to.include(
        Alerts.Message.CARE_TEAM_CHANGE_INTRO(1),
      );
    });
  });

  it('preserves recency order from sent messages', async () => {
    const sentReversed = {
      data: [
        { attributes: { recipientId: 6723555 } },
        { attributes: { recipientId: 6723554 } },
      ],
    };

    const { container } = renderComponent(baseState, sentReversed);

    await waitFor(() => {
      const listItems = container.querySelectorAll('va-alert li');
      expect(listItems).to.have.lengthOf(2);
      expect(listItems[0].textContent).to.include(
        'SM668 CARDIOLOGY GREEN is now VHA SPO Cardiology - Clinical',
      );
      expect(listItems[1].textContent).to.include(
        'SM668 PRIMARY CARE BLUE is now VHA SPO ALS - Clinical',
      );
    });
  });

  it('falls back to crosswalk entries when no sent recipients match', async () => {
    const sentNoMatch = {
      data: [{ attributes: { recipientId: 9999999 } }],
    };

    const { container } = renderComponent(baseState, sentNoMatch);

    await waitFor(() => {
      const listItems = container.querySelectorAll('va-alert li');
      expect(listItems).to.have.lengthOf(2);
      expect(listItems[0].textContent).to.include(
        'SM668 PRIMARY CARE BLUE is now VHA SPO ALS - Clinical',
      );
    });
  });

  it('calls searchFolderAdvanced with Sent folder ID and 6-month date range', async () => {
    renderComponent();

    await waitFor(() => {
      expect(SmApi.searchFolderAdvanced.calledOnce).to.be.true;
      const [folderId, query] = SmApi.searchFolderAdvanced.firstCall.args;
      expect(folderId).to.equal(-1); // DefaultFolders.SENT.id
      expect(query).to.have.property('fromDate');
      expect(query).to.have.property('toDate');
    });
  });

  it('caps filtered results at 4 entries', async () => {
    const fiveChanges = [
      ...mockChanges,
      {
        vistaTriageGroupId: 6723556,
        vistaTriageGroupName: 'SM668 TEAM C',
        ohTriageGroupId: 6238824,
        ohTriageGroupName: 'VHA SPO Team C - Clinical',
      },
      {
        vistaTriageGroupId: 6723557,
        vistaTriageGroupName: 'SM668 TEAM D',
        ohTriageGroupId: 6238825,
        ohTriageGroupName: 'VHA SPO Team D - Clinical',
      },
      {
        vistaTriageGroupId: 6723558,
        vistaTriageGroupName: 'SM668 TEAM E',
        ohTriageGroupId: 6238826,
        ohTriageGroupName: 'VHA SPO Team E - Clinical',
      },
    ];

    const state = {
      ...baseState,
      sm: {
        ...baseState.sm,
        careTeamChanges: {
          ...baseState.sm.careTeamChanges,
          changes: fiveChanges,
        },
      },
    };

    const sentFive = {
      data: [
        { attributes: { recipientId: 6723554 } },
        { attributes: { recipientId: 6723555 } },
        { attributes: { recipientId: 6723556 } },
        { attributes: { recipientId: 6723557 } },
        { attributes: { recipientId: 6723558 } },
      ],
    };

    const { container } = renderComponent(state, sentFive);

    await waitFor(() => {
      const listItems = container.querySelectorAll('va-alert li');
      expect(listItems).to.have.lengthOf(4);
    });
  });
});
