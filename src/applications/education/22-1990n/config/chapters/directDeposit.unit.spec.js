import { expect } from 'chai';
import {
  directDepositUiSchema,
  directDepositSchema,
} from './directDeposit';

describe('chapters/directDeposit', () => {
  describe('uiSchema', () => {
    it('exports a uiSchema object', () => {
      expect(directDepositUiSchema).to.be.an('object');
    });

    it('has contactInformation.directDeposit key', () => {
      expect(directDepositUiSchema.contactInformation).to.be.an('object');
      expect(directDepositUiSchema.contactInformation.directDeposit).to.be.an(
        'object',
      );
    });

    it('has enrolling, accountType, routingNumber, accountNumber fields', () => {
      const dd = directDepositUiSchema.contactInformation.directDeposit;
      expect(dd.enrolling).to.be.an('object');
      expect(dd.accountType).to.be.an('object');
      expect(dd.routingNumber).to.be.an('object');
      expect(dd.accountNumber).to.be.an('object');
    });
  });

  describe('schema', () => {
    it('exports a schema object', () => {
      expect(directDepositSchema).to.be.an('object');
    });

    it('directDeposit requires enrolling', () => {
      const dd =
        directDepositSchema.properties.contactInformation.properties
          .directDeposit;
      expect(dd.required).to.include('enrolling');
    });

    it('routingNumber has 9-digit pattern', () => {
      const routingNumber =
        directDepositSchema.properties.contactInformation.properties
          .directDeposit.properties.routingNumber;
      expect(routingNumber.pattern).to.equal('^\\d{9}$');
    });

    it('accountNumber has up-to-17-digit pattern', () => {
      const accountNumber =
        directDepositSchema.properties.contactInformation.properties
          .directDeposit.properties.accountNumber;
      expect(accountNumber.pattern).to.equal('^\\d{1,17}$');
    });
  });
});