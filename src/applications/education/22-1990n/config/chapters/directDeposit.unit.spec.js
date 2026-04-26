import { expect } from 'chai';
import {
  directDepositUiSchema,
  directDepositSchema,
} from './directDeposit';

describe('config/chapters/directDeposit', () => {
  it('uiSchema has directDepositEnrolling field', () => {
    expect(directDepositUiSchema).to.have.property('directDepositEnrolling');
  });

  it('uiSchema has directDeposit nested fields', () => {
    expect(directDepositUiSchema).to.have.property('directDeposit');
    expect(directDepositUiSchema.directDeposit).to.have.property(
      'accountType',
    );
    expect(directDepositUiSchema.directDeposit).to.have.property(
      'routingNumber',
    );
    expect(directDepositUiSchema.directDeposit).to.have.property(
      'accountNumber',
    );
  });

  it('schema has directDepositEnrolling as boolean', () => {
    expect(
      directDepositSchema.properties.directDepositEnrolling,
    ).to.deep.equal({ type: 'boolean' });
  });

  it('accountType schema has CHECKING and SAVINGS enum', () => {
    const enumValues =
      directDepositSchema.properties.directDeposit.properties.accountType
        .enum;
    expect(enumValues).to.include('CHECKING');
    expect(enumValues).to.include('SAVINGS');
  });

  it('routingNumber schema has 9-digit pattern', () => {
    const rn =
      directDepositSchema.properties.directDeposit.properties
        .routingNumber;
    expect(rn.pattern).to.equal('^\\d{9}$');
    expect(rn.maxLength).to.equal(9);
  });

  it('directDeposit accountType required function returns true when enrolling', () => {
    const reqFn =
      directDepositUiSchema.directDeposit.accountType['ui:required'];
    if (reqFn) {
      expect(reqFn({ directDepositEnrolling: true })).to.equal(true);
      expect(reqFn({ directDepositEnrolling: false })).to.equal(false);
    }
  });
});