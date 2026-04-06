import { mockApiRequest } from '@department-of-veterans-affairs/platform-testing/helpers';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { expect } from 'chai';
import { getCareTeamChanges } from '../../actions/careTeamChanges';
import { careTeamChangesReducer } from '../../reducers/careTeamChanges';

describe('careTeamChanges reducer', () => {
  const mockStore = initialState => {
    return createStore(
      careTeamChangesReducer,
      initialState,
      applyMiddleware(thunk),
    );
  };

  const mockCrosswalkResponse = {
    data: [
      {
        id: '6723554',
        type: 'ehr_crosswalk_entries',
        attributes: {
          vistaTriageGroupId: 6723554,
          vistaTriageGroupName: 'SM668 PRIMARY CARE BLUE',
          ohTriageGroupId: 6238822,
          ohTriageGroupName: 'VHA SPO ALS - Clinical',
        },
      },
      {
        id: '6723555',
        type: 'ehr_crosswalk_entries',
        attributes: {
          vistaTriageGroupId: 6723555,
          vistaTriageGroupName: 'SM668 CARDIOLOGY GREEN',
          ohTriageGroupId: 6238823,
          ohTriageGroupName: 'VHA SPO Cardiology - Clinical',
        },
      },
    ],
  };

  it('should dispatch action on getCareTeamChanges success', async () => {
    const store = mockStore();
    mockApiRequest(mockCrosswalkResponse);
    await store.dispatch(getCareTeamChanges());
    const state = store.getState();
    expect(state.isLoading).to.be.false;
    expect(state.error).to.be.null;
    expect(state.changes).to.deep.equal(
      mockCrosswalkResponse.data.map(entry => entry.attributes),
    );
  });

  it('should dispatch action on getCareTeamChanges error', async () => {
    const store = mockStore();
    mockApiRequest({}, false);
    await store.dispatch(getCareTeamChanges());
    const state = store.getState();
    expect(state.isLoading).to.be.false;
    expect(state.error).to.not.be.null;
    expect(state.changes).to.deep.equal([]);
  });

  it('should return initial state for unknown action', () => {
    const store = mockStore();
    store.dispatch({ type: 'UNKNOWN_ACTION' });
    expect(store.getState()).to.deep.equal({
      changes: [],
      isLoading: false,
      error: null,
    });
  });
});
