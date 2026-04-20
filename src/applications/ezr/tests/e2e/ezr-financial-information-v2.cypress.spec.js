import manifest from '../../manifest.json';
import mockUser from './fixtures/mocks/mock-user.json';
import mockPrefill from './fixtures/mocks/mock-prefill-with-v2-prefill-data.json';
import featureToggles from './fixtures/mocks/mock-features.json';
import { goToNextPage } from './helpers';
import { MOCK_ENROLLMENT_RESPONSE, API_ENDPOINTS } from '../../utils/constants';
import { advanceToHouseholdSection } from './helpers/household';
import maxTestData from './fixtures/data/maximal-test.json';
import {
  fillVeteranIncome,
  fillSpousalIncome,
  fillDeductibleExpenses,
} from './utils/fillers';
import { handleOptionalServiceHistoryPage } from './helpers/handleOptionalServiceHistoryPage';

// Add the feature toggle for the providers and dependents prefill
featureToggles.data.features.push({
  name: 'ezrFormPrefillWithProvidersAndDependents',
  value: true,
});

const { data } = maxTestData;

function advanceToFinancialIntroductionPage(hasSpouse) {
  goToNextPage('/household-information/marital-status-information');
  if (hasSpouse) {
    cy.selectVaSelect('root_view:maritalStatus_maritalStatus', 'Married');
    goToNextPage('/household-information/spouse-information');
    cy.injectAxeThenAxeCheck();
    goToNextPage('/household-information/spouse-information-summary');
    goToNextPage('/household-information/spouse-personal-information');
    goToNextPage('/household-information/spouse-additional-information');
    cy.selectRadio('root_cohabitedLastYear', 'Y');
    cy.selectRadio('root_sameAddress', 'Y');
    cy.injectAxeThenAxeCheck();
  } else {
    cy.selectVaSelect('root_view:maritalStatus_maritalStatus', 'Never Married');
  }
  goToNextPage('/household-information/dependents');
  cy.selectRadio('root_view:reportDependents', 'N');
  cy.injectAxeThenAxeCheck();
  goToNextPage('/household-information/financial-information-overview');
  cy.injectAxeThenAxeCheck();
  goToNextPage('/household-information/financial-information');
  cy.injectAxeThenAxeCheck();
}

function setUserDataAndAdvanceToHouseholdSection(user, prefillData) {
  cy.login(user);
  cy.intercept('GET', '/v0/feature_toggles*', featureToggles).as(
    'mockFeatures',
  );
  cy.intercept('GET', `/v0${API_ENDPOINTS.enrollmentStatus}*`, {
    statusCode: 200,
    body: MOCK_ENROLLMENT_RESPONSE,
  }).as('mockEnrollmentStatus');
  cy.intercept('/v0/in_progress_forms/10-10EZR', {
    statusCode: 200,
    body: prefillData,
  }).as('mockSip');
  cy.visit(manifest.rootUrl);
  cy.wait(['@mockUser', '@mockFeatures', '@mockEnrollmentStatus']);
  advanceToHouseholdSection();
  handleOptionalServiceHistoryPage({
    historyEnabled: data['view:ezrServiceHistoryEnabled'],
    hasServiceHistoryInfo: true,
  });
  cy.injectAxeThenAxeCheck();
}

function advanceToVeteranAnnualIncomePage(hasSpouse) {
  advanceToFinancialIntroductionPage(hasSpouse);
  cy.selectRadio('root_view:hasFinancialInformationToAdd', 'Y');
  goToNextPage('/veteran-annual-income');
}

function fillFinancialInformation(
  hasSpouse,
  financialData,
  isArrayBuilderEditPage = false,
  clearInput = false,
) {
  fillVeteranIncome(financialData, clearInput);
  cy.injectAxeThenAxeCheck();
  if (hasSpouse) {
    goToNextPage('/spouse-annual-income', isArrayBuilderEditPage);
    fillSpousalIncome(financialData, clearInput);
    cy.injectAxeThenAxeCheck();
  }
  goToNextPage('/deductible-expenses', isArrayBuilderEditPage);
  fillDeductibleExpenses(financialData, clearInput);
  cy.injectAxeThenAxeCheck();
  goToNextPage(
    '/household-information/financial-information',
    isArrayBuilderEditPage,
  );
}

describe('EZR V2 financial information flow', () => {
  context('when the user has no financial information to report', () => {
    beforeEach(() => {
      setUserDataAndAdvanceToHouseholdSection(mockUser, mockPrefill);
    });

    it('should not show financial information questions', () => {
      advanceToFinancialIntroductionPage(false);
      cy.selectRadio('root_view:hasFinancialInformationToAdd', 'N');
      cy.injectAxeThenAxeCheck();
      // The user should be redirected to the insurance section
      goToNextPage('/insurance-information/medicaid-eligibility');
    });
  });

  context('when the user has financial information to report', () => {
    context('when the user has a spouse', () => {
      beforeEach(() => {
        setUserDataAndAdvanceToHouseholdSection(mockUser, mockPrefill);
      });

      it('should successfully fill veteran annual income, spouse annual income, and deductible expenses', () => {
        advanceToVeteranAnnualIncomePage(true);
        fillFinancialInformation(true, data);
        // All three sets of financial information should be present on the review page
        cy.get('va-card')
          .find('h4')
          .should('have.length', 3);
        cy.injectAxeThenAxeCheck();
      });
    });
    context('when the user does not have a spouse', () => {
      beforeEach(() => {
        // Use prefill WITHOUT spouse data
        const nospousePrefill = { ...mockPrefill };
        delete nospousePrefill.formData.spouseFullName;
        delete nospousePrefill.formData.spouseSocialSecurityNumber;
        delete nospousePrefill.formData.spouseDateOfBirth;
        delete nospousePrefill.formData.dateOfMarriage;
        nospousePrefill.formData.maritalStatus = 'Never Married';

        setUserDataAndAdvanceToHouseholdSection(mockUser, nospousePrefill);
      });

      it('should successfully fill veteran annual income and deductible expenses, but not render the spouse annual income page', () => {
        advanceToVeteranAnnualIncomePage(false);
        fillFinancialInformation(false, data);
        cy.get('va-card')
          .find('h4')
          .should('have.length', 2);
        cy.injectAxeThenAxeCheck();
      });
    });
  });
});
