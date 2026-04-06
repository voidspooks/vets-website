import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { expect } from 'chai';
import sinon from 'sinon';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import FEATURE_FLAG_NAMES from '@department-of-veterans-affairs/platform-utilities/featureFlagNames';
import FetchCareTeamChanges from '../../components/FetchCareTeamChanges';
import { Actions } from '../../util/actionTypes';
import * as SmApi from '../../api/SmApi';

const mockStore = configureMockStore([thunk]);

describe('FetchCareTeamChanges', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('dispatches getCareTeamChanges when feature flag is enabled', async () => {
    const apiStub = sandbox.stub(SmApi, 'getCareTeamCrosswalk').resolves({
      data: [
        {
          id: '1',
          type: 'ehr_crosswalk_entries',
          attributes: {
            vistaTriageGroupId: 1,
            vistaTriageGroupName: 'Old Team',
            ohTriageGroupId: 2,
            ohTriageGroupName: 'New Team',
          },
        },
      ],
    });

    const store = mockStore({
      featureToggles: {
        [FEATURE_FLAG_NAMES.mhvSecureMessagingEhrCrosswalk]: true,
      },
    });

    render(
      <Provider store={store}>
        <FetchCareTeamChanges />
      </Provider>,
    );

    await waitFor(() => {
      expect(apiStub.calledOnce).to.be.true;
    });
    const actions = store.getActions();
    expect(actions[0].type).to.equal(Actions.CareTeamChanges.GET);
  });

  it('does not dispatch getCareTeamChanges when feature flag is disabled', () => {
    const apiStub = sandbox
      .stub(SmApi, 'getCareTeamCrosswalk')
      .resolves({ data: [] });

    const store = mockStore({
      featureToggles: {
        [FEATURE_FLAG_NAMES.mhvSecureMessagingEhrCrosswalk]: false,
      },
    });

    render(
      <Provider store={store}>
        <FetchCareTeamChanges />
      </Provider>,
    );

    expect(apiStub.called).to.be.false;
    expect(store.getActions()).to.have.lengthOf(0);
  });
});
