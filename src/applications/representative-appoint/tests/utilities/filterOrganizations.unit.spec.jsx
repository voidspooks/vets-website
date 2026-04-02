import { expect } from 'chai';
import { filterOrganizations } from '../../utilities/helpers';

describe('filterOrganizations', () => {
  it('should return all organizations if representativeSubmissionMethod is not "digital"', () => {
    const formData = {
      representativeSubmissionMethod: 'mail',
      'view:selectedRepresentative': {
        attributes: {
          accreditedOrganizations: {
            data: [
              {
                id: 1,
                attributes: {
                  name: 'Org 1',
                  canAcceptDigitalPoaRequests: true,
                },
              },
              {
                id: 2,
                attributes: {
                  name: 'Org 2',
                  canAcceptDigitalPoaRequests: false,
                },
              },
            ],
          },
        },
      },
    };

    const result = filterOrganizations(formData);

    expect(result).to.have.lengthOf(2);
    expect(result[0].attributes.name).to.equal('Org 1');
    expect(result[1].attributes.name).to.equal('Org 2');
  });

  it('should return only organizations that can accept digital POA requests if representativeSubmissionMethod is "digital"', () => {
    const formData = {
      representativeSubmissionMethod: 'digital',
      'view:selectedRepresentative': {
        attributes: {
          accreditedOrganizations: {
            data: [
              {
                id: 1,
                attributes: {
                  name: 'Org 1',
                  canAcceptDigitalPoaRequests: true,
                },
              },
              {
                id: 2,
                attributes: {
                  name: 'Org 2',
                  canAcceptDigitalPoaRequests: false,
                },
              },
              {
                id: 3,
                attributes: {
                  name: 'Org 3',
                  canAcceptDigitalPoaRequests: true,
                },
              },
            ],
          },
        },
      },
    };

    const result = filterOrganizations(formData);

    expect(result).to.have.lengthOf(2);
    expect(result[0].attributes.name).to.equal('Org 1');
    expect(result[1].attributes.name).to.equal('Org 3');
  });

  it('should return an empty array if no organizations can accept digital POA requests and representativeSubmissionMethod is "digital"', () => {
    const formData = {
      representativeSubmissionMethod: 'digital',
      'view:selectedRepresentative': {
        attributes: {
          accreditedOrganizations: {
            data: [
              {
                id: 1,
                attributes: {
                  name: 'Org 1',
                  canAcceptDigitalPoaRequests: false,
                },
              },
              {
                id: 2,
                attributes: {
                  name: 'Org 2',
                  canAcceptDigitalPoaRequests: false,
                },
              },
            ],
          },
        },
      },
    };

    const result = filterOrganizations(formData);

    expect(result).to.be.an('array').that.is.empty;
  });

  context('when individualAcceptEnabled is true', () => {
    it('should return only organizations with both canAcceptDigitalPoaRequests and repsCanAcceptAnyRequest true for digital submission', () => {
      const formData = {
        representativeSubmissionMethod: 'digital',
        'view:individualAcceptEnabled': true,
        'view:selectedRepresentative': {
          attributes: {
            accreditedOrganizations: {
              data: [
                {
                  id: 1,
                  attributes: {
                    name: 'Org 1',
                    canAcceptDigitalPoaRequests: true,
                    repsCanAcceptAnyRequest: true,
                  },
                },
                {
                  id: 2,
                  attributes: {
                    name: 'Org 2',
                    canAcceptDigitalPoaRequests: true,
                    repsCanAcceptAnyRequest: false,
                  },
                },
                {
                  id: 3,
                  attributes: {
                    name: 'Org 3',
                    canAcceptDigitalPoaRequests: true,
                  },
                },
              ],
            },
          },
        },
      };

      const result = filterOrganizations(formData);

      expect(result).to.have.lengthOf(1);
      expect(result[0].attributes.name).to.equal('Org 1');
    });

    it('should return all organizations for non-digital submission', () => {
      const formData = {
        representativeSubmissionMethod: 'mail',
        'view:individualAcceptEnabled': true,
        'view:selectedRepresentative': {
          attributes: {
            accreditedOrganizations: {
              data: [
                {
                  id: 1,
                  attributes: {
                    name: 'Org 1',
                    canAcceptDigitalPoaRequests: true,
                    repsCanAcceptAnyRequest: false,
                  },
                },
                {
                  id: 2,
                  attributes: {
                    name: 'Org 2',
                    canAcceptDigitalPoaRequests: false,
                  },
                },
              ],
            },
          },
        },
      };

      const result = filterOrganizations(formData);

      expect(result).to.have.lengthOf(2);
    });
  });
});
