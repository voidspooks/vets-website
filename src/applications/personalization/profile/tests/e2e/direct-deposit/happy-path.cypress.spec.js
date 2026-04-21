import { mockGETEndpoints } from '../helpers';
import DirectDepositPage from './page-objects/DirectDeposit';

const directDeposit = new DirectDepositPage();

describe('Direct Deposit - Happy Path', () => {
  beforeEach(() => {
    mockGETEndpoints(
      [
        '/v0/disability_compensation_form/rating_info',
        '/v0/user_transition_availabilities',
        'v0/profile/personal_information',
        'v0/profile/service_history',
        'v0/profile/full_name',
      ],
      200,
      {},
    );
  });

  it('should show new unified page', () => {
    directDeposit.setup();
    directDeposit.visitPage();
    directDeposit.confirmDirectDepositInSubnav();
    cy.findAllByTestId('unified-direct-deposit').should('exist');
    cy.findByRole('heading', { name: 'Direct deposit information' }).should(
      'exist',
    );
    cy.injectAxeThenAxeCheck();
  });
});
