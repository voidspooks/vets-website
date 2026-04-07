import { mockApiRequest } from '@department-of-veterans-affairs/platform-testing/helpers';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { expect } from 'chai';
import { Actions } from '../../util/actionTypes';
import {
  getCareTeamChanges,
  findCareTeamChangeMessage,
} from '../../actions/careTeamChanges';

describe('careTeamChanges actions', () => {
  const middlewares = [thunk];
  const mockStore = configureMockStore(middlewares);

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
    ],
  };

  it('should dispatch GET and GET_SUCCESS on getCareTeamChanges success', async () => {
    const store = mockStore();
    mockApiRequest(mockCrosswalkResponse);
    await store.dispatch(getCareTeamChanges());
    const actions = store.getActions();
    expect(actions[0]).to.deep.equal({
      type: Actions.CareTeamChanges.GET,
    });
    expect(actions[1]).to.deep.equal({
      type: Actions.CareTeamChanges.GET_SUCCESS,
      response: mockCrosswalkResponse.data.map(entry => entry.attributes),
    });
  });

  it('should dispatch GET and GET_ERROR on getCareTeamChanges error', async () => {
    const store = mockStore();
    mockApiRequest({}, false);
    await store.dispatch(getCareTeamChanges());
    const actions = store.getActions();
    expect(actions[0]).to.deep.equal({
      type: Actions.CareTeamChanges.GET,
    });
    expect(actions[1].type).to.equal(Actions.CareTeamChanges.GET_ERROR);
    expect(actions[1].error).to.exist;
  });

  it('should handle empty data array in response', async () => {
    const store = mockStore();
    mockApiRequest({ data: [] });
    await store.dispatch(getCareTeamChanges());
    const actions = store.getActions();
    expect(actions[1]).to.deep.equal({
      type: Actions.CareTeamChanges.GET_SUCCESS,
      response: [],
    });
  });
});

describe('findCareTeamChangeMessage action', () => {
  const middlewares = [thunk];
  const mockStore = configureMockStore(middlewares);

  it('should dispatch SET_MESSAGE_ID with messageId when message found', async () => {
    const store = mockStore();
    mockApiRequest({
      data: [
        {
          attributes: {
            messageId: 12345,
            subject: 'Your new care team names',
          },
        },
      ],
    });
    await store.dispatch(findCareTeamChangeMessage());
    const actions = store.getActions();
    expect(actions[0]).to.deep.equal({
      type: Actions.CareTeamChanges.SET_MESSAGE_ID,
      payload: 12345,
    });
  });

  it('should dispatch SET_MESSAGE_ID with null when no matching message', async () => {
    const store = mockStore();
    mockApiRequest({
      data: [
        {
          attributes: {
            messageId: 99999,
            subject: 'Unrelated message subject',
          },
        },
      ],
    });
    await store.dispatch(findCareTeamChangeMessage());
    const actions = store.getActions();
    expect(actions[0]).to.deep.equal({
      type: Actions.CareTeamChanges.SET_MESSAGE_ID,
      payload: null,
    });
  });

  it('should return null when search fails', async () => {
    const store = mockStore();
    mockApiRequest({}, false);
    const result = await store.dispatch(findCareTeamChangeMessage());
    expect(result).to.be.null;
    expect(store.getActions()).to.have.lengthOf(0);
  });
});
