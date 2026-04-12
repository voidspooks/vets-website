import { mockFeatureToggles } from '../../vaos-cypress-helpers';
import {
  mockReferralDetailGetApi,
  mockReferralProvidersApiPaginated,
  mockReferralProvidersApi,
  saveScreenshot,
} from './referrals-cypress-helpers';
import MockUser from '../../../fixtures/MockUser';
import MockReferralProvidersResponse from '../../../fixtures/MockReferralProvidersResponse';
import MockReferralDetailResponse from '../../../fixtures/MockReferralDetailResponse';
import providerSelection from '../../referrals/page-objects/ProviderSelection';

const referralId = 'test-referral-uuid';

describe('VAOS Provider Selection', () => {
  beforeEach(() => {
    mockFeatureToggles({
      vaOnlineSchedulingCCDirectScheduling: true,
      vaOnlineSchedulingFlatFacilityPage: true,
      vaOnlineSchedulingUseV2ApiRequests: true,
    });

    const referralResponse = new MockReferralDetailResponse({
      id: referralId,
      referralNumber: referralId,
    }).toJSON();
    mockReferralDetailGetApi({
      id: referralId,
      response: referralResponse,
    });

    cy.login(new MockUser());
  });

  describe('Happy path - providers load with pagination', () => {
    it('should display first page of provider cards', () => {
      const page1 = MockReferralProvidersResponse.createSuccessResponse({
        page: 1,
        perPage: 5,
        totalEntries: 8,
      });

      mockReferralProvidersApiPaginated({
        referralId,
        responses: { '1': page1 },
      });

      cy.visit(
        `/my-health/appointments/schedule-referral/provider-selection?id=${referralId}`,
      );

      cy.wait('@v2:get:referral:providers');

      providerSelection.validate();
      providerSelection.assertProviderCards(5);
      providerSelection.assertDifferentProviderSection();

      cy.injectAxeThenAxeCheck();
      saveScreenshot('vaos_ccDirectScheduling_providerSelection_happy');
    });

    it('should fetch next page and show all providers when show more is clicked', () => {
      const page1 = MockReferralProvidersResponse.createSuccessResponse({
        page: 1,
        perPage: 5,
        totalEntries: 8,
      });
      const page2 = MockReferralProvidersResponse.createSuccessResponse({
        page: 2,
        perPage: 5,
        totalEntries: 8,
      });

      mockReferralProvidersApiPaginated({
        referralId,
        responses: { '1': page1, '2': page2 },
      });

      cy.visit(
        `/my-health/appointments/schedule-referral/provider-selection?id=${referralId}`,
      );

      cy.wait('@v2:get:referral:providers');

      providerSelection.assertProviderCards(5);
      providerSelection.clickShowMore();

      cy.wait('@v2:get:referral:providers');

      providerSelection.assertProviderCards(8);
      providerSelection.assertNoShowMoreButton();
      cy.injectAxeThenAxeCheck();

      saveScreenshot('vaos_ccDirectScheduling_providerSelection_showMore');
    });
  });

  describe('API errors', () => {
    const errorCases = [
      { errorType: 'notFound', responseCode: 404 },
      { errorType: 'serverError', responseCode: 500 },
    ];

    errorCases.forEach(({ errorType, responseCode }) => {
      it(`should display an error message when providers API returns ${responseCode}`, () => {
        const errorResponse = new MockReferralProvidersResponse({
          [errorType]: true,
        }).toJSON();
        mockReferralProvidersApi({
          referralId,
          response: errorResponse,
          responseCode,
        });

        cy.visit(
          `/my-health/appointments/schedule-referral/provider-selection?id=${referralId}`,
        );

        cy.wait('@v2:get:referral:providers');

        providerSelection.assertApiError();

        cy.injectAxeThenAxeCheck();
        saveScreenshot(
          `vaos_ccDirectScheduling_providerSelection_apiError_${errorType}`,
        );
      });
    });
  });
});
