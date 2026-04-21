import { expect } from 'chai';
import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import formConfig from '../../../config/form';

describe('formConfig', () => {
  it('is an object', () => {
    expect(formConfig).to.be.an('object');
  });

  it('has a rootUrl property', () => {
    expect(formConfig).to.have.property('rootUrl');
    expect(formConfig.rootUrl).to.be.a('string');
  });

  it('has a formId property', () => {
    expect(formConfig).to.have.property('formId');
    expect(formConfig.formId).to.be.a('string');
  });

  it('has a chapters property', () => {
    expect(formConfig).to.have.property('chapters');
    expect(formConfig.chapters).to.be.an('object');
  });

  describe('chapters', () => {
    it('contains the infoPage chapter', () => {
      expect(formConfig.chapters).to.have.property('infoPage');
      expect(formConfig.chapters.infoPage).to.be.an('object');
    });

    it('contains pages in the infoPage chapter', () => {
      const { infoPage } = formConfig.chapters;
      expect(infoPage).to.have.property('pages');
      expect(infoPage.pages).to.be.an('object');
    });

    it('includes a contact information page', () => {
      const contactInfoPage =
        formConfig.chapters.infoPage.pages.confirmContactInfo;
      expect(contactInfoPage).to.exist;
      expect(contactInfoPage).to.be.an('object');
      expect(contactInfoPage).to.have.property('CustomPage');
    });
  });

  describe('contact information page', () => {
    const contactInfoPage =
      formConfig.chapters.infoPage.pages.confirmContactInfo;

    it('has an onNavForward method', () => {
      expect(contactInfoPage).to.have.property('onNavForward');
      expect(contactInfoPage.onNavForward).to.be.a('function');
    });

    it('onNavForward navigates to the confirmation path', () => {
      const mockGoPath = path => expect(path).to.equal('confirmation');
      contactInfoPage.onNavForward({ goPath: mockGoPath });
    });

    it('has an onNavBack method', () => {
      expect(contactInfoPage).to.have.property('onNavBack');
      expect(contactInfoPage.onNavBack).to.be.a('function');
    });

    it('onNavBack redirects to the My VA page', () => {
      const originalLocation = window.location;

      contactInfoPage.onNavBack();

      // Node 14 with jsdom sets window.location directly as a string
      // Node 22 with happy-dom sets window.location.href
      // TODO: Remove the string check after Node 14 upgrade is complete
      const actualLocation =
        typeof window.location === 'string'
          ? window.location
          : window.location.href;

      expect(actualLocation).to.include('/my-va/');

      global.window.location = originalLocation;
    });

    it('renders CustomPage without crashing', () => {
      const mockStore = {
        getState: () => ({
          user: {
            login: { currentlyLoggedIn: true },
            profile: { vapContactInfo: {} },
          },
          form: { data: {} },
        }),
        subscribe: () => {},
        dispatch: () => {},
      };
      const { CustomPage } = contactInfoPage;
      const { container } = render(
        <Provider store={mockStore}>
          <CustomPage data={{}} setFormData={() => {}} />
        </Provider>,
      );
      expect(container).to.exist;
    });

    describe('depends', () => {
      it('returns true when veteranOnboardingPrefillPattern is false', () => {
        expect(
          contactInfoPage.depends({ veteranOnboardingPrefillPattern: false }),
        ).to.be.true;
      });

      it('returns true when veteranOnboardingPrefillPattern is undefined', () => {
        expect(contactInfoPage.depends({})).to.be.true;
      });

      it('returns false when veteranOnboardingPrefillPattern is true', () => {
        expect(
          contactInfoPage.depends({ veteranOnboardingPrefillPattern: true }),
        ).to.be.false;
      });
    });
  });

  describe('prefill contact information page', () => {
    const prefillPage = formConfig.chapters.infoPage.pages.prefillContactInfo;

    it('exists', () => {
      expect(prefillPage).to.exist;
      expect(prefillPage).to.be.an('object');
    });

    it('depends returns true when veteranOnboardingPrefillPattern is true', () => {
      expect(prefillPage.depends({ veteranOnboardingPrefillPattern: true })).to
        .be.true;
    });

    it('depends returns false when veteranOnboardingPrefillPattern is false', () => {
      expect(prefillPage.depends({ veteranOnboardingPrefillPattern: false })).to
        .be.false;
    });

    it('onNavBack redirects to the My VA page', () => {
      const originalLocation = window.location;

      prefillPage.onNavBack();

      const actualLocation =
        typeof window.location === 'string'
          ? window.location
          : window.location.href;

      expect(actualLocation).to.include('/my-va/');

      global.window.location = originalLocation;
    });

    it('onNavForward redirects to the My VA page', () => {
      const originalLocation = window.location;

      prefillPage.onNavForward();

      const actualLocation =
        typeof window.location === 'string'
          ? window.location
          : window.location.href;

      expect(actualLocation).to.include('/my-va/');

      global.window.location = originalLocation;
    });
  });

  describe('introduction', () => {
    it('renders an empty fragment', () => {
      // we are not using an introduction page
      const Introduction = formConfig.introduction;
      const { container } = render(<Introduction />);
      expect(container.innerHTML).to.equal('');
    });
  });

  describe('submit function', () => {
    it('exists and returns a promise with a confirmation number', async () => {
      const result = await formConfig.submit();
      expect(result).to.be.an('object');
      expect(result.attributes).to.have.property('confirmationNumber');
      expect(result.attributes.confirmationNumber).to.be.a('string');
    });
  });

  describe('footerContent', () => {
    it('exists as a property', () => {
      expect(formConfig).to.have.property('footerContent');
      expect(formConfig.footerContent).to.be.a('function');
    });
  });

  describe('savedFormMessages', () => {
    it('includes a notFound message', () => {
      expect(formConfig.savedFormMessages).to.have.property('notFound');
      expect(formConfig.savedFormMessages.notFound).to.be.a('string');
    });

    it('includes a noAuth message', () => {
      expect(formConfig.savedFormMessages).to.have.property('noAuth');
      expect(formConfig.savedFormMessages.noAuth).to.be.a('string');
    });
  });

  describe('formOptions', () => {
    it('includes a noTopNav property', () => {
      expect(formConfig.formOptions).to.have.property('noTopNav');
      expect(formConfig.formOptions.noTopNav).to.be.true;
    });
  });
});
