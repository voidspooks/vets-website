import { expect } from 'chai';
import sinon from 'sinon';

import pageConfig from '../../../../config/chapters/05-financial-information/netWorthEstimationFormNeeded';
import * as helpers from '../../../../helpers';

describe('NetWorthEstimationFormNeeded page depends', () => {
  let netWorthEstimateIsOverThresholdStub;

  beforeEach(() => {
    netWorthEstimateIsOverThresholdStub = sinon.stub(
      helpers,
      'netWorthEstimateIsOverThreshold',
    );
  });

  afterEach(() => {
    netWorthEstimateIsOverThresholdStub.restore();
  });

  it('returns true when totalNetWorth is true (short-circuits helper)', () => {
    netWorthEstimateIsOverThresholdStub.returns(false);

    const formData = { totalNetWorth: true };

    const result = pageConfig.depends(formData);

    expect(result).to.be.true;
    expect(netWorthEstimateIsOverThresholdStub.called).to.be.false;
  });

  it('returns false when totalNetWorth is false and netWorthEstimateIsOverThreshold returns false', () => {
    netWorthEstimateIsOverThresholdStub.returns(false);

    const formData = { totalNetWorth: false };

    const result = pageConfig.depends(formData);

    expect(result).to.be.false;
    expect(netWorthEstimateIsOverThresholdStub.calledOnce).to.be.true;
    expect(netWorthEstimateIsOverThresholdStub.firstCall.args[0]).to.equal(
      formData,
    );
  });

  it('returns true when totalNetWorth is false and netWorthEstimateIsOverThreshold returns true', () => {
    netWorthEstimateIsOverThresholdStub.returns(true);

    const formData = { totalNetWorth: false };

    const result = pageConfig.depends(formData);

    expect(result).to.be.true;
    expect(netWorthEstimateIsOverThresholdStub.calledOnce).to.be.true;
    expect(netWorthEstimateIsOverThresholdStub.firstCall.args[0]).to.equal(
      formData,
    );
  });

  it('treats missing totalNetWorth as falsy and evaluates helper', () => {
    netWorthEstimateIsOverThresholdStub.returns(true);

    const formData = {};

    const result = pageConfig.depends(formData);

    expect(result).to.be.true;
    expect(netWorthEstimateIsOverThresholdStub.calledOnce).to.be.true;
  });
});

describe('NetWorthEstimationFormNeeded page onContinue', () => {
  it('should call setFormData in adjustTotalNetWorthBooleanIfNeeded when totalNetWorth is false and netWorthEstimationFormNeeded is above the threshold', () => {
    const formData = { totalNetWorth: false, netWorthEstimation: 100_000 };
    const setFormData = sinon.spy();

    pageConfig.onContinue(formData, setFormData);

    expect(setFormData.args[0][0].totalNetWorth).to.be.true;
  });
  it('should not call setFormData in adjustTotalNetWorthBooleanIfNeeded when totalNetWorth is false and netWorthEstimationFormNeeded is below the threshold', () => {
    const formData = { totalNetWorth: false, netWorthEstimation: 1000 };
    const setFormData = sinon.spy();

    pageConfig.onContinue(formData, setFormData);

    expect(setFormData.notCalled).to.be.true;
  });
  it('should not call setFormData in adjustTotalNetWorthBooleanIfNeeded when totalNetWorth is true and netWorthEstimationFormNeeded is below the threshold', () => {
    const formData = { totalNetWorth: true, netWorthEstimation: 1000 };
    const setFormData = sinon.spy();

    pageConfig.onContinue(formData, setFormData);

    expect(setFormData.notCalled).to.be.true;
  });
  it('should not call setFormData in adjustTotalNetWorthBooleanIfNeeded when totalNetWorth is true and netWorthEstimationFormNeeded is below the threshold', () => {
    const formData = { totalNetWorth: true, netWorthEstimation: 100_000 };
    const setFormData = sinon.spy();

    pageConfig.onContinue(formData, setFormData);

    expect(setFormData.notCalled).to.be.true;
  });
});
