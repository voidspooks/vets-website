import { expect } from 'chai';
import sinon from 'sinon';
import transformForSubmit from '../../../config/submit-transformer';
import * as sharedTransformModule from '../../../../shared/config/submit-transformer';

describe('21-0788 submit transformer', () => {
  let sharedStub;

  beforeEach(() => {
    sharedStub = sinon.stub(sharedTransformModule, 'default').returns('{}');
  });

  afterEach(() => {
    sharedStub.restore();
  });

  it('delegates to the shared transformer', () => {
    const formConfig = { formId: '21-0788' };
    const form = { data: { claimant: { fullName: { first: 'Jane' } } } };

    transformForSubmit(formConfig, form);

    expect(sharedStub.calledOnce).to.equal(true);
    expect(sharedStub.firstCall.args[0]).to.equal(formConfig);
    expect(sharedStub.firstCall.args[1]).to.equal(form);
  });

  it('passes the allowPartialAddress option', () => {
    transformForSubmit({ formId: '21-0788' }, { data: {} });

    expect(sharedStub.firstCall.args[2]).to.deep.equal({
      allowPartialAddress: true,
    });
  });

  it('returns whatever the shared transformer returns', () => {
    sharedStub.returns('{"foo":"bar"}');

    const result = transformForSubmit({ formId: '21-0788' }, { data: {} });
    expect(result).to.equal('{"foo":"bar"}');
  });
});
