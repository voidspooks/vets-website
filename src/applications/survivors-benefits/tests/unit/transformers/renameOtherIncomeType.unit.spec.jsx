import { expect } from 'chai';
import { renameOtherIncomeType } from '../../../utils/transformers/renameOtherIncomeType';

describe('renameOtherIncomeType', () => {
  it('renames otherIncomeType to incomeTypeOther in an income entry', () => {
    const formData = JSON.stringify({
      incomeEntries: [
        {
          incomeType: 'OTHER',
          otherIncomeType: 'Freelance work',
          monthlyIncome: 500,
        },
      ],
    });

    const result = JSON.parse(renameOtherIncomeType(formData));

    expect(result.incomeEntries[0].incomeTypeOther).to.equal('Freelance work');
    expect(result.incomeEntries[0].otherIncomeType).to.be.undefined;
  });

  it('does not affect entries without otherIncomeType', () => {
    const formData = JSON.stringify({
      incomeEntries: [
        { incomeType: 'SOCIAL_SECURITY', monthlyIncome: 1200 },
        {
          incomeType: 'PENSION_RETIREMENT',
          incomePayer: 'VA',
          monthlyIncome: 800,
        },
      ],
    });

    const result = JSON.parse(renameOtherIncomeType(formData));

    expect(result.incomeEntries[0].incomeTypeOther).to.be.undefined;
    expect(result.incomeEntries[1].incomeTypeOther).to.be.undefined;
  });

  it('handles a mix of OTHER and non-OTHER entries', () => {
    const formData = JSON.stringify({
      incomeEntries: [
        {
          incomeType: 'OTHER',
          otherIncomeType: 'Rental income',
          monthlyIncome: 400,
        },
        {
          incomeType: 'CIVIL_SERVICE',
          incomePayer: 'DOD',
          monthlyIncome: 3000,
        },
        {
          incomeType: 'OTHER',
          otherIncomeType: 'Side business',
          monthlyIncome: 200,
        },
      ],
    });

    const result = JSON.parse(renameOtherIncomeType(formData));

    expect(result.incomeEntries[0].incomeTypeOther).to.equal('Rental income');
    expect(result.incomeEntries[0].otherIncomeType).to.be.undefined;
    expect(result.incomeEntries[1].incomeTypeOther).to.be.undefined;
    expect(result.incomeEntries[2].incomeTypeOther).to.equal('Side business');
    expect(result.incomeEntries[2].otherIncomeType).to.be.undefined;
  });

  it('returns data unchanged when incomeEntries is absent', () => {
    const formData = JSON.stringify({
      bankAccount: { accountType: 'CHECKING' },
    });

    const result = JSON.parse(renameOtherIncomeType(formData));

    expect(result.bankAccount.accountType).to.equal('CHECKING');
    expect(result.incomeEntries).to.be.undefined;
  });

  it('returns data unchanged when incomeEntries is an empty array', () => {
    const formData = JSON.stringify({ incomeEntries: [] });

    const result = JSON.parse(renameOtherIncomeType(formData));

    expect(result.incomeEntries).to.deep.equal([]);
  });

  it('preserves all other fields on the entry when renaming', () => {
    const formData = JSON.stringify({
      incomeEntries: [
        {
          recipient: 'SURVIVING_SPOUSE',
          incomeType: 'OTHER',
          otherIncomeType: 'Tutoring',
          incomePayer: 'Self',
          monthlyIncome: 300,
        },
      ],
    });

    const result = JSON.parse(renameOtherIncomeType(formData));
    const entry = result.incomeEntries[0];

    expect(entry.recipient).to.equal('SURVIVING_SPOUSE');
    expect(entry.incomeType).to.equal('OTHER');
    expect(entry.incomeTypeOther).to.equal('Tutoring');
    expect(entry.incomePayer).to.equal('Self');
    expect(entry.monthlyIncome).to.equal(300);
    expect(entry.otherIncomeType).to.be.undefined;
  });
});
