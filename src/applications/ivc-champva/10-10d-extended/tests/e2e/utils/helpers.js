import { applicationStatusPages } from '../../../chapters/applicationStatus';

export const startAsNewUser = ({ auth = false } = {}) => {
  cy.clickStartForm();
  if (auth) cy.wait('@mockPrefill');
  cy.location('pathname').should(
    'include',
    `/${applicationStatusPages.certifierRole.path}`,
  );
};

export const startAsInProgressUser = () => {
  cy.get('[data-testid="continue-your-application"]').click();
  cy.wait('@mockPrefill');
};
