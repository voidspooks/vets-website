import { expect } from 'chai';
import {
  paymentInformationUiSchema,
  paymentInformationSchema,
  bankDocumentUploadUiSchema,
  bankDocumentUploadSchema,
} from './directDeposit';

describe('directDeposit chapter', () => {
  describe('paymentInformationUiSchema', () => {
    it('has directDeposit field with noDirectDeposit and bankAccount', () => {
      expect(paymentInformationUiSchema).to.have.property('directDeposit');
      expect(paymentInformationUiSchema.directDeposit).to.have.property('noDirectDeposit');
      expect(paymentInformationUiSchema.directDeposit).to.have.property('bankAccount');
    });

    it('bankAccount has accountType, routingNumber, accountNumber fields', () => {
      const bankAccount = paymentInformationUiSchema.directDeposit.bankAccount;
      expect(bankAccount).to.have.property('accountType');
      expect(bankAccount).to.have.property('routingNumber');
      expect(bankAccount).to.have.property('accountNumber');
    });
  });

  describe('paymentInformationSchema', () => {
    it('has directDeposit with bankAccount properties', () => {
      const { directDeposit } = paymentInformationSchema.properties;
      expect(directDeposit).to.exist;
      expect(directDeposit.properties).to.have.property('bankAccount');
    });

    it('routingNumber has 9-digit pattern', () => {
      const routingNumber =
        paymentInformationSchema.properties.directDeposit.properties.bankAccount
          .properties.routingNumber;
      expect(routingNumber.pattern).to.equal('^\\d{9}$');
    });

    it('accountNumber has 4-17 digit pattern', () => {
      const accountNumber =
        paymentInformationSchema.properties.directDeposit.properties.bankAccount
          .properties.accountNumber;
      expect(accountNumber.pattern).to.equal('^\\d{4,17}$');
    });
  });

  describe('bankDocumentUploadUiSchema', () => {
    it('has directDeposit.bankDocument field', () => {
      expect(bankDocumentUploadUiSchema.directDeposit).to.have.property('bankDocument');
    });
  });

  describe('bankDocumentUploadSchema', () => {
    it('has directDeposit.bankDocument', () => {
      expect(
        bankDocumentUploadSchema.properties.directDeposit.properties,
      ).to.have.property('bankDocument');
    });
  });
});