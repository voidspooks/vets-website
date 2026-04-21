import { success } from '@@profile/mocks/endpoints/rating-info';

import mockUser from '../fixtures/users/user-36.json';
import { PROFILE_PATHS } from '../../constants';
import { mockProfileLOA3 } from './helpers';

import user from '../../mocks/endpoints/user';

describe('Profile - Data Claims', () => {
  beforeEach(() => {
    cy.login(mockUser);
    mockProfileLOA3();
  });

  it('should request rating_info when user claim - ratingInfo is TRUE', () => {
    cy.intercept('v0/user', user.loa3User72);
    cy.intercept(
      '/v0/disability_compensation_form/rating_info',
      success.serviceConnected40,
    ).as('getRatingInfo');

    cy.visit(PROFILE_PATHS.PROFILE_ROOT);

    cy.wait('@getRatingInfo');

    cy.findByRole('heading', { name: /^Profile$/i }).should('exist');
    cy.findByText(
      /Legal name, date of birth, preferred name, and disability rating/i,
    ).should('exist');

    cy.injectAxeThenAxeCheck();
  });

  it('should NOT request rating_info when user claim - ratingInfo is FALSE', () => {
    cy.intercept('v0/user', user.loa3UserWithNoRatingInfoClaim);
    cy.intercept(
      '/v0/disability_compensation_form/rating_info',
      cy.spy().as('getRatingInfoSpy'),
    );

    cy.visit(PROFILE_PATHS.PROFILE_ROOT);

    cy.findByText(
      /Legal name, date of birth, preferred name, and disability rating/i,
    ).should('exist');

    cy.get('@getRatingInfoSpy').should('not.have.been.called');

    cy.injectAxeThenAxeCheck();
  });
});
