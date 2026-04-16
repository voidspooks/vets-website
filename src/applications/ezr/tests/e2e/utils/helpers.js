export const startAsNewUser = ({ auth = false } = {}) => {
  cy.clickStartForm();
  if (auth) cy.wait('@mockPrefill');
  cy.location('pathname').should(
    'include',
    '/veteran-information/personal-information',
  );
};

export const startAsInProgressUser = () => {
  cy.get('[data-testid="continue-your-application"]').click();
  cy.wait('@mockPrefill');
};
