import { expect } from 'chai';
import sinon from 'sinon';
import * as api from '@department-of-veterans-affairs/platform-utilities/api';
import environment from 'platform/utilities/environment';
import * as helpers from '../../../helpers';
import {
  CH31_CASE_MILESTONES_FETCH_FAILED,
  CH31_CASE_MILESTONES_FETCH_STARTED,
  CH31_CASE_MILESTONES_FETCH_SUCCEEDED,
} from '../../../constants';
import { submitCh31CaseMilestones } from '../../../actions/ch31-case-milestones';

const sandbox = sinon.createSandbox();

const formatToday = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};

const buildUser = ({ first, last } = {}) => ({
  profile: { userFullName: { first: first ?? null, last: last ?? null } },
});

const getParsedBody = stub => JSON.parse(stub.getCall(0).args[1].body);

describe('ch31-case-milestones actions', () => {
  let apiStub;
  let dispatch;

  beforeEach(() => {
    apiStub = sandbox.stub(api, 'apiRequest');
    dispatch = sandbox.spy();
  });

  afterEach(() => {
    sandbox.restore();
  });

  // ---------------------------------------------------------------------------
  // Original tests (unchanged)
  // ---------------------------------------------------------------------------

  it('dispatches STARTED and SUCCEEDED on successful POST', async () => {
    const mockResponse = { data: { foo: 'bar' } };
    apiStub.resolves(mockResponse);

    await submitCh31CaseMilestones({
      milestoneCompletionType: 'TEST_MILESTONE',
    })(dispatch);

    expect(dispatch.getCall(0).args[0].type).to.equal(
      CH31_CASE_MILESTONES_FETCH_STARTED,
    );

    const [url, options] = apiStub.getCall(0).args;
    expect(url).to.equal(`${environment.API_URL}/vre/v0/ch31_case_milestones`);
    expect(options.method).to.equal('POST');
    expect(options.headers['Content-Type']).to.equal('application/json');
    const body = JSON.parse(options.body);
    expect(body.milestones[0].postpone).to.be.false;
    expect(body.milestones[0].milestoneType).to.equal('TEST_MILESTONE');
    expect(body.milestones[0].isMilestoneCompleted).to.be.true;
    expect(body.milestones[0].milestoneCompletionDate).to.equal(formatToday());

    expect(dispatch.getCall(1).args[0].type).to.equal(
      CH31_CASE_MILESTONES_FETCH_SUCCEEDED,
    );
    expect(dispatch.getCall(1).args[0].payload).to.deep.equal(
      mockResponse.data,
    );
  });

  it('dispatches STARTED and FAILED on API error', async () => {
    const error = { status: 400, message: 'Bad request' };
    sandbox.stub(helpers, 'getStatus').returns(400);
    sandbox.stub(helpers, 'extractMessages').returns(['Bad request']);
    apiStub.rejects(error);

    await submitCh31CaseMilestones({
      milestoneCompletionType: 'TEST_MILESTONE',
    })(dispatch);

    expect(dispatch.getCall(0).args[0].type).to.equal(
      CH31_CASE_MILESTONES_FETCH_STARTED,
    );
    expect(dispatch.getCall(1).args[0].type).to.equal(
      CH31_CASE_MILESTONES_FETCH_FAILED,
    );
    expect(dispatch.getCall(1).args[0].error.status).to.equal(400);
  });

  // ---------------------------------------------------------------------------
  // Branch coverage: postpone
  // ---------------------------------------------------------------------------

  it('sends postpone: true when explicitly passed', async () => {
    apiStub.resolves({ data: {} });

    await submitCh31CaseMilestones({
      milestoneCompletionType: 'TEST_MILESTONE',
      postpone: true,
    })(dispatch);

    expect(getParsedBody(apiStub).milestones[0].postpone).to.be.true;
  });

  // ---------------------------------------------------------------------------
  // Branch coverage: milestoneSubmissionUser
  // ---------------------------------------------------------------------------

  it('builds "Last, First" when both names are present', async () => {
    apiStub.resolves({ data: {} });

    await submitCh31CaseMilestones({
      milestoneCompletionType: 'TEST_MILESTONE',
      user: buildUser({ first: 'Jane', last: 'Doe' }),
    })(dispatch);

    expect(
      getParsedBody(apiStub).milestones[0].milestoneSubmissionUser,
    ).to.equal('Doe, Jane');
  });

  it('builds "Last" only when first name is absent', async () => {
    apiStub.resolves({ data: {} });

    await submitCh31CaseMilestones({
      milestoneCompletionType: 'TEST_MILESTONE',
      user: buildUser({ last: 'Doe' }),
    })(dispatch);

    expect(
      getParsedBody(apiStub).milestones[0].milestoneSubmissionUser,
    ).to.equal('Doe');
  });

  it('sends an empty string when user has no name fields', async () => {
    apiStub.resolves({ data: {} });

    await submitCh31CaseMilestones({
      milestoneCompletionType: 'TEST_MILESTONE',
      user: buildUser(),
    })(dispatch);

    expect(
      getParsedBody(apiStub).milestones[0].milestoneSubmissionUser,
    ).to.equal('');
  });

  // ---------------------------------------------------------------------------
  // Branch coverage: error handling
  // ---------------------------------------------------------------------------

  it('sets error.status to null when getStatus returns undefined', async () => {
    sandbox.stub(helpers, 'getStatus').returns(undefined);
    sandbox.stub(helpers, 'extractMessages').returns(['Something failed']);
    apiStub.rejects(new Error('Something failed'));

    await submitCh31CaseMilestones({
      milestoneCompletionType: 'TEST_MILESTONE',
    })(dispatch);

    expect(dispatch.getCall(1).args[0].error.status).to.be.null;
  });

  it('falls back to errOrResp.message when extractMessages returns empty', async () => {
    sandbox.stub(helpers, 'getStatus').returns(500);
    sandbox.stub(helpers, 'extractMessages').returns([]);
    apiStub.rejects(new Error('Network timeout'));

    await submitCh31CaseMilestones({
      milestoneCompletionType: 'TEST_MILESTONE',
    })(dispatch);

    expect(dispatch.getCall(1).args[0].error.messages).to.deep.equal([
      'Network timeout',
    ]);
  });

  it('falls back to "Network error" when extractMessages is empty and no message exists', async () => {
    sandbox.stub(helpers, 'getStatus').returns(500);
    sandbox.stub(helpers, 'extractMessages').returns([]);
    apiStub.rejects({});

    await submitCh31CaseMilestones({
      milestoneCompletionType: 'TEST_MILESTONE',
    })(dispatch);

    expect(dispatch.getCall(1).args[0].error.messages).to.deep.equal([
      'Network error',
    ]);
  });
});
