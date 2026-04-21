import { expect } from 'chai';
import transformForSubmit from '../../../config/submit-transformer';
import { FORM_10_8678 } from '../../../definitions/constants';

const run = (data, formConfig = {}) =>
  JSON.parse(transformForSubmit(formConfig, { data }));

describe('10-8678 submit transformer — branch coverage', () => {
  describe('identity fallbacks', () => {
    it('uses data.fullName when present', () => {
      const result = run({
        fullName: { first: 'Allen', last: 'Barry' },
        ssn: '111223333',
      });
      expect(result.fullName).to.deep.equal({ first: 'Allen', last: 'Barry' });
    });

    it('falls back to data.veteran.fullName when data.fullName is missing', () => {
      const result = run({
        veteran: {
          fullName: { first: 'Vet', last: 'Eran' },
          ssn: '111223333',
          address: {
            street: '1 St',
            city: 'Bridgewater',
            state: 'MA',
            postalCode: '1',
          },
          phone: '5551112222',
          email: 'v@example.com',
        },
      });
      expect(result.fullName).to.deep.equal({ first: 'Vet', last: 'Eran' });
      expect(result.ssn).to.equal('111223333');
      expect(result.phone).to.equal('5551112222');
      expect(result.emailAddress).to.equal('v@example.com');
    });

    it('prefers data.emailAddress over data.email and veteran.email', () => {
      const result = run({
        fullName: { first: 'Allen', last: 'Barry' },
        emailAddress: 'primary@example.com',
        email: 'secondary@example.com',
        veteran: { email: 'tertiary@example.com' },
      });
      expect(result.emailAddress).to.equal('primary@example.com');
    });

    it('falls through emailAddress → email → veteran.email', () => {
      const emailOnly = run({
        fullName: { first: 'Allen', last: 'Barry' },
        email: 'secondary@example.com',
      });
      expect(emailOnly.emailAddress).to.equal('secondary@example.com');

      const vetOnly = run({
        fullName: { first: 'Allen', last: 'Barry' },
        veteran: { email: 'tertiary@example.com' },
      });
      expect(vetOnly.emailAddress).to.equal('tertiary@example.com');
    });
  });

  describe('stringOrUndefined / pruneEmpty', () => {
    it('strips whitespace-only strings', () => {
      const result = run({
        fullName: { first: 'Allen', middle: '  ', last: 'Barry' },
      });
      expect(result.fullName.middle).to.be.undefined;
    });

    it('drops fully-empty sections', () => {
      const result = run({});
      expect(result.fullName).to.be.undefined;
      expect(result.ssn).to.be.undefined;
      expect(result.address).to.deep.equal({ country: 'USA' });
    });

    it('drops empty arrays of appliances', () => {
      const result = run({
        fullName: { first: 'Allen', last: 'Barry' },
        deviceApplianceMedicationItems: [],
      });
      expect(result.appliances).to.be.undefined;
    });

    it('prunes empty nested appliance items while keeping complete ones', () => {
      const result = run({
        fullName: { first: 'Allen', last: 'Barry' },
        deviceApplianceMedicationItems: [
          {},
          {
            itemType: 'Brace',
            serviceConnectedDisability: 'Knee',
            issuingFacility: 'Facility B',
            impactedLocations: { lowerLeft: true },
          },
        ],
      });
      expect(result.appliances).to.have.lengthOf(1);
      expect(result.appliances[0].deviceOrMedication).to.equal('Brace');
      expect(result.appliances[0].impactedLocations).to.deep.equal({
        lowerLeft: true,
      });
    });
  });

  describe('resolveFacility', () => {
    it('returns the standard issuingFacility when not Other', () => {
      const result = run({
        fullName: { first: 'Allen', last: 'Barry' },
        deviceApplianceMedicationItems: [
          { itemType: 'X', issuingFacility: 'Facility A' },
        ],
      });
      expect(result.appliances[0].issuingFacility).to.equal('Facility A');
    });

    it('returns issuingFacilityOther when Other is selected', () => {
      const result = run({
        fullName: { first: 'Allen', last: 'Barry' },
        deviceApplianceMedicationItems: [
          {
            itemType: 'X',
            issuingFacility: FORM_10_8678.VHA_MEDICAL_FACILITY.OTHER_OPTION,
            issuingFacilityOther: 'Out-of-system clinic',
          },
        ],
      });
      expect(result.appliances[0].issuingFacility).to.equal(
        'Out-of-system clinic',
      );
    });

    it('yields undefined when Other is selected but free-text is blank', () => {
      const result = run({
        fullName: { first: 'Allen', last: 'Barry' },
        deviceApplianceMedicationItems: [
          {
            itemType: 'X',
            issuingFacility: FORM_10_8678.VHA_MEDICAL_FACILITY.OTHER_OPTION,
            issuingFacilityOther: '   ',
          },
        ],
      });
      expect(result.appliances[0].issuingFacility).to.be.undefined;
    });
  });

  describe('electTermination and vhaMedicalFacility', () => {
    it('maps electTermination: "terminate" to true', () => {
      const result = run({
        fullName: { first: 'Allen', last: 'Barry' },
        electTermination: 'terminate',
      });
      expect(result.electTermination).to.equal(true);
    });

    it('maps any other electTermination value to false', () => {
      const result = run({
        fullName: { first: 'Allen', last: 'Barry' },
        electTermination: 'continue',
      });
      expect(result.electTermination).to.equal(false);
    });

    it('uses vhaMedicalFacility when not Other', () => {
      const result = run({
        fullName: { first: 'Allen', last: 'Barry' },
        vhaMedicalFacility: 'Facility A',
      });
      expect(result.vhaMedicalFacility).to.equal('Facility A');
    });

    it('uses vhaMedicalFacilityOther when facility is Other', () => {
      const result = run({
        fullName: { first: 'Allen', last: 'Barry' },
        vhaMedicalFacility: FORM_10_8678.VHA_MEDICAL_FACILITY.OTHER_OPTION,
        vhaMedicalFacilityOther: 'Local VA',
      });
      expect(result.vhaMedicalFacility).to.equal('Local VA');
    });
  });

  describe('veteranSignature and signatureDate', () => {
    it('joins first/middle/last into veteranSignature', () => {
      const result = run({
        fullName: { first: 'Jane', middle: 'M', last: 'Doe' },
      });
      expect(result.veteranSignature).to.equal('Jane M Doe');
      expect(result.signatureDate).to.match(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('omits missing name parts from veteranSignature', () => {
      const result = run({ fullName: { first: 'Jane', last: 'Doe' } });
      expect(result.veteranSignature).to.equal('Jane Doe');
    });
  });

  describe('address country defaulting', () => {
    it('defaults country to USA when absent', () => {
      const result = run({
        fullName: { first: 'Allen', last: 'Barry' },
        address: {
          street: '1 St',
          city: 'Bridgewater',
          state: 'MA',
          postalCode: '1',
        },
      });
      expect(result.address.country).to.equal('USA');
    });

    it('keeps a supplied country verbatim', () => {
      const result = run({
        fullName: { first: 'Allen', last: 'Barry' },
        address: {
          street: '1 St',
          city: 'Bridgewater',
          state: 'MA',
          postalCode: '1',
          country: 'CAN',
        },
      });
      expect(result.address.country).to.equal('CAN');
    });
  });
});
