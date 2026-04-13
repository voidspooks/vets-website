import { expect } from 'chai';
import React from 'react';
import { renderWithStoreAndRouterV6 } from '@department-of-veterans-affairs/platform-testing/react-testing-library-helpers';
import FEATURE_FLAG_NAMES from 'platform/utilities/feature-toggles/featureFlagNames';
import MedicationResources from '../../../components/shared/MedicationResources';
import reducers from '../../../reducers';
import { dataDogActionNames, pageType } from '../../../util/dataDogConstants';
import { MEDS_BY_MAIL_FACILITY_ID } from '../../../util/constants';

describe('Medication Resources shared component', () => {
  const setup = (
    isMedicationsManagementImprovementsEnabled = false,
    hasMedsByMailFacility = false,
    page = pageType.REFILL,
    headingLevel = undefined,
  ) => {
    const initialState = {
      featureToggles: {
        [FEATURE_FLAG_NAMES.mhvMedicationsManagementImprovements]: isMedicationsManagementImprovementsEnabled,
      },
      user: {
        profile: {
          facilities: hasMedsByMailFacility
            ? [{ facilityId: MEDS_BY_MAIL_FACILITY_ID, name: 'Meds by Mail' }]
            : [],
        },
      },
    };

    return renderWithStoreAndRouterV6(
      <MedicationResources page={page} headingLevel={headingLevel} />,
      {
        initialState,
        reducers,
      },
    );
  };

  describe('when mhvMedicationsManagementImprovements flag is disabled', () => {
    it('does not render', () => {
      const screen = setup(false);
      expect(screen.queryByTestId('rx-medication-resources-container')).to.not
        .exist;
    });
  });

  describe('when mhvMedicationsManagementImprovements flag is enabled', () => {
    it('renders without errors', () => {
      const screen = setup(true);
      expect(screen.getByTestId('rx-medication-resources-container')).to.exist;
    });

    it('renders with default h3 heading level if no headingLevel prop is provided', () => {
      const screen = setup(true);
      const heading = screen.getByRole('heading', {
        name: 'More medication resources',
      });
      expect(heading.tagName).to.equal('H3');
    });

    it('renders with correct heading level when provided', () => {
      const screen = setup(true, false, pageType.REFILL, 2);
      const heading = screen.getByRole('heading', {
        name: 'More medication resources',
      });
      expect(heading.tagName).to.equal('H2');
    });

    it('displays content structure', () => {
      const screen = setup(true);
      expect(screen.getByText('More medication resources')).to.exist;
      expect(screen.getByTestId('order-medical-supplies-link')).to.exist;
      expect(
        screen.getByTestId(
          'download-your-self-entered-health-information-link',
        ),
      ).to.exist;
      expect(screen.getByTestId('update-notification-settings-link')).to.exist;
      expect(screen.getByTestId('review-your-allergies-and-reactions-link')).to
        .exist;
      expect(screen.queryByTestId('meds-by-mail-header')).to.not.exist;
    });

    it('displays meds by mail content when user has meds by mail facility', () => {
      const screen = setup(true, true);
      expect(screen.getByTestId('meds-by-mail-header')).to.exist;
    });

    const pageActionNameMap = [
      { page: pageType.REFILL, actions: dataDogActionNames.refillPage },
      { page: pageType.LIST, actions: dataDogActionNames.medicationsListPage },
      {
        page: pageType.HISTORY,
        actions: dataDogActionNames.medicationsHistoryPage,
      },
      {
        page: pageType.IN_PROGRESS,
        actions: dataDogActionNames.inProgressPage,
      },
    ];

    pageActionNameMap.forEach(({ page, actions }) => {
      it(`has all links with correct DD action names for ${page}`, () => {
        const screen = setup(true, false, page);

        const linkExpectations = [
          ['order-medical-supplies-link', actions.ORDER_MEDICAL_SUPPLIES_LINK],
          [
            'download-your-self-entered-health-information-link',
            actions.GO_TO_SELF_ENTERED_HEALTH_INFORMATION_LINK,
          ],
          [
            'update-notification-settings-link',
            actions.GO_TO_UPDATE_NOTIFICATION_SETTINGS_LINK,
          ],
          [
            'review-your-allergies-and-reactions-link',
            actions.GO_TO_ALLERGIES_AND_REACTIONS_LINK,
          ],
        ];

        linkExpectations.forEach(([testId, expectedActionName]) => {
          const link = screen.getByTestId(testId);
          expect(link).to.exist;
          expect(link).to.have.attribute(
            'data-dd-action-name',
            expectedActionName,
          );
        });
      });
    });
  });
});
