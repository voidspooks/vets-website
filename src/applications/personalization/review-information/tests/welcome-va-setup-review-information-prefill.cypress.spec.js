import manifest from '../manifest.json';
import { cypressSetup } from './utils';
import mockUser from './fixtures/mocks/user.json';

describe('Welcome to My VA Review Contact Information - Prefill Pattern', () => {
  const formURL = `${manifest.rootUrl}/prefill-contact-information`;

  const editMobilePhone = () => {
    cy.get('va-card-status')
      .find('va-link-action')
      .shadow()
      .find('a')
      .contains('Edit mobile phone number')
      .click({ force: true });

    cy.location('pathname').should('include', '/edit-mobile-phone');
    cy.axeCheck();

    cy.fillVaTextInput('root_inputPhoneNumber', '5551234567');
    cy.findByTestId('save-edit-button').click();

    cy.location('pathname').should('include', '/prefill-contact-information');
  };

  const editEmailAddress = () => {
    cy.get('va-card-status')
      .find('va-link-action')
      .shadow()
      .find('a')
      .contains('Edit email address')
      .click({ force: true });

    cy.location('pathname').should('include', '/edit-email-address');
    cy.axeCheck();

    cy.fillVaTextInput('root_emailAddress', 'test@email.com');
    cy.findByTestId('save-edit-button').click();

    cy.location('pathname').should('include', '/prefill-contact-information');
  };

  const editMailingAddress = () => {
    cy.get('va-card-status')
      .find('va-link-action')
      .shadow()
      .find('a')
      .contains('Edit mailing address')
      .click({ force: true });

    cy.location('pathname').should('include', '/edit-mailing-address');
    cy.axeCheck();

    cy.fillVaTextInput('root_addressLine1', '123 Main St');
    cy.fillVaTextInput('root_city', 'Anytown');
    cy.selectVaSelect('root_stateCode', 'CA');
    cy.fillVaTextInput('root_zipCode', '90210');
    cy.findByTestId('save-edit-button').click();

    // Wait for address validation, then confirm the suggested address
    cy.wait('@getAddressValidation');
    cy.findByTestId('confirm-address-button').click();

    cy.location('pathname').should('include', '/prefill-contact-information');
  };

  context('when signed in with veteranOnboardingPrefillPattern ON', () => {
    beforeEach(() => {
      cypressSetup({
        extraFeatureToggles: [
          { name: 'veteran_onboarding_prefill_pattern', value: true },
          { name: 'veteranOnboardingPrefillPattern', value: true },
        ],
      });
      cy.login(mockUser);
      cy.visit(formURL);
      cy.wait(['@mockUser', '@features', '@mockVamc']);
    });

    it('should render the prefill contact information page and allow editing', () => {
      cy.location('pathname').should('match', /\/prefill-contact-information$/);

      cy.injectAxe();
      cy.axeCheck();

      cy.get('#prefillContactInfoHeader').should('exist');
      cy.get('va-card-status').should('have.length', 3);

      editMobilePhone();
      editEmailAddress();
      editMailingAddress();

      // In the prefill pattern, the Continue button redirects to /my-va/
      // instead of a confirmation page
      cy.findByText(/continue/i, { selector: 'button' }).should('exist');
    });
  });

  context('when not signed in', () => {
    beforeEach(() => {
      cypressSetup({
        extraFeatureToggles: [
          { name: 'veteran_onboarding_prefill_pattern', value: true },
          { name: 'veteranOnboardingPrefillPattern', value: true },
        ],
      });
      cy.visit(formURL);
      cy.wait(['@features']);
    });

    // We do not need to test the sign-in flow, just that we are redirected to it, so we can skip the Axe check
    // eslint-disable-next-line @department-of-veterans-affairs/axe-check-required
    it('should redirect to sign in', () => {
      cy.location().should(loc => {
        expect(loc.search).to.contain(
          '?next=%2Fmy-va%2Fwelcome-va-setup%2Fprefill-contact-information',
        );
      });
    });
  });
});
