import { expect } from 'chai';
import { computeClaimTypeFromItems } from '../../../../pages/disabilityConditions/shared/claimType';
import { NEW_CONDITION_OPTION } from '../../../../constants';

describe('claimType utils', () => {
  it('returns both false when empty', () => {
    expect(computeClaimTypeFromItems([])).to.deep.equal({
      'view:claimingNew': false,
      'view:claimingIncrease': false,
    });
  });

  it('detects new only', () => {
    const items = [{ ratedDisability: NEW_CONDITION_OPTION }];
    expect(computeClaimTypeFromItems(items)).to.deep.equal({
      'view:claimingNew': true,
      'view:claimingIncrease': false,
    });
  });

  it('detects increase only', () => {
    const items = [{ ratedDisability: 'Tinnitus' }];
    expect(computeClaimTypeFromItems(items)).to.deep.equal({
      'view:claimingNew': false,
      'view:claimingIncrease': true,
    });
  });

  it('detects both', () => {
    const items = [
      { ratedDisability: NEW_CONDITION_OPTION },
      { ratedDisability: 'Tinnitus' },
    ];
    expect(computeClaimTypeFromItems(items)).to.deep.equal({
      'view:claimingNew': true,
      'view:claimingIncrease': true,
    });
  });

  it('detects new condition without ratedDisability', () => {
    const items = [{ condition: 'lung cancer' }];
    expect(computeClaimTypeFromItems(items)).to.deep.equal({
      'view:claimingNew': true,
      'view:claimingIncrease': false,
    });
  });

  it('detects new condition and ratedDisability', () => {
    const items = [
      { ratedDisability: 'Tinnitus' },
      { condition: 'lung cancer' },
    ];

    expect(computeClaimTypeFromItems(items)).to.deep.equal({
      'view:claimingNew': true,
      'view:claimingIncrease': true,
    });
  });

  it('does not treat an initialized array with an empty item as a new condition', () => {
    const items = [{}];

    expect(computeClaimTypeFromItems(items)).to.deep.equal({
      'view:claimingNew': false,
      'view:claimingIncrease': false,
    });
  });
});
