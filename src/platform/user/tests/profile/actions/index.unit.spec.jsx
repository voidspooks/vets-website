import { expect } from 'chai';
import sinon from 'sinon';

import * as actions from 'platform/user/profile/actions'; // Replace with actual path
import { mockApiRequest } from 'platform/testing/unit/helpers';

describe('profile actions', () => {
  let dispatch;

  beforeEach(() => {
    dispatch = sinon.spy();
  });

  it('creates UPDATE_PROFILE_FIELDS when updating profile fields', () => {
    const expectedAction = {
      type: actions.UPDATE_PROFILE_FIELDS,
      payload: { test: 'data' },
    };
    expect(actions.updateProfileFields({ test: 'data' })).to.deep.equal(
      expectedAction,
    );
  });

  // Testing thunk around refreshProfile user request
  it('handles successful profile refresh', async () => {
    const mockResponse = {
      data: { attributes: { profile: { signIn: { serviceName: 'idme' } } } },
    };
    mockApiRequest(mockResponse);

    const expectedActions = [
      { type: actions.UPDATE_PROFILE_FIELDS, payload: mockResponse },
    ];

    const resultOfFetch = await actions.refreshProfile(false, {
      local: 'none',
    })(dispatch);

    expect(dispatch.firstCall.args[0]).to.eql(expectedActions[0]);

    expect(resultOfFetch).to.deep.equal(mockResponse);
  });

  it('handles failed profile refresh', async () => {
    const errorResponse = { errors: [{ title: 'API Error' }] };
    mockApiRequest(errorResponse); // Simulate API failure

    const expectedActions = [
      { type: actions.UPDATE_PROFILE_FIELDS, payload: errorResponse },
    ];

    await actions.refreshProfile(false, { local: 'none' })(dispatch);

    expect(dispatch.firstCall.args[0]).to.eql(expectedActions[0]);
  });
});
