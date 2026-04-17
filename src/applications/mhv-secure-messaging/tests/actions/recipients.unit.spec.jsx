import { mockApiRequest } from '@department-of-veterans-affairs/platform-testing/helpers';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { expect } from 'chai';
import { Actions } from '../../util/actionTypes';
import {
  getAllTriageTeamRecipients,
  setActiveCareSystem,
  setActiveCareTeam,
  setActiveDraftId,
  resetRecentRecipient,
} from '../../actions/recipients';
import * as allRecipientsTriageTeamsResponse from '../e2e/fixtures/all-recipients-response.json';

describe('triageTeam actions', () => {
  const middlewares = [thunk];
  const mockStore = (initialState = { featureToggles: {} }) =>
    configureStore(middlewares)(initialState);

  it('should dispatch action on getAllTriageTeamRecipients', () => {
    const store = mockStore();
    mockApiRequest(allRecipientsTriageTeamsResponse);
    return store.dispatch(getAllTriageTeamRecipients()).then(() => {
      const actions = store.getActions();
      expect(actions[0].type).to.equal(Actions.AllRecipients.GET_LIST);
      expect(actions[0].response.data).to.have.length.greaterThan(0);
    });
  });
  it('should dispatch action on getAllTriageTeamRecipients error', () => {
    const store = mockStore();
    mockApiRequest({}, false);
    return store.dispatch(getAllTriageTeamRecipients()).then(() => {
      const actions = store.getActions();
      expect(actions[0].type).to.equal(Actions.AllRecipients.GET_LIST_ERROR);
    });
  });

  describe('signatureRequired passthrough from API', () => {
    it('should pass through signatureRequired=true from the API response', async () => {
      const mockResponse = {
        data: [
          {
            id: '1',
            attributes: {
              name: 'Privacy Issue_Admin',
              signatureRequired: true,
            },
          },
        ],
      };

      const store = mockStore();
      mockApiRequest(mockResponse);

      return store.dispatch(getAllTriageTeamRecipients()).then(() => {
        const actions = store.getActions();
        expect(
          actions[0].response.data[0].attributes.signatureRequired,
        ).to.equal(true);
      });
    });

    it('should pass through signatureRequired=false from the API response', async () => {
      const mockResponse = {
        data: [
          {
            id: '1',
            attributes: {
              name: 'Regular Team Name',
              signatureRequired: false,
            },
          },
        ],
      };

      const store = mockStore();
      mockApiRequest(mockResponse);

      return store.dispatch(getAllTriageTeamRecipients()).then(() => {
        const actions = store.getActions();
        expect(
          actions[0].response.data[0].attributes.signatureRequired,
        ).to.equal(false);
      });
    });

    it('should preserve signatureRequired for mixed recipients', async () => {
      const mockResponse = {
        data: [
          {
            id: '1',
            attributes: {
              name: 'Privacy Issues_Admin',
              signatureRequired: true,
            },
          },
          {
            id: '2',
            attributes: {
              name: 'Regular Team',
              signatureRequired: false,
            },
          },
          {
            id: '3',
            attributes: {
              name: 'VHA_456_RELEASE_OF_INFORMATION',
              signatureRequired: true,
            },
          },
        ],
      };

      const store = mockStore();
      mockApiRequest(mockResponse);

      return store.dispatch(getAllTriageTeamRecipients()).then(() => {
        const actions = store.getActions();
        expect(
          actions[0].response.data[0].attributes.signatureRequired,
        ).to.equal(true);
        expect(actions[0].response.data[1].attributes.signatureRequired).to.be
          .false;
        expect(
          actions[0].response.data[2].attributes.signatureRequired,
        ).to.equal(true);
      });
    });

    it('should not crash when signatureRequired is absent from the API response', async () => {
      const mockResponse = {
        data: [
          {
            id: '1',
            attributes: {
              name: 'Some Team',
            },
          },
        ],
      };

      const store = mockStore();
      mockApiRequest(mockResponse);

      return store.dispatch(getAllTriageTeamRecipients()).then(() => {
        const actions = store.getActions();
        expect(actions[0].response.data[0].attributes).to.not.have.property(
          'signatureRequired',
        );
      });
    });
  });
});

// Test coverage for the new action creators

describe('setActiveCareSystem action', () => {
  const middlewares = [thunk];
  const mockStore = (initialState = {}) =>
    configureStore(middlewares)(initialState);

  it('should dispatch SELECT_HEALTH_CARE_SYSTEM action with correct payload', () => {
    const store = mockStore();
    const selectedCareSystem = { id: 'test-system', name: 'Test System' };

    store.dispatch(setActiveCareSystem(selectedCareSystem));
    const actions = store.getActions();

    expect(actions[0]).to.deep.equal({
      type: Actions.AllRecipients.SELECT_HEALTH_CARE_SYSTEM,
      payload: {
        careSystem: selectedCareSystem,
      },
    });
  });
});

describe('setActiveCareTeam action', () => {
  const middlewares = [thunk];
  const mockStore = (initialState = {}) =>
    configureStore(middlewares)(initialState);

  it('should dispatch SELECT_CARE_TEAM action with correct payload', () => {
    const store = mockStore();
    const selectedCareTeam = { id: 'test-team', name: 'Test Team' };

    store.dispatch(setActiveCareTeam(selectedCareTeam));
    const actions = store.getActions();

    expect(actions[0]).to.deep.equal({
      type: Actions.AllRecipients.SELECT_CARE_TEAM,
      payload: {
        careTeam: selectedCareTeam,
      },
    });
  });
});

describe('setActiveDraftId action', () => {
  const middlewares = [thunk];
  const mockStore = (initialState = {}) =>
    configureStore(middlewares)(initialState);

  it('should dispatch SET_ACTIVE_DRAFT_ID action with correct payload', () => {
    const store = mockStore();
    const draftId = 'test-draft-id-123';

    store.dispatch(setActiveDraftId(draftId));
    const actions = store.getActions();

    expect(actions[0]).to.deep.equal({
      type: Actions.AllRecipients.SET_ACTIVE_DRAFT_ID,
      payload: {
        activeDraftId: draftId,
      },
    });
  });
});

describe('resetRecentRecipient action', () => {
  const middlewares = [thunk];
  const mockStore = (initialState = {}) =>
    configureStore(middlewares)(initialState);

  it('should dispatch RESET_RECENT action', () => {
    const store = mockStore();

    store.dispatch(resetRecentRecipient());
    const actions = store.getActions();

    expect(actions[0]).to.deep.equal({
      type: Actions.AllRecipients.RESET_RECENT,
    });
  });
});
