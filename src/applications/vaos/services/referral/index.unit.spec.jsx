import { expect } from 'chai';
import sinon from 'sinon';
import * as services from './index';
import * as utils from '../utils';

describe('Referral Services', () => {
  let sandbox;
  let requestStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    requestStub = sandbox.stub(utils, 'apiRequestWithUrl');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('getPatientReferralById calls the correct endpoint and returns data', async () => {
    requestStub.resolves({ data: { id: 'abc' } });

    const result = await services.getPatientReferralById('abc');

    expect(
      requestStub.calledWith('/vaos/v2/referrals/abc', {
        method: 'GET',
      }),
    ).to.be.true;

    expect(result).to.deep.equal({ id: 'abc' });
  });

  it('getProviderById calls the correct endpoint and returns data', async () => {
    requestStub.resolves({ data: { name: 'Provider A' } });

    const result = await services.getProviderById('prov-id');

    expect(
      requestStub.calledWith('/vaos/v2/epsApi/providerDetails/prov-id', {
        method: 'GET',
      }),
    ).to.be.true;

    expect(result).to.deep.equal({ name: 'Provider A' });
  });

  it('getAppointmentInfo calls the correct endpoint and returns data', async () => {
    requestStub.resolves({ data: { appointment: { id: 'a1' } } });

    const result = await services.getAppointmentInfo('a1');

    expect(
      requestStub.calledWith('/vaos/v2/unified_bookings/a1?provider_type=eps', {
        method: 'GET',
      }),
    ).to.be.true;

    expect(result).to.deep.equal({ appointment: { id: 'a1' } });
  });

  it('getProvidersByReferralId calls the providers index with referral_id', async () => {
    requestStub.resolves({ data: [], meta: {} });

    await services.getProvidersByReferralId('enc-123', {
      page: 2,
      perPage: 10,
    });

    expect(
      requestStub.calledWith(
        '/vaos/v2/providers?referral_id=enc-123&page=2&perPage=10',
        { method: 'GET' },
      ),
    ).to.be.true;
  });
});
