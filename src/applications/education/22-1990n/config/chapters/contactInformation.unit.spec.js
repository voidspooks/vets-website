import { expect } from 'chai';
import {
  contactInformationUiSchema,
  contactInformationSchema,
} from './contactInformation';

describe('chapters/contactInformation', () => {
  describe('uiSchema', () => {
    it('exports a uiSchema object', () => {
      expect(contactInformationUiSchema).to.be.an('object');
    });

    it('has contactInformation key', () => {
      expect(contactInformationUiSchema).to.have.property('contactInformation');
    });

    it('has mailingAddress with required sub-fields', () => {
      const ci = contactInformationUiSchema.contactInformation;
      expect(ci.mailingAddress).to.be.an('object');
      expect(ci.mailingAddress.street).to.be.an('object');
      expect(ci.mailingAddress.city).to.be.an('object');
      expect(ci.mailingAddress.state).to.be.an('object');
      expect(ci.mailingAddress.postalCode).to.be.an('object');
    });

    it('has homePhone and mobilePhone fields', () => {
      const ci = contactInformationUiSchema.contactInformation;
      expect(ci.homePhone).to.be.an('object');
      expect(ci.mobilePhone).to.be.an('object');
    });

    it('has email field', () => {
      const ci = contactInformationUiSchema.contactInformation;
      expect(ci.email).to.be.an('object');
    });
  });

  describe('schema', () => {
    it('exports a schema object', () => {
      expect(contactInformationSchema).to.be.an('object');
    });

    it('mailingAddress is required inside contactInformation', () => {
      const ci = contactInformationSchema.properties.contactInformation;
      expect(ci.required).to.include('mailingAddress');
    });

    it('mailingAddress requires street, city, state, postalCode', () => {
      const addr =
        contactInformationSchema.properties.contactInformation.properties
          .mailingAddress;
      expect(addr.required).to.include('street');
      expect(addr.required).to.include('city');
      expect(addr.required).to.include('state');
      expect(addr.required).to.include('postalCode');
    });

    it('postalCode has correct pattern', () => {
      const postalCode =
        contactInformationSchema.properties.contactInformation.properties
          .mailingAddress.properties.postalCode;
      expect(postalCode.pattern).to.equal('^\\d{5}(-\\d{4})?$');
    });
  });
});