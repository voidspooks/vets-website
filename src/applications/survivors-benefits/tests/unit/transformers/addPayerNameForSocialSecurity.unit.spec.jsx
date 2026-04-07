import { expect } from 'chai';
import { addPayerNameForSocialSecurity } from '../../../utils/transformers/addPayerNameForSocialSecurity';

describe('addPayerNameForSocialSecurity', () => {
  it('sets incomePayer to Social Security Administration for SOCIAL_SECURITY entries', () => {
    const formData = JSON.stringify({
      incomeEntries: [{ incomeType: 'SOCIAL_SECURITY', monthlyIncome: 1000 }],
    });

    const result = JSON.parse(addPayerNameForSocialSecurity(formData));

    expect(result.incomeEntries[0].incomePayer).to.equal(
      'Social Security Administration',
    );
  });

  it('overwrites an existing incomePayer value for SOCIAL_SECURITY entries', () => {
    const formData = JSON.stringify({
      incomeEntries: [
        {
          incomeType: 'SOCIAL_SECURITY',
          incomePayer: 'Old Value',
          monthlyIncome: 500,
        },
      ],
    });

    const result = JSON.parse(addPayerNameForSocialSecurity(formData));

    expect(result.incomeEntries[0].incomePayer).to.equal(
      'Social Security Administration',
    );
  });

  it('does not modify incomePayer for non-SOCIAL_SECURITY entries', () => {
    const formData = JSON.stringify({
      incomeEntries: [
        {
          incomeType: 'PENSION_RETIREMENT',
          incomePayer: 'VA',
          monthlyIncome: 800,
        },
        {
          incomeType: 'INTEREST_DIVIDENDS',
          incomePayer: 'Bank',
          monthlyIncome: 200,
        },
        { incomeType: 'OTHER', incomePayer: 'Employer', monthlyIncome: 3000 },
      ],
    });

    const result = JSON.parse(addPayerNameForSocialSecurity(formData));

    expect(result.incomeEntries[0].incomePayer).to.equal('VA');
    expect(result.incomeEntries[1].incomePayer).to.equal('Bank');
    expect(result.incomeEntries[2].incomePayer).to.equal('Employer');
  });

  it('handles a mix of SOCIAL_SECURITY and other income types', () => {
    const formData = JSON.stringify({
      incomeEntries: [
        { incomeType: 'SOCIAL_SECURITY', monthlyIncome: 1200 },
        {
          incomeType: 'CIVIL_SERVICE',
          incomePayer: 'DOD',
          monthlyIncome: 2000,
        },
        {
          incomeType: 'SOCIAL_SECURITY',
          incomePayer: 'Wrong',
          monthlyIncome: 600,
        },
      ],
    });

    const result = JSON.parse(addPayerNameForSocialSecurity(formData));

    expect(result.incomeEntries[0].incomePayer).to.equal(
      'Social Security Administration',
    );
    expect(result.incomeEntries[1].incomePayer).to.equal('DOD');
    expect(result.incomeEntries[2].incomePayer).to.equal(
      'Social Security Administration',
    );
  });

  it('returns data unchanged when incomeEntries is absent', () => {
    const formData = JSON.stringify({
      bankAccount: { accountType: 'CHECKING' },
    });

    const result = JSON.parse(addPayerNameForSocialSecurity(formData));

    expect(result.bankAccount.accountType).to.equal('CHECKING');
    expect(result.incomeEntries).to.be.undefined;
  });

  it('returns data unchanged when incomeEntries is an empty array', () => {
    const formData = JSON.stringify({ incomeEntries: [] });

    const result = JSON.parse(addPayerNameForSocialSecurity(formData));

    expect(result.incomeEntries).to.deep.equal([]);
  });
});
