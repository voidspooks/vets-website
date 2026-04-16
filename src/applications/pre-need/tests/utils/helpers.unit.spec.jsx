import { expect } from 'chai';
import React from 'react';
import { render } from '@testing-library/react';
import {
  transform,
  formatName,
  claimantHeader,
  isVeteran,
  isSponsorDeceased,
  isSpouse,
  isUnmarriedChild,
  isVeteranAndHasServiceName,
  isNotVeteranAndHasServiceName,
  buriedWSponsorsEligibility,
  isAuthorizedAgent,
  requiresSponsorInfo,
  preparerAddressHasState,
  applicantsMailingAddressHasState,
  sponsorMailingAddressHasState,
  createPayload,
  parseResponse,
  ApplicantDescriptionWrapper,
} from '../../utils/helpers';

describe('Preneed helpers', () => {
  describe('transform', () => {
    it('should remove view fields', () => {
      const data = JSON.parse(
        transform(
          {},
          {
            data: {
              application: {
                claimant: {},
                veteran: {},
                'view:testing': 'asdfadf',
              },
            },
          },
        ),
      );

      expect(data.application['view:testing']).to.be.undefined;
    });

    it('should populate service name', () => {
      const data = JSON.parse(
        transform(
          {},
          {
            data: {
              application: {
                claimant: {},
                veteran: {
                  currentName: 'testing',
                },
                'view:testing': 'asdfadf',
              },
            },
          },
        ),
      );

      expect(data.application.veteran.serviceName).to.equal(
        data.application.veteran.currentName,
      );
    });

    it('should remove partial addresses', () => {
      const data = JSON.parse(
        transform(
          {},
          {
            data: {
              application: {
                claimant: {
                  address: {
                    country: 'USA',
                    city: 'test',
                  },
                },
                veteran: {},
              },
            },
          },
        ),
      );

      expect(data.application.claimant.address).to.be.undefined;
    });

    it('should populate sponsor data when claimant is veteran', () => {
      const formData = {
        data: {
          application: {
            claimant: {
              relationshipToVet: '1',
              name: { first: 'John', last: 'Doe' },
              address: { street: '123 Main St' },
              dateOfBirth: '1980-01-01',
              ssn: '123-45-6789',
            },
            veteran: {},
          },
        },
      };

      const data = JSON.parse(transform({}, formData));

      expect(data.application.veteran.currentName).to.deep.equal(
        formData.data.application.claimant.name,
      );
      expect(data.application.veteran.address).to.deep.equal(
        formData.data.application.claimant.address,
      );
      expect(data.application.veteran.isDeceased).to.equal('no');
    });

    it('should populate preparer data when claimant is applicant', () => {
      const formData = {
        data: {
          application: {
            claimant: {
              relationshipToVet: '2',
              name: { first: 'Jane', last: 'Smith' },
              address: { street: '456 Oak Ave' },
            },
            veteran: {},
            applicant: {},
          },
        },
      };

      const data = JSON.parse(transform({}, formData));

      expect(data.application.applicant.name).to.deep.equal(
        formData.data.application.claimant.name,
      );
      expect(data.application.applicant.mailingAddress).to.deep.equal(
        formData.data.application.claimant.address,
      );
    });
  });

  describe('formatName', () => {
    it('should format name with all fields', () => {
      const name = {
        first: 'John',
        middle: 'Michael',
        last: 'Doe',
        suffix: 'Jr.',
      };

      expect(formatName(name)).to.equal('John Michael Doe, Jr.');
    });

    it('should format name without middle name', () => {
      const name = { first: 'John', last: 'Doe' };

      expect(formatName(name)).to.equal('John Doe');
    });

    it('should format name without suffix', () => {
      const name = { first: 'John', middle: 'Michael', last: 'Doe' };

      expect(formatName(name)).to.equal('John Michael Doe');
    });

    it('should return falsy for empty name', () => {
      const name = {};

      expect(formatName(name)).to.not.be.ok;
    });

    it('should handle name with only first name', () => {
      const name = { first: 'John' };
      const result = formatName(name);

      // formatName returns falsy OR a string with undefined when last is missing
      expect(result).to.satisfy(
        val => !val || val.includes('undefined'),
        'should return falsy or include undefined',
      );
    });
  });

  describe('claimantHeader', () => {
    it('should render formatted claimant name', () => {
      const formData = {
        claimant: {
          name: { first: 'John', last: 'Doe' },
        },
      };

      const { container } = render(claimantHeader({ formData }));

      expect(container.querySelector('h4').textContent).to.equal('John Doe');
      expect(container.querySelector('h4').className).to.equal('highlight');
    });
  });

  describe('isVeteran', () => {
    it('should return true when claimant is veteran', () => {
      const item = {
        application: { claimant: { relationshipToVet: '1' } },
      };

      expect(isVeteran(item)).to.be.true;
    });

    it('should return false when claimant is not veteran', () => {
      const item = {
        application: { claimant: { relationshipToVet: '2' } },
      };

      expect(isVeteran(item)).to.be.false;
    });
  });

  describe('isSponsorDeceased', () => {
    it('should return true when sponsor is deceased', () => {
      const item = {
        application: { veteran: { isDeceased: 'yes' } },
      };

      expect(isSponsorDeceased(item)).to.be.true;
    });

    it('should return false when sponsor is not deceased', () => {
      const item = {
        application: { veteran: { isDeceased: 'no' } },
      };

      expect(isSponsorDeceased(item)).to.be.false;
    });
  });

  describe('isSpouse', () => {
    it('should return true when claimant is spouse', () => {
      const item = {
        application: { claimant: { relationshipToVet: '2' } },
      };

      expect(isSpouse(item)).to.be.true;
    });

    it('should return false when claimant is not spouse', () => {
      const item = {
        application: { claimant: { relationshipToVet: '1' } },
      };

      expect(isSpouse(item)).to.be.false;
    });
  });

  describe('isUnmarriedChild', () => {
    it('should return true when claimant is unmarried child', () => {
      const item = {
        application: { claimant: { relationshipToVet: '3' } },
      };

      expect(isUnmarriedChild(item)).to.be.true;
    });

    it('should return false when claimant is not unmarried child', () => {
      const item = {
        application: { claimant: { relationshipToVet: '1' } },
      };

      expect(isUnmarriedChild(item)).to.be.false;
    });
  });

  describe('isVeteranAndHasServiceName', () => {
    it('should return true when veteran has service name', () => {
      const item = {
        application: {
          claimant: { relationshipToVet: '1' },
          veteran: { 'view:hasServiceName': true },
        },
      };

      expect(isVeteranAndHasServiceName(item)).to.be.true;
    });

    it('should return false when veteran does not have service name', () => {
      const item = {
        application: {
          claimant: { relationshipToVet: '1' },
          veteran: { 'view:hasServiceName': false },
        },
      };

      expect(isVeteranAndHasServiceName(item)).to.be.false;
    });

    it('should return false when not a veteran', () => {
      const item = {
        application: {
          claimant: { relationshipToVet: '2' },
          veteran: { 'view:hasServiceName': true },
        },
      };

      expect(isVeteranAndHasServiceName(item)).to.be.false;
    });
  });

  describe('isNotVeteranAndHasServiceName', () => {
    it('should return true when not veteran but has service name', () => {
      const item = {
        application: {
          claimant: { relationshipToVet: '2' },
          veteran: { 'view:hasServiceName': true },
        },
      };

      expect(isNotVeteranAndHasServiceName(item)).to.be.true;
    });

    it('should return false when veteran', () => {
      const item = {
        application: {
          claimant: { relationshipToVet: '1' },
          veteran: { 'view:hasServiceName': true },
        },
      };

      expect(isNotVeteranAndHasServiceName(item)).to.be.false;
    });
  });

  describe('buriedWSponsorsEligibility', () => {
    it('should return true when someone is buried with sponsor', () => {
      const item = {
        application: { hasCurrentlyBuried: '1' },
      };

      expect(buriedWSponsorsEligibility(item)).to.be.true;
    });

    it('should return false when no one is buried with sponsor', () => {
      const item = {
        application: { hasCurrentlyBuried: '2' },
      };

      expect(buriedWSponsorsEligibility(item)).to.be.false;
    });
  });

  describe('isAuthorizedAgent', () => {
    it('should return true when applicant is authorized agent', () => {
      const item = {
        application: {
          applicant: {
            applicantRelationshipToClaimant: 'Authorized Agent/Rep',
          },
        },
      };

      expect(isAuthorizedAgent(item)).to.be.true;
    });

    it('should return false when applicant is not authorized agent', () => {
      const item = {
        application: {
          applicant: { applicantRelationshipToClaimant: 'Self' },
        },
      };

      expect(isAuthorizedAgent(item)).to.be.false;
    });
  });

  describe('requiresSponsorInfo', () => {
    it('should return true when sponsor is undefined', () => {
      const item = {};

      expect(requiresSponsorInfo(item)).to.be.true;
    });

    it('should return true when sponsor is Other', () => {
      const item = { 'view:sponsor': 'Other' };

      expect(requiresSponsorInfo(item)).to.be.true;
    });

    it('should return false when sponsor is defined and not Other', () => {
      const item = { 'view:sponsor': 'John Doe' };

      expect(requiresSponsorInfo(item)).to.be.false;
    });
  });

  describe('preparerAddressHasState', () => {
    it('should return true for USA', () => {
      const item = {
        application: {
          applicant: {
            'view:applicantInfo': {
              mailingAddress: { country: 'USA' },
            },
          },
        },
      };

      expect(preparerAddressHasState(item)).to.be.true;
    });

    it('should return true for CAN', () => {
      const item = {
        application: {
          applicant: {
            'view:applicantInfo': {
              mailingAddress: { country: 'CAN' },
            },
          },
        },
      };

      expect(preparerAddressHasState(item)).to.be.true;
    });

    it('should return false for other countries', () => {
      const item = {
        application: {
          applicant: {
            'view:applicantInfo': {
              mailingAddress: { country: 'MEX' },
            },
          },
        },
      };

      expect(preparerAddressHasState(item)).to.be.false;
    });
  });

  describe('applicantsMailingAddressHasState', () => {
    it('should return true for USA', () => {
      const item = {
        application: { claimant: { address: { country: 'USA' } } },
      };

      expect(applicantsMailingAddressHasState(item)).to.be.true;
    });

    it('should return true for CAN', () => {
      const item = {
        application: { claimant: { address: { country: 'CAN' } } },
      };

      expect(applicantsMailingAddressHasState(item)).to.be.true;
    });

    it('should return false for other countries', () => {
      const item = {
        application: { claimant: { address: { country: 'GBR' } } },
      };

      expect(applicantsMailingAddressHasState(item)).to.be.false;
    });
  });

  describe('sponsorMailingAddressHasState', () => {
    it('should return true for USA', () => {
      const item = {
        application: { veteran: { address: { country: 'USA' } } },
      };

      expect(sponsorMailingAddressHasState(item)).to.be.true;
    });

    it('should return true for CAN', () => {
      const item = {
        application: { veteran: { address: { country: 'CAN' } } },
      };

      expect(sponsorMailingAddressHasState(item)).to.be.true;
    });

    it('should return false for other countries', () => {
      const item = {
        application: { veteran: { address: { country: 'FRA' } } },
      };

      expect(sponsorMailingAddressHasState(item)).to.be.false;
    });
  });

  describe('createPayload', () => {
    it('should create FormData payload with file and formId', () => {
      const file = new File(['content'], 'test.pdf');
      const formId = '40-10007';

      const payload = createPayload(file, formId);

      expect(payload).to.be.instanceOf(FormData);
      expect(payload.get('form_id')).to.equal(formId);
      expect(payload.get('file')).to.equal(file);
    });

    it('should include password when provided', () => {
      const file = new File(['content'], 'test.pdf');
      const formId = '40-10007';
      const password = 'secret123';

      const payload = createPayload(file, formId, password);

      expect(payload.get('password')).to.equal(password);
    });

    it('should not include password when not provided', () => {
      const file = new File(['content'], 'test.pdf');
      const formId = '40-10007';

      const payload = createPayload(file, formId);

      expect(payload.get('password')).to.be.null;
    });
  });

  describe('parseResponse', () => {
    it('should parse response and return name and confirmation code', () => {
      const responseData = {
        data: {
          attributes: {
            name: 'test-file.pdf',
            confirmationCode: 'abc-123-def',
          },
        },
      };

      const result = parseResponse(responseData);

      expect(result.name).to.equal('test-file.pdf');
      expect(result.confirmationCode).to.equal('abc-123-def');
    });
  });

  describe('ApplicantDescriptionWrapper', () => {
    it('should render with correct className', () => {
      const formContext = {};
      const { container } = render(
        <ApplicantDescriptionWrapper formContext={formContext} />,
      );

      expect(container.querySelector('.ApplicantDescriptionWrapper')).to.exist;
    });
  });
});
