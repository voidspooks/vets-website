import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import formConfig, {
  applicantMailingAddressStateTitleWrapper,
  preparerMailingAddressStateTitleWrapper,
  sponsorMailingAddressStateTitleWrapper,
  applicantContactInfoWrapper,
} from '../../config/form';

const createMockStore = (data = {}) => ({
  getState: () => ({
    form: {
      data: {
        application: {
          claimant: {
            relationshipToVet: '1',
            address: { country: 'USA' },
            ...data,
          },
        },
      },
    },
  }),
  subscribe: () => {},
  dispatch: () => {},
});

describe('pre-need form config', () => {
  it('should have required form properties', () => {
    expect(formConfig.formId).to.equal('40-10007');
    expect(formConfig.version).to.equal(0);
    expect(formConfig.prefillEnabled).to.be.true;
    expect(formConfig.verifyRequiredPrefill).to.be.false;
  });

  it('should have correct URLs', () => {
    expect(formConfig.rootUrl).to.exist;
    expect(formConfig.urlPrefix).to.equal('/');
    expect(formConfig.submitUrl).to.include(
      '/simple_forms_api/v1/simple_forms',
    );
  });

  it('should have tracking prefix', () => {
    expect(formConfig.trackingPrefix).to.equal('preneed-');
  });

  it('should have save in progress messages', () => {
    expect(formConfig.saveInProgress).to.exist;
    expect(formConfig.saveInProgress.messages).to.exist;
    expect(formConfig.saveInProgress.messages.inProgress).to.include(
      'pre-need determination of eligibility',
    );
    expect(formConfig.saveInProgress.messages.saved).to.include(
      'has been saved',
    );
    expect(formConfig.saveInProgress.messages.expired).to.include('expired');
  });

  it('should have saved form messages', () => {
    expect(formConfig.savedFormMessages).to.exist;
    expect(formConfig.savedFormMessages.notFound).to.exist;
    expect(formConfig.savedFormMessages.noAuth).to.exist;
  });

  it('should have title and subtitle', () => {
    expect(formConfig.title).to.equal(
      'Apply for pre-need eligibility determination',
    );
    expect(formConfig.subTitle).to.equal('Form 40-10007');
  });

  it('should have custom components', () => {
    expect(formConfig.introduction).to.exist;
    expect(formConfig.confirmation).to.exist;
    expect(formConfig.getHelp).to.exist;
    expect(formConfig.errorText).to.exist;
    expect(formConfig.submissionError).to.exist;
  });

  it('should have transformForSubmit function', () => {
    expect(formConfig.transformForSubmit).to.be.a('function');
  });

  it('should have default definitions', () => {
    expect(formConfig.defaultDefinitions).to.exist;
    expect(formConfig.defaultDefinitions).to.be.an('object');
    // Check that some key definitions are present
    const definitionKeys = Object.keys(formConfig.defaultDefinitions);
    expect(definitionKeys.length).to.be.greaterThan(0);
    expect(definitionKeys).to.include.members([
      'ssn',
      'date',
      'email',
      'phone',
    ]);
  });

  describe('chapters', () => {
    it('should have applicantInformation chapter', () => {
      expect(formConfig.chapters.applicantInformation).to.exist;
      expect(formConfig.chapters.applicantInformation.title).to.equal(
        'Applicant information',
      );
    });

    it('should have applicantRelationshipToVet page', () => {
      const page =
        formConfig.chapters.applicantInformation.pages
          .applicantRelationshipToVet;
      expect(page).to.exist;
      expect(page.path).to.equal('applicant-relationship-to-vet');
      expect(page.uiSchema).to.exist;
      expect(page.schema).to.exist;
    });

    it('should have veteranApplicantDetails page with depends', () => {
      const page =
        formConfig.chapters.applicantInformation.pages.veteranApplicantDetails;
      expect(page).to.exist;
      expect(page.path).to.equal('veteran-applicant-details');
      expect(page.depends).to.be.a('function');
      expect(page.uiSchema).to.exist;
      expect(page.schema).to.exist;
    });

    it('should have nonVeteranApplicantDetails page with depends', () => {
      const page =
        formConfig.chapters.applicantInformation.pages
          .nonVeteranApplicantDetails;
      expect(page).to.exist;
      expect(page.path).to.equal('nonVeteran-applicant-details');
      expect(page.depends).to.be.a('function');
      expect(page.uiSchema).to.exist;
      expect(page.schema).to.exist;
    });

    it('should have applicantDemographics page', () => {
      const page =
        formConfig.chapters.applicantInformation.pages.applicantDemographics;
      expect(page).to.exist;
      expect(page.title).to.equal('Applicant demographics');
      expect(page.uiSchema).to.exist;
      expect(page.schema).to.exist;
    });

    it('should have militaryHistory chapter', () => {
      expect(formConfig.chapters.militaryHistory).to.exist;
      expect(formConfig.chapters.militaryHistory.title).to.exist;
    });

    it('should have sponsorInformation chapter', () => {
      expect(formConfig.chapters.sponsorInformation).to.exist;
      expect(formConfig.chapters.sponsorInformation.title).to.exist;
    });

    it('should have burialBenefits chapter', () => {
      expect(formConfig.chapters.burialBenefits).to.exist;
      expect(formConfig.chapters.burialBenefits.title).to.exist;
    });

    it('should have supportingDocuments chapter', () => {
      expect(formConfig.chapters.supportingDocuments).to.exist;
      expect(formConfig.chapters.supportingDocuments.title).to.exist;
    });

    it('should have contactInformation chapter', () => {
      expect(formConfig.chapters.contactInformation).to.exist;
      expect(formConfig.chapters.contactInformation.title).to.exist;
    });
  });

  describe('page dependencies', () => {
    it('veteranApplicantDetails should depend on isVeteran', () => {
      const page =
        formConfig.chapters.applicantInformation.pages.veteranApplicantDetails;
      const veteranFormData = {
        application: { claimant: { relationshipToVet: '1' } },
      };
      const nonVeteranFormData = {
        application: { claimant: { relationshipToVet: '2' } },
      };

      expect(page.depends(veteranFormData)).to.be.true;
      expect(page.depends(nonVeteranFormData)).to.be.false;
    });

    it('nonVeteranApplicantDetails should depend on not isVeteran', () => {
      const page =
        formConfig.chapters.applicantInformation.pages
          .nonVeteranApplicantDetails;
      const veteranFormData = {
        application: { claimant: { relationshipToVet: '1' } },
      };
      const nonVeteranFormData = {
        application: { claimant: { relationshipToVet: '2' } },
      };

      expect(page.depends(veteranFormData)).to.be.false;
      expect(page.depends(nonVeteranFormData)).to.be.true;
    });

    it('sponsorDetails should depend on not isVeteran', () => {
      const page = formConfig.chapters.sponsorInformation.pages.sponsorDetails;
      const veteranFormData = {
        application: { claimant: { relationshipToVet: '1' } },
      };
      const nonVeteranFormData = {
        application: { claimant: { relationshipToVet: '2' } },
      };

      expect(page.depends(veteranFormData)).to.be.false;
      expect(page.depends(nonVeteranFormData)).to.be.true;
    });

    it('sponsorDemographics should depend on not isVeteran', () => {
      const page =
        formConfig.chapters.sponsorInformation.pages.sponsorDemographics;
      const nonVeteranFormData = {
        application: { claimant: { relationshipToVet: '2' } },
      };

      expect(page.depends(nonVeteranFormData)).to.be.true;
    });

    it('sponsorDeceased should depend on not isVeteran', () => {
      const page = formConfig.chapters.sponsorInformation.pages.sponsorDeceased;
      const nonVeteranFormData = {
        application: { claimant: { relationshipToVet: '2' } },
      };

      expect(page.depends(nonVeteranFormData)).to.be.true;
    });

    it('sponsorDateOfDeath should depend on not isVeteran and isSponsorDeceased', () => {
      const page =
        formConfig.chapters.sponsorInformation.pages.sponsorDateOfDeath;
      const sponsorDeceasedData = {
        application: {
          claimant: { relationshipToVet: '2' },
          veteran: { isDeceased: 'yes' },
        },
      };
      const sponsorAliveData = {
        application: {
          claimant: { relationshipToVet: '2' },
          veteran: { isDeceased: 'no' },
        },
      };

      expect(page.depends(sponsorDeceasedData)).to.be.true;
      expect(page.depends(sponsorAliveData)).to.be.false;
    });

    it('sponsorMilitaryDetails should depend on not isVeteran', () => {
      const page =
        formConfig.chapters.sponsorInformation.pages.sponsorMilitaryDetails;
      const nonVeteranFormData = {
        application: { claimant: { relationshipToVet: '2' } },
      };

      expect(page.depends(nonVeteranFormData)).to.be.true;
    });

    it('applicantDemographics should depend on isVeteran', () => {
      const page =
        formConfig.chapters.applicantInformation.pages.applicantDemographics;
      const veteranFormData = {
        application: { claimant: { relationshipToVet: '1' } },
      };

      expect(page.depends(veteranFormData)).to.be.true;
    });

    it('militaryDetails should depend on isVeteran', () => {
      const page =
        formConfig.chapters.applicantInformation.pages.militaryDetails;
      const veteranFormData = {
        application: { claimant: { relationshipToVet: '1' } },
      };

      expect(page.depends(veteranFormData)).to.be.true;
    });

    it('applicantMilitaryHistory should depend on isVeteran', () => {
      const page =
        formConfig.chapters.militaryHistory.pages.applicantMilitaryHistory;
      const veteranFormData = {
        application: { claimant: { relationshipToVet: '1' } },
      };

      expect(page.depends(veteranFormData)).to.be.true;
    });

    it('applicantMilitaryName should depend on isVeteran', () => {
      const page =
        formConfig.chapters.militaryHistory.pages.applicantMilitaryName;
      const veteranFormData = {
        application: { claimant: { relationshipToVet: '1' } },
      };

      expect(page.depends(veteranFormData)).to.be.true;
    });

    it('applicantMilitaryNameInformation should depend on isVeteranAndHasServiceName', () => {
      const page =
        formConfig.chapters.militaryHistory.pages
          .applicantMilitaryNameInformation;
      const withServiceNameData = {
        application: {
          claimant: { relationshipToVet: '1' },
          veteran: {
            'view:hasServiceName': true,
          },
        },
      };

      expect(page.depends(withServiceNameData)).to.be.true;
    });

    it('sponsorMilitaryHistory should depend on not isVeteran', () => {
      const page =
        formConfig.chapters.militaryHistory.pages.sponsorMilitaryHistory;
      const nonVeteranFormData = {
        application: { claimant: { relationshipToVet: '2' } },
      };

      expect(page.depends(nonVeteranFormData)).to.be.true;
    });

    it('sponsorMilitaryName should depend on not isVeteran', () => {
      const page =
        formConfig.chapters.militaryHistory.pages.sponsorMilitaryName;
      const nonVeteranFormData = {
        application: { claimant: { relationshipToVet: '2' } },
      };

      expect(page.depends(nonVeteranFormData)).to.be.true;
    });

    it('sponsorMilitaryNameInformation should depend on isNotVeteranAndHasServiceName', () => {
      const page =
        formConfig.chapters.militaryHistory.pages
          .sponsorMilitaryNameInformation;
      const withServiceNameData = {
        application: {
          claimant: { relationshipToVet: '2' },
          veteran: {
            'view:hasServiceName': true,
          },
        },
      };

      expect(page.depends(withServiceNameData)).to.be.true;
    });

    it('currentlyBuriedPersons should depend on buriedWSponsorsEligibility', () => {
      const page =
        formConfig.chapters.burialBenefits.pages.currentlyBuriedPersons;
      const eligibleData = {
        application: {
          claimant: {
            desiredCemetery: '915',
          },
          hasCurrentlyBuried: '1',
        },
      };

      expect(page.depends(eligibleData)).to.be.true;
    });

    it('sponsorMailingAddress should depend on not isVeteran', () => {
      const page =
        formConfig.chapters.contactInformation.pages.sponsorMailingAddress;
      const nonVeteranFormData = {
        application: { claimant: { relationshipToVet: '2' } },
      };

      expect(page.depends(nonVeteranFormData)).to.be.true;
    });

    it('preparerDetails should depend on isAuthorizedAgent', () => {
      const page = formConfig.chapters.contactInformation.pages.preparerDetails;
      const preparerData = {
        application: {
          applicant: {
            applicantRelationshipToClaimant: 'Authorized Agent/Rep',
          },
        },
      };

      expect(page.depends(preparerData)).to.be.true;
    });

    it('preparerContactDetails should depend on isAuthorizedAgent', () => {
      const page =
        formConfig.chapters.contactInformation.pages.preparerContactDetails;
      const preparerData = {
        application: {
          applicant: {
            applicantRelationshipToClaimant: 'Authorized Agent/Rep',
          },
        },
      };

      expect(page.depends(preparerData)).to.be.true;
    });
  });

  describe('dev configuration', () => {
    it('should have dev settings', () => {
      expect(formConfig.dev).to.exist;
      expect(formConfig.dev.showNavLinks).to.be.true;
      expect(formConfig.dev.collapsibleNavLinks).to.be.true;
    });
  });

  describe('preSubmitInfo', () => {
    it('should have preSubmitInfo', () => {
      expect(formConfig.preSubmitInfo).to.exist;
    });
  });

  describe('footerContent', () => {
    it('should have footerContent function', () => {
      expect(formConfig.footerContent).to.be.a('function');
    });

    it('should return footer component', () => {
      const currentLocation = { pathname: '/test' };
      const footer = formConfig.footerContent({ currentLocation });

      expect(footer).to.exist;
    });
  });

  describe('exported components', () => {
    it('should export applicantMailingAddressStateTitleWrapper', () => {
      expect(applicantMailingAddressStateTitleWrapper).to.exist;
      expect(React.isValidElement(applicantMailingAddressStateTitleWrapper)).to
        .be.true;
    });

    it('should export preparerMailingAddressStateTitleWrapper', () => {
      expect(preparerMailingAddressStateTitleWrapper).to.exist;
      expect(React.isValidElement(preparerMailingAddressStateTitleWrapper)).to
        .be.true;
    });

    it('should export sponsorMailingAddressStateTitleWrapper', () => {
      expect(sponsorMailingAddressStateTitleWrapper).to.exist;
      expect(React.isValidElement(sponsorMailingAddressStateTitleWrapper)).to.be
        .true;
    });

    it('should export applicantContactInfoWrapper', () => {
      expect(applicantContactInfoWrapper).to.exist;
      expect(React.isValidElement(applicantContactInfoWrapper)).to.be.true;
    });

    it('should render applicantMailingAddressStateTitleWrapper with USA', () => {
      const { container } = render(
        <Provider store={createMockStore()}>
          {applicantMailingAddressStateTitleWrapper}
        </Provider>,
      );
      expect(container.textContent).to.include('State');
    });

    it('should render applicantMailingAddressStateTitleWrapper with Canada', () => {
      const mockStore = createMockStore({ address: { country: 'CAN' } });
      const { container } = render(
        <Provider store={mockStore}>
          {applicantMailingAddressStateTitleWrapper}
        </Provider>,
      );
      expect(container.textContent).to.include('Province');
    });

    it('should render preparerMailingAddressStateTitleWrapper', () => {
      const { container } = render(
        <Provider store={createMockStore()}>
          {preparerMailingAddressStateTitleWrapper}
        </Provider>,
      );
      expect(container.textContent).to.include('State');
    });

    it('should render sponsorMailingAddressStateTitleWrapper', () => {
      const { container } = render(
        <Provider store={createMockStore()}>
          {sponsorMailingAddressStateTitleWrapper}
        </Provider>,
      );
      expect(container.textContent).to.include('State');
    });

    it('should render applicantContactInfoWrapper for veteran', () => {
      const mockStore = createMockStore({ relationshipToVet: '1' });
      const { container } = render(
        <Provider store={mockStore}>{applicantContactInfoWrapper}</Provider>,
      );
      expect(container).to.exist;
    });

    it('should render applicantContactInfoWrapper for non-veteran', () => {
      const mockStore = createMockStore({ relationshipToVet: '2' });
      const { container } = render(
        <Provider store={mockStore}>{applicantContactInfoWrapper}</Provider>,
      );
      expect(container).to.exist;
    });
  });

  describe('additional pages', () => {
    it('should have sponsorDetails page with dependency', () => {
      const page = formConfig.chapters.sponsorInformation.pages.sponsorDetails;
      expect(page).to.exist;
      expect(page.title).to.equal('Sponsor details');
      expect(page.path).to.equal('sponsor-details');
      expect(page.depends).to.be.a('function');
    });

    it('should have sponsorDemographics page', () => {
      const page =
        formConfig.chapters.sponsorInformation.pages.sponsorDemographics;
      expect(page).to.exist;
      expect(page.title).to.equal('Sponsor demographics');
      expect(page.depends).to.be.a('function');
    });

    it('should have sponsorDeceased page', () => {
      const page = formConfig.chapters.sponsorInformation.pages.sponsorDeceased;
      expect(page).to.exist;
      expect(page.path).to.equal('sponsor-deceased');
      expect(page.depends).to.be.a('function');
    });

    it('should have sponsorDateOfDeath page with complex dependency', () => {
      const page =
        formConfig.chapters.sponsorInformation.pages.sponsorDateOfDeath;
      expect(page).to.exist;
      expect(page.path).to.equal('sponsor-date-of-death');
      expect(page.depends).to.be.a('function');
    });

    it('should have sponsorMilitaryDetails page', () => {
      const page =
        formConfig.chapters.sponsorInformation.pages.sponsorMilitaryDetails;
      expect(page).to.exist;
      expect(page.title).to.equal("Sponsor's military details");
    });

    it('should have applicantMilitaryHistory page', () => {
      const page =
        formConfig.chapters.militaryHistory.pages.applicantMilitaryHistory;
      expect(page).to.exist;
      expect(page.title).to.equal('Service period(s)');
      expect(page.depends).to.be.a('function');
    });

    it('should have applicantMilitaryName page', () => {
      const page =
        formConfig.chapters.militaryHistory.pages.applicantMilitaryName;
      expect(page).to.exist;
      expect(page.path).to.equal('applicant-military-name');
      expect(page.depends).to.be.a('function');
    });

    it('should have applicantMilitaryNameInformation page', () => {
      const page =
        formConfig.chapters.militaryHistory.pages
          .applicantMilitaryNameInformation;
      expect(page).to.exist;
      expect(page.title).to.equal('Previous name');
      expect(page.depends).to.be.a('function');
    });

    it('should have sponsorMilitaryHistory page', () => {
      const page =
        formConfig.chapters.militaryHistory.pages.sponsorMilitaryHistory;
      expect(page).to.exist;
      expect(page.title).to.include('Sponsor');
      expect(page.title).to.include('service period');
      expect(page.depends).to.be.a('function');
    });

    it('should have sponsorMilitaryName page', () => {
      const page =
        formConfig.chapters.militaryHistory.pages.sponsorMilitaryName;
      expect(page).to.exist;
      expect(page.path).to.equal('sponsor-military-name');
      expect(page.depends).to.be.a('function');
    });

    it('should have sponsorMilitaryNameInformation page', () => {
      const page =
        formConfig.chapters.militaryHistory.pages
          .sponsorMilitaryNameInformation;
      expect(page).to.exist;
      expect(page.title).to.include('Sponsor');
      expect(page.title).to.include('previous name');
      expect(page.depends).to.be.a('function');
    });

    it('should have burialBenefits page', () => {
      const page = formConfig.chapters.burialBenefits.pages.burialBenefits;
      expect(page).to.exist;
      expect(page.path).to.equal('burial-benefits');
      expect(page.uiSchema).to.exist;
      expect(page.schema).to.exist;
    });

    it('should have currentlyBuriedPersons page with dependency', () => {
      const page =
        formConfig.chapters.burialBenefits.pages.currentlyBuriedPersons;
      expect(page).to.exist;
      expect(page.title).to.equal('Name of deceased person(s)');
      expect(page.path).to.equal('current-burial-benefits');
      expect(page.depends).to.be.a('function');
    });

    it('should have supportingDocuments page', () => {
      const page =
        formConfig.chapters.supportingDocuments.pages.supportingDocuments;
      expect(page).to.exist;
      expect(page.title).to.equal('Upload supporting files');
      expect(page.path).to.equal('supporting-documents');
      expect(page.editModeOnReviewPage).to.be.false;
    });

    it('should have applicantContactInformation page', () => {
      const page =
        formConfig.chapters.contactInformation.pages
          .applicantContactInformation;
      expect(page).to.exist;
      expect(page.title).to.include('Applicant');
      expect(page.title).to.include('contact information');
      expect(page.path).to.equal('applicant-contact-information');
    });

    it('should have sponsorMailingAddress page with dependency', () => {
      const page =
        formConfig.chapters.contactInformation.pages.sponsorMailingAddress;
      expect(page).to.exist;
      expect(page.title).to.include('Sponsor');
      expect(page.title).to.include('mailing address');
      expect(page.path).to.equal('sponsor-mailing-address');
      expect(page.depends).to.be.a('function');
    });

    it('should have preparer page', () => {
      const page = formConfig.chapters.contactInformation.pages.preparer;
      expect(page).to.exist;
      expect(page.path).to.equal('preparer');
      expect(page.uiSchema).to.exist;
      expect(page.schema).to.exist;
    });

    it('should have preparerDetails page with dependency', () => {
      const page = formConfig.chapters.contactInformation.pages.preparerDetails;
      expect(page).to.exist;
      expect(page.title).to.equal('Preparer details');
      expect(page.path).to.equal('preparer-details');
      expect(page.depends).to.be.a('function');
    });

    it('should have preparerContactDetails page with dependency', () => {
      const page =
        formConfig.chapters.contactInformation.pages.preparerContactDetails;
      expect(page).to.exist;
      expect(page.title).to.equal('Preparer contact details');
      expect(page.path).to.equal('preparer-contact-details');
      expect(page.depends).to.be.a('function');
    });
  });

  describe('uiSchema and schema validation', () => {
    it('should have valid uiSchema for all pages', () => {
      Object.keys(formConfig.chapters).forEach(chapterKey => {
        const chapter = formConfig.chapters[chapterKey];
        Object.keys(chapter.pages).forEach(pageKey => {
          const page = chapter.pages[pageKey];
          expect(page.uiSchema).to.exist;
        });
      });
    });

    it('should have valid schema for all pages', () => {
      Object.keys(formConfig.chapters).forEach(chapterKey => {
        const chapter = formConfig.chapters[chapterKey];
        Object.keys(chapter.pages).forEach(pageKey => {
          const page = chapter.pages[pageKey];
          expect(page.schema).to.exist;
        });
      });
    });
  });

  describe('militaryDetails page', () => {
    it('should have militaryDetails page with dependency', () => {
      const page =
        formConfig.chapters.applicantInformation.pages.militaryDetails;
      expect(page).to.exist;
      expect(page.title).to.equal('Military details');
      expect(page.path).to.equal('applicant-military-details');
      expect(page.depends).to.be.a('function');
    });
  });

  describe('dynamic functions', () => {
    it('preparer page should have updateSchema function', () => {
      const preparerPage =
        formConfig.chapters.contactInformation.pages.preparer;
      const {
        updateSchema,
      } = preparerPage.uiSchema.application.applicant.applicantRelationshipToClaimant[
        'ui:options'
      ];

      expect(updateSchema).to.be.a('function');
    });

    it('updateSchema should return applicant name when available', () => {
      const preparerPage =
        formConfig.chapters.contactInformation.pages.preparer;
      const {
        updateSchema,
      } = preparerPage.uiSchema.application.applicant.applicantRelationshipToClaimant[
        'ui:options'
      ];

      const formData = {
        application: {
          claimant: {
            name: {
              first: 'John',
              last: 'Doe',
            },
          },
        },
      };

      const result = updateSchema(formData);
      expect(result.enumNames).to.exist;
      expect(result.enumNames[0]).to.include('John');
      expect(result.enumNames[1]).to.include('Someone else');
    });

    it('updateSchema should return "Myself" when no name available', () => {
      const preparerPage =
        formConfig.chapters.contactInformation.pages.preparer;
      const {
        updateSchema,
      } = preparerPage.uiSchema.application.applicant.applicantRelationshipToClaimant[
        'ui:options'
      ];

      const formData = { application: {} };
      const result = updateSchema(formData);

      expect(result.enumNames[0]).to.equal('Myself');
    });

    it('state title hideIf function should work for applicant', () => {
      const page =
        formConfig.chapters.contactInformation.pages
          .applicantContactInformation;
      const { hideIf } = page.uiSchema.application.claimant.address.state[
        'ui:options'
      ];

      expect(hideIf).to.be.a('function');

      const usaData = {
        application: { claimant: { address: { country: 'USA' } } },
      };
      const mexicoData = {
        application: { claimant: { address: { country: 'MEX' } } },
      };

      expect(hideIf(usaData)).to.be.false;
      expect(hideIf(mexicoData)).to.be.true;
    });

    it('state title hideIf function should work for sponsor', () => {
      const page =
        formConfig.chapters.contactInformation.pages.sponsorMailingAddress;
      const { hideIf } = page.uiSchema.application.veteran.address.state[
        'ui:options'
      ];

      expect(hideIf).to.be.a('function');

      const usaData = {
        application: { veteran: { address: { country: 'USA' } } },
      };
      const mexicoData = {
        application: { veteran: { address: { country: 'MEX' } } },
      };

      expect(hideIf(usaData)).to.be.false;
      expect(hideIf(mexicoData)).to.be.true;
    });

    it('state title hideIf function should work for preparer', () => {
      const page =
        formConfig.chapters.contactInformation.pages.preparerContactDetails;
      const { hideIf } = page.uiSchema.application.applicant[
        'view:applicantInfo'
      ].mailingAddress.state['ui:options'];

      expect(hideIf).to.be.a('function');

      const usaData = {
        application: {
          applicant: {
            'view:applicantInfo': { mailingAddress: { country: 'USA' } },
          },
        },
      };
      const mexicoData = {
        application: {
          applicant: {
            'view:applicantInfo': { mailingAddress: { country: 'MEX' } },
          },
        },
      };

      expect(hideIf(usaData)).to.be.false;
      expect(hideIf(mexicoData)).to.be.true;
    });
  });
});
