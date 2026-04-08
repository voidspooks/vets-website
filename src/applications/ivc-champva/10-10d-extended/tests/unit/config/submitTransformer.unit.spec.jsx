import { expect } from 'chai';
import formConfig from '../../../config/form';
import transformForSubmit from '../../../config/submitTransformer';
import { toHash } from '../../../../shared/utilities';
import { NOT_SHARED } from '../../../components/FormFields/AddressSelectionField';

const SHARED_ADDRESS_FIELD_NAME = 'view:sharesAddressWith';
const APPLICANT_SSN = '345345345';
const SSN_HASH = toHash(APPLICANT_SSN);

const makeAddress = (overrides = {}, withViewFields = false) => {
  const safeOverrides = overrides || {};

  const base = {
    street: safeOverrides.street ?? '123 Main Street',
    city: safeOverrides.city ?? 'Anytown',
    state: safeOverrides.state ?? 'MD',
    postalCode: safeOverrides.postalCode ?? '12345',
    country: safeOverrides.country ?? 'USA',
  };

  if (!withViewFields) return base;

  return {
    ...base,
    'view:militaryBaseDescription': {},
    'view:customFlag': true,
  };
};

describe('10-10d-extended transform for submit', () => {
  it('should return passed in relationship if already flat', () => {
    const transformed = JSON.parse(
      transformForSubmit(formConfig, {
        data: {
          applicants: [{ applicantRelationshipToSponsor: 'Spouse' }],
        },
      }),
    );
    expect(transformed.applicants[0].vetRelationship).to.equal('Spouse');
  });

  it('should flatten relationship details', () => {
    const transformed = JSON.parse(
      transformForSubmit(formConfig, {
        data: {
          applicants: [
            {
              applicantRelationshipToSponsor: {
                relationshipToVeteran: 'other',
                otherRelationshipToVeteran: 'Sibling',
              },
            },
          ],
        },
      }),
    );
    expect(transformed.applicants[0].vetRelationship).to.equal('Sibling');
  });

  it('should produce a semicolon separated list of relationships for third party certifiers', () => {
    const transformed = JSON.parse(
      transformForSubmit(formConfig, {
        data: {
          certifierRole: 'other',
          certifierRelationship: {
            relationshipToVeteran: {
              spouse: true,
              parent: true,
              thirdParty: false,
            },
          },
        },
      }),
    );
    expect(transformed.certification.relationship).to.equal('spouse; parent');
  });

  it('should insert blank values as needed', () => {
    const transformed = JSON.parse(
      transformForSubmit(formConfig, { data: {} }),
    );
    expect(transformed.veteran.ssnOrTin).to.equal('');
  });

  it('should set certifier info as primary contact when role equals "other"', () => {
    const certifierCert = {
      data: {
        certifierPhone: '1231231234',
        certifierEmail: 'test@example.com',
        certifierName: { first: 'Certifier', last: 'Jones' },
        certifierRole: 'other',
      },
    };
    const transformed = JSON.parse(
      transformForSubmit(formConfig, certifierCert),
    );
    expect(transformed.primaryContactInfo.name.first).to.equal(
      certifierCert.data.certifierName.first,
    );
    expect(transformed.primaryContactInfo.name.last).to.equal(
      certifierCert.data.certifierName.last,
    );
    expect(transformed.primaryContactInfo.phone).to.equal(
      certifierCert.data.certifierPhone,
    );
    expect(transformed.primaryContactInfo.email).to.equal(
      certifierCert.data.certifierEmail,
    );
  });

  it('should set `hasApplicantOver65` to false if all applicants are under 65', () => {
    const testData = { data: { applicants: [{ applicantDob: '2003-01-01' }] } };
    const transformed = JSON.parse(transformForSubmit(formConfig, testData));
    expect(transformed.hasApplicantOver65).to.be.false;
  });

  it('should set `hasApplicantOver65` to true if any applicant is 65 or over', () => {
    const testData = { data: { applicants: [{ applicantDob: '1947-01-01' }] } };
    const transformed = JSON.parse(transformForSubmit(formConfig, testData));
    expect(transformed.hasApplicantOver65).to.be.true;
  });

  it('should format dates from YYYY-MM-DD to MM-DD-YYYY', () => {
    const testData = {
      data: {
        sponsorDob: '1958-01-01',
      },
    };
    const transformed = JSON.parse(transformForSubmit(formConfig, testData));

    // Check sponsor date of birth formatting
    expect(transformed.veteran.dateOfBirth).to.equal('01-01-1958');
  });

  it('should map medicare plans to corresponding applicants', () => {
    const testData = {
      data: {
        applicants: [
          {
            applicantName: {
              first: 'Johnny',
              last: 'Alvin',
            },
            applicantSsn: APPLICANT_SSN,
          },
        ],
        medicare: [
          {
            medicareParticipant: SSN_HASH,
            medicarePlanType: 'c',
            medicarePartCCarrier: 'Advantage Health Solutions',
          },
        ],
      },
    };

    const transformed = JSON.parse(transformForSubmit(formConfig, testData));

    // First applicant should have medicare plan attached
    expect(transformed.applicants[0].medicare).to.be.an('array');
    expect(transformed.applicants[0].medicare.length).to.equal(1);
  });

  it('should map health insurance policies to corresponding applicants', () => {
    const testData = {
      data: {
        applicants: [
          {
            applicantName: {
              first: 'Johnny',
              last: 'Alvin',
            },
            applicantSsn: APPLICANT_SSN,
          },
        ],
        healthInsurance: [
          {
            insuranceType: 'medigap',
            medigapPlan: 'K',
            provider: 'Blue Cross Blue Shield',
            healthcareParticipants: { [SSN_HASH]: true },
          },
        ],
      },
    };

    const transformed = JSON.parse(transformForSubmit(formConfig, testData));

    // First applicant should have health insurance policy attached
    expect(transformed.applicants[0].healthInsurance).to.be.an('array');
    expect(transformed.applicants[0].healthInsurance.length).to.equal(1);
    expect(transformed.applicants[0].healthInsurance[0].provider).to.equal(
      'Blue Cross Blue Shield',
    );
  });

  it('should set applicant Medicare Advantage flag correctly', () => {
    const testData = {
      data: {
        medicare: [
          {
            medicareParticipant: SSN_HASH,
            medicarePlanType: 'c',
            medicarePartCCarrier: 'Advantage Health Solutions',
          },
        ],
        applicants: [
          {
            applicantName: {
              first: 'Johnny',
              last: 'Alvin',
            },
            applicantSsn: APPLICANT_SSN,
          },
        ],
      },
    };

    const transformed = JSON.parse(transformForSubmit(formConfig, testData));
    expect(transformed.applicants[0].applicantMedicareAdvantage).to.be.true;
  });

  it('should set hasOtherHealthInsurance flag correctly', () => {
    const testData = {
      data: {
        applicants: [
          {
            applicantName: {
              first: 'Johnny',
              last: 'Alvin',
            },
            applicantSsn: APPLICANT_SSN,
          },
        ],
        healthInsurance: [
          {
            insuranceType: 'medigap',
            medigapPlan: 'K',
            provider: 'Blue Cross Blue Shield',
            healthcareParticipants: { [SSN_HASH]: true },
          },
        ],
      },
    };

    const transformed = JSON.parse(transformForSubmit(formConfig, testData));
    expect(transformed.applicants[0].hasOtherHealthInsurance).to.be.true;
  });

  it('should handle sponsor deceased status correctly', () => {
    const testData = {
      data: {
        sponsorIsDeceased: true,
        sponsorDod: '2022-05-15',
        sponsorDeathConditions: true,
      },
    };

    const transformed = JSON.parse(transformForSubmit(formConfig, testData));

    expect(transformed.veteran.sponsorIsDeceased).to.be.true;
    expect(transformed.veteran.dateOfDeath).to.equal('05-15-2022');
    expect(transformed.veteran.isActiveServiceDeath).to.be.true;
  });

  it('should create appropriate certification object for applicant certifier', () => {
    const testData = {
      data: {
        certifierRole: 'applicant',
        certifierName: {
          first: 'Certifier',
          last: 'Jones',
        },
        certifierPhone: '1231231234',
        certifierEmail: 'certifier@email.gov',
      },
    };

    const transformed = JSON.parse(transformForSubmit(formConfig, testData));

    // When certifier is an applicant, certification should only have date
    expect(transformed.certification).to.have.property('date');
    expect(transformed.certification).to.not.have.property('lastName');
  });

  it('should create appropriate certification object for non-applicant certifier', () => {
    const testData = {
      data: {
        certifierRole: 'other',
        certifierName: {
          first: 'Certifier',
          last: 'Jones',
        },
        certifierPhone: '1231231234',
        certifierEmail: 'certifier@email.gov',
      },
    };

    const transformed = JSON.parse(transformForSubmit(formConfig, testData));

    // When certifier is not an applicant, certification should have all fields
    expect(transformed.certification).to.have.property('date');
    expect(transformed.certification).to.have.property('lastName');
    expect(transformed.certification).to.have.property('firstName');
    expect(transformed.certification).to.have.property('phoneNumber');
    expect(transformed.certification.lastName).to.equal('Jones');
  });

  it('should set the correct form ID in output JSON', () => {
    const testData = {
      data: {
        sponsorName: {
          first: 'Joe',
          last: 'Johnson',
        },
      },
    };

    const transformed = JSON.parse(transformForSubmit(formConfig, testData));

    expect(transformed.formNumber).to.equal(formConfig.formId);
  });

  it('should include statement of truth signature in output', () => {
    const testData = {
      data: {
        statementOfTruthSignature: 'Certifier Jones',
      },
    };

    const transformed = JSON.parse(transformForSubmit(formConfig, testData));

    expect(typeof transformed.statementOfTruthSignature).to.eq('string');
    expect(transformed.statementOfTruthSignature.length > 0).to.be.true;
  });

  it('should set certifier role in output', () => {
    const testData = {
      data: {
        certifierRole: 'other',
        certifierName: {
          first: 'Certifier',
          last: 'Jones',
        },
      },
    };

    const transformed = JSON.parse(transformForSubmit(formConfig, testData));

    expect(transformed.certifierRole).to.equal('other');
  });

  it('should map `sponsorEmail` into veteran data', () => {
    const testData = { data: { sponsorEmail: 'veteran@example.com' } };
    const { veteran } = JSON.parse(transformForSubmit(formConfig, testData));
    expect(veteran.email).to.equal('veteran@example.com');
  });

  it('should default veteran email to empty string when `sponsorEmail` is omitted', () => {
    const testData = { data: {} };
    const { veteran } = JSON.parse(transformForSubmit(formConfig, testData));
    expect(veteran.email).to.equal('');
  });

  context('address formatting', () => {
    it('should properly format sponsor address fields when hydrated into "Veteran" object', () => {
      const testData = {
        data: {
          [SHARED_ADDRESS_FIELD_NAME]: NOT_SHARED,
          sponsorAddress: {
            street: '123 Main Street',
            street2: 'Suite 200',
            city: 'Anytown',
            state: 'MD',
            postalCode: '12345',
            country: 'USA',
          },
        },
      };
      const transformed = JSON.parse(transformForSubmit(formConfig, testData));
      const { address } = transformed.veteran;
      expect(address.streetCombined).to.contain('123 Main Street');
      expect(address.streetCombined).to.contain('Suite 200');
      expect(address.street).to.equal('123 Main Street');
      expect(address.city).to.equal('Anytown');
      expect(address.state).to.equal('MD');
      expect(address.postalCode).to.equal('12345');
    });

    it('should rehydrate certifier address from original form data for non-applicant certifiers', () => {
      const certifierAddress = makeAddress({
        street: '321 Certifier Blvd',
        city: 'Baltimore',
        state: 'MD',
        postalCode: '12345',
      });
      const testData = {
        data: {
          certifierRole: 'other',
          certifierName: { first: 'John', last: 'Smith' },
          certifierAddress,
        },
      };
      const transformed = JSON.parse(transformForSubmit(formConfig, testData));
      const certifier = transformed.certification;
      expect(certifier.streetAddress).to.contain('321 Certifier Blvd');
      expect(certifier.city).to.equal('Baltimore');
      expect(certifier.state).to.equal('MD');
      expect(certifier.postalCode).to.equal('12345');
    });

    it('should rehydrate sponsor address from original form data after shared-address selection strips inactive page data', () => {
      const sponsorAddress = makeAddress({
        street: '789 Sponsor Ln',
        city: 'Sponsor',
        state: 'MD',
        postalCode: '12345',
      });
      const testData = {
        data: {
          [SHARED_ADDRESS_FIELD_NAME]: JSON.stringify(sponsorAddress),
          sponsorAddress,
        },
      };
      const transformed = JSON.parse(transformForSubmit(formConfig, testData));
      const { address } = transformed.veteran;
      expect(address.street).to.equal('789 Sponsor Ln');
      expect(address.streetCombined).to.contain('789 Sponsor Ln');
    });

    it('should rehydrate each applicant address by index from original form data when shared selection is used', () => {
      const firstAddress = makeAddress({
        street: '111 First St',
        city: 'AppOne',
        state: 'MD',
        postalCode: '12345',
      });
      const secondAddress = makeAddress({
        street: '222 Second St',
        city: 'AppTwo',
        state: 'MD',
        postalCode: '12345',
      });
      const testData = {
        data: {
          applicants: [
            {
              applicantName: { first: 'Alpha', last: 'One' },
              applicantRelationshipToSponsor: 'child',
              'view:sharesAddressWith': JSON.stringify(firstAddress),
              applicantAddress: firstAddress,
            },
            {
              applicantName: { first: 'Beta', last: 'Two' },
              applicantRelationshipToSponsor: 'child',
              'view:sharesAddressWith': JSON.stringify(secondAddress),
              applicantAddress: secondAddress,
            },
          ],
        },
      };
      const transformed = JSON.parse(transformForSubmit(formConfig, testData));
      const address = index => transformed.applicants[index].applicantAddress;
      expect(address(0).street).to.equal('111 First St');
      expect(address(1).street).to.equal('222 Second St');
    });

    it('should strip "view:" fields from sponsor, certifier, and applicant addresses during rehydration', () => {
      const sponsorAddress = makeAddress({ street: '123 Sponsor St' }, true);
      const certifierAddress = makeAddress(
        { street: '456 Certifier St' },
        true,
      );
      const applicantAddress = makeAddress(
        { street: '789 Applicant St' },
        true,
      );
      const testData = {
        data: {
          certifierRole: 'other',
          certifierName: { first: 'John', last: 'Smith' },
          sponsorAddress,
          certifierAddress,
          applicants: [
            {
              applicantName: { first: 'Jane', last: 'Doe' },
              applicantRelationshipToSponsor: 'child',
              applicantAddress,
            },
          ],
        },
      };
      const transformed = JSON.parse(transformForSubmit(formConfig, testData));
      const vetAddress = transformed.veteran.address;
      const appAddress = transformed.applicants[0].applicantAddress;
      const certAddress = transformed.certification.streetAddress;
      expect(vetAddress).to.not.have.property('view:militaryBaseDescription');
      expect(vetAddress).to.not.have.property('view:customFlag');
      expect(appAddress).to.not.have.property('view:militaryBaseDescription');
      expect(appAddress).to.not.have.property('view:customFlag');
      expect(certAddress).to.contain('456 Certifier St');
    });

    it('should default sponsor address to empty object when omitted', () => {
      const testData = {
        data: {
          certifierRole: 'applicant',
          sponsorName: { first: 'Jane', last: 'Doe' },
          sponsorDob: '1990-01-01',
          sponsorSsn: '411111111',
          sponsorIsDeceased: true,
        },
      };
      const transformed = JSON.parse(transformForSubmit(formConfig, testData));
      expect(transformed.veteran.address).to.deep.equal({});
    });

    it('should keep applicantAddress undefined when original applicant address is omitted', () => {
      const testData = {
        data: {
          applicants: [
            {
              applicantName: { first: 'Jane', last: 'Doe' },
              applicantRelationshipToSponsor: 'child',
            },
          ],
        },
      };
      const transformed = JSON.parse(transformForSubmit(formConfig, testData));
      expect(transformed.applicants[0].applicantAddress).to.be.undefined;
    });
  });
});
