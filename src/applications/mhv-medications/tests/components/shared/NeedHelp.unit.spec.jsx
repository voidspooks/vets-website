import { expect } from 'chai';
import React from 'react';
import { renderWithStoreAndRouterV6 } from '@department-of-veterans-affairs/platform-testing/react-testing-library-helpers';
import FEATURE_FLAG_NAMES from 'platform/utilities/feature-toggles/featureFlagNames';
import reducers from '../../../reducers';
import NeedHelp from '../../../components/shared/NeedHelp';
import { dataDogActionNames, pageType } from '../../../util/dataDogConstants';

describe('Need Help shared component', () => {
  const setup = (
    isMedicationsManagementImprovementsEnabled = false,
    page = pageType.REFILL,
    headingLevel = undefined,
  ) => {
    const initialState = {
      featureToggles: {
        [FEATURE_FLAG_NAMES.mhvMedicationsManagementImprovements]: isMedicationsManagementImprovementsEnabled,
      },
    };

    return renderWithStoreAndRouterV6(
      <NeedHelp page={page} headingLevel={headingLevel} />,
      {
        initialState,
        reducers,
      },
    );
  };

  describe('when mhvMedicationsManagementImprovements flag is disabled', () => {
    it('renders without errors', () => {
      const screen = setup(false);
      expect(screen.getByTestId('rx-need-help-container')).to.exist;
    });

    it('renders with default h3 heading level if no headingLevel prop is provided', () => {
      const screen = setup();
      const heading = screen.getByRole('heading', { name: 'Need help?' });
      expect(heading.tagName).to.equal('H3');
    });

    it('renders with correct heading level when provided', () => {
      const screen = setup(false, pageType.REFILL, 2);
      const heading = screen.getByRole('heading', { name: 'Need help?' });
      expect(heading.tagName).to.equal('H2');
    });

    it('displays original content structure', () => {
      const screen = setup(false);

      expect(screen.getByText('Need help?')).to.exist;
      // Test for specific links instead of text content
      expect(screen.getByTestId('go-to-self-entered-health-information-link'))
        .to.exist;
      expect(
        screen.getByText(
          'Have questions about managing your medications online?',
        ),
      ).to.exist;
      expect(screen.getByTestId('go-to-use-medications-link')).to.exist;
      expect(screen.getByTestId('start-a-new-message-link')).to.exist;
    });

    it('has correct original links and DD action names', () => {
      const screen = setup(false);

      // Self-entered health information link
      expect(screen.getByTestId('go-to-self-entered-health-information-link'))
        .to.exist;
      expect(
        screen.getByTestId('go-to-self-entered-health-information-link'),
      ).to.have.attribute(
        'data-dd-action-name',
        dataDogActionNames.refillPage
          .GO_TO_SELF_ENTERED_HEALTH_INFORMATION_LINK,
      );

      // Use medications link (different test ID in original)
      expect(screen.getByTestId('go-to-use-medications-link')).to.exist;
      expect(
        screen.getByTestId('go-to-use-medications-link'),
      ).to.have.attribute(
        'data-dd-action-name',
        dataDogActionNames.refillPage.GO_TO_USE_MEDICATIONS_LINK,
      );

      // Start new message link
      expect(screen.getByTestId('start-a-new-message-link')).to.exist;
      expect(screen.getByTestId('start-a-new-message-link')).to.have.attribute(
        'data-dd-action-name',
        dataDogActionNames.refillPage.COMPOSE_A_MESSAGE_LINK,
      );
    });

    it('does NOT display enhanced content links', () => {
      const screen = setup(false);

      // These should not exist in original version
      expect(screen.queryByTestId('go-to-allergies-and-reactions-link')).to.not
        .exist;
      expect(
        screen.queryByTestId(
          'learn-more-about-managing-medications-online-link',
        ),
      ).to.not.exist;
      expect(screen.queryByTestId('go-to-update-notification-settings-link')).to
        .not.exist;
    });
  });

  describe('when mhvMedicationsManagementImprovements flag is enabled', () => {
    it('renders without errors', () => {
      const screen = setup(true);
      expect(screen.getByTestId('rx-need-help-container')).to.exist;
    });

    it('renders with default h3 heading level if no headingLevel prop is provided', () => {
      const screen = setup(true);
      const heading = screen.getByRole('heading', { name: 'Need help?' });
      expect(heading.tagName).to.equal('H3');
    });

    it('renders with correct heading level when provided', () => {
      const screen = setup(true, pageType.REFILL, 2);
      const heading = screen.getByRole('heading', { name: 'Need help?' });
      expect(heading.tagName).to.equal('H2');
    });

    it('displays enhanced content structure', () => {
      const screen = setup(true);

      expect(screen.getByText('Need help?')).to.exist;
      expect(
        screen.getByText(
          'Have questions about managing your medications online?',
        ),
      ).to.exist;
      expect(
        screen.getByTestId('learn-more-about-managing-medications-online-link'),
      ).to.exist;
      expect(screen.getByText(/Or you can call the My HealtheVet help desk/)).to
        .exist;
    });

    const pageActionNameMap = [
      { page: pageType.REFILL, actions: dataDogActionNames.refillPage },
      { page: pageType.LIST, actions: dataDogActionNames.medicationsListPage },
      {
        page: pageType.HISTORY,
        actions: dataDogActionNames.medicationsHistoryPage,
      },
      {
        page: pageType.REFILL_STATUS,
        actions: dataDogActionNames.refillStatusPage,
      },
    ];

    pageActionNameMap.forEach(({ page, actions }) => {
      it(`has managing medications online link with correct DD action name for ${page}`, () => {
        const screen = setup(true, page);

        const managingMedsLink = screen.getByTestId(
          'learn-more-about-managing-medications-online-link',
        );
        expect(managingMedsLink).to.exist;
        expect(managingMedsLink).to.have.attribute(
          'data-dd-action-name',
          actions.LEARN_MORE_ABOUT_MANAGING_MEDICATIONS_ONLINE_LINK,
        );
      });
    });

    it('does NOT display original-only content', () => {
      const screen = setup(true);

      // The original version had a different test ID for this link
      expect(screen.queryByTestId('go-to-use-medications-link')).to.not.exist;
    });
  });
});
