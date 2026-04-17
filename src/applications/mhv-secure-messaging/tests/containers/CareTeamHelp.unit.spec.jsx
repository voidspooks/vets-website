import React from 'react';
import { renderWithStoreAndRouter } from '@department-of-veterans-affairs/platform-testing/react-testing-library-helpers';
import { expect } from 'chai';
import { fireEvent, waitFor } from '@testing-library/react';
import sinon from 'sinon';
import reducer from '../../reducers';
import { Paths, ExternalLinks } from '../../util/constants';
import CareTeamHelp from '../../containers/CareTeamHelp';

describe('CareTeamHelp', () => {
  const baseState = {
    drupalStaticData: {
      vamcEhrData: {
        data: {
          ehrDataByVhaId: {
            662: {
              vhaId: '662',
              vamcFacilityName: 'San Francisco VA Medical Center',
              vamcSystemName: 'VA San Francisco health care',
              ehr: 'vista',
            },
            757: {
              vhaId: '757',
              vamcFacilityName: 'Chalmers P. Wylie Veterans Outpatient Clinic',
              vamcSystemName: 'VA Central Ohio health care',
              ehr: 'cerner',
            },
          },
          vistaFacilities: [
            { vhaId: '662', vamcSystemName: 'Test VistA Facility' },
          ],
          cernerFacilities: [
            { vhaId: '757', vamcSystemName: 'Test Oracle Facility' },
          ],
        },
      },
    },
    user: {
      profile: {
        facilities: [
          {
            facilityId: '662',
            isCerner: false,
          },
          {
            facilityId: '757',
            isCerner: true,
          },
        ],
      },
    },
  };

  const oracleOnlyState = {
    ...baseState,
    user: {
      profile: {
        facilities: [
          {
            facilityId: '757',
            isCerner: true,
          },
        ],
      },
    },
  };

  const vistaOnlyState = {
    ...baseState,
    user: {
      profile: {
        facilities: [
          {
            facilityId: '662',
            isCerner: false,
          },
        ],
      },
    },
  };

  const setup = (state = baseState) => {
    return renderWithStoreAndRouter(<CareTeamHelp />, {
      initialState: state,
      reducers: reducer,
      path: Paths.CARE_TEAM_HELP,
    });
  };

  it('renders without errors', () => {
    const screen = setup();
    expect(screen);
  });

  it('displays page title', () => {
    const screen = setup();
    expect(screen.getByRole('heading', { level: 1 })).to.exist;
  });

  it('sets the document title', async () => {
    setup();

    await waitFor(() => {
      expect(document.title).to.equal(
        'Care Team Help - Start Message | Veterans Affairs',
      );
    });
  });

  it('renders common content for all user types', () => {
    const screen = setup();

    // Reasons shown for all users
    expect(screen.getByText(/They don.t use messages/)).to.exist;
    expect(
      screen.getByText(/They.re part of a different VA health care system/),
    ).to.exist;

    // EmergencyNote component (rendered with dropDownFlag as va-alert-expandable)
    expect(screen.container.querySelector('va-alert-expandable')).to.exist;

    // Other options section
    expect(
      screen.getByText(
        /If you can.t find your care team, try these other options/,
      ),
    ).to.exist;
    expect(screen.getByText(/Select a different VA health care system/)).to
      .exist;
    expect(screen.getByText(/type of care, provider name/)).to.exist;

    // Help phone number (MyHealtheVet + TTY, plus one from EmergencyNote)
    const phoneElements = screen.container.querySelectorAll('va-telephone');
    expect(phoneElements.length).to.be.at.least(2);
  });

  it('shows VistA-only content when user has only VistA systems', () => {
    const screen = setup(vistaOnlyState);

    // Check for VistA-specific content
    expect(screen.getByText(/Select a different VA health care system/)).to
      .exist;
    expect(screen.getByText(/type of care, provider name/)).to.exist;

    // VistA-only should show contact list reasons
    expect(screen.getByText(/You removed them from your contact list/)).to
      .exist;
    expect(screen.getByText(/Your account isn.t connected to them/)).to.exist;

    // VistA-only should NOT show the "name may appear different" bullet
    expect(screen.queryByText(/Their name may appear different/)).to.not.exist;
    expect(screen.queryByTestId('name-change-link')).to.not.exist;

    // Should have one "Update your contact list" link
    const updateLink = screen.getByTestId('update-contact-list-link');
    expect(updateLink).to.exist;

    // Contact list section text
    expect(
      screen.getByText(
        /You can send messages to new or previously removed care teams/,
      ),
    ).to.exist;

    // Back navigation works
    const historySpy = sinon.spy(screen.history, 'goBack');
    const backButton = screen.container.querySelector('va-button[text="Back"]');
    fireEvent.click(backButton);
    expect(historySpy.calledOnce).to.be.true;
  });

  it('shows Oracle-only content when user has only Oracle Health systems', () => {
    const screen = setup(oracleOnlyState);

    // Check for Oracle-specific content
    expect(screen.getByText(/Select a different VA health care system/)).to
      .exist;
    expect(screen.getByText(/type of care, provider name/)).to.exist;

    // Should show the "names may appear different" bullet with R&S link
    expect(screen.getByText(/Their name may appear different/)).to.exist;
    const nameChangeLink = screen.getByTestId('name-change-link');
    expect(nameChangeLink).to.exist;
    expect(nameChangeLink).to.have.attribute(
      'href',
      ExternalLinks.CARE_TEAM_NAME_GLOSSARY,
    );

    // Oracle-only should NOT show VistA contact list reasons
    expect(screen.queryByText(/You removed them from your contact list/)).to.not
      .exist;
    expect(screen.queryByText(/Your account isn.t connected to them/)).to.not
      .exist;

    // Oracle-only has no "Update your contact list" link or section text
    expect(screen.queryByTestId('update-contact-list-link')).to.not.exist;
    expect(
      screen.queryByText(
        /You can send messages to new or previously removed care teams/,
      ),
    ).to.not.exist;

    // Back navigation works
    const historySpy = sinon.spy(screen.history, 'goBack');
    const backButton = screen.container.querySelector('va-button[text="Back"]');
    fireEvent.click(backButton);
    expect(historySpy.calledOnce).to.be.true;
  });

  it('shows hybrid content when user has both Oracle and VistA systems', () => {
    const screen = setup(); // Uses baseState with both systems

    // Page renders with title
    expect(screen.getByRole('heading', { level: 1 })).to.exist;

    // Hybrid should have ONE "Update your contact list" link and section text
    const updateLink = screen.getByTestId('update-contact-list-link');
    expect(updateLink).to.exist;
    expect(
      screen.getByText(
        /You can send messages to new or previously removed care teams/,
      ),
    ).to.exist;

    // Hybrid should show the 'removed from contact list' and 'account not connected' reasons
    expect(screen.getByText(/You removed them from your contact list/)).to
      .exist;
    expect(screen.getByText(/Your account isn.t connected to them/)).to.exist;

    // Should show the "names may appear different" bullet with R&S link
    expect(screen.getByText(/Their name may appear different/)).to.exist;
    const nameChangeLink = screen.getByTestId('name-change-link');
    expect(nameChangeLink).to.exist;
    expect(nameChangeLink).to.have.attribute(
      'href',
      ExternalLinks.CARE_TEAM_NAME_GLOSSARY,
    );

    // Hybrid still shows search guidance
    expect(screen.getByText(/type of care, provider name/)).to.exist;

    // Back navigation works
    const historySpy = sinon.spy(screen.history, 'goBack');
    const backButton = screen.container.querySelector('va-button[text="Back"]');
    fireEvent.click(backButton);
    expect(historySpy.calledOnce).to.be.true;
  });

  it('includes back button', () => {
    const screen = setup();
    // The va-button component should be present
    const backButton = screen.container.querySelector('va-button[text="Back"]');
    expect(backButton).to.exist;
  });

  it('handles edge case when no facilities are available', () => {
    const noFacilitiesState = {
      drupalStaticData: {
        vamcEhrData: {
          data: {
            vistaFacilities: [],
            cernerFacilities: [],
          },
        },
      },
    };

    const screen = setup(noFacilitiesState);

    // Should default to VistA-only content when no facilities (both hasOracle and hasVista are false)
    expect(screen.getByText(/Select a different VA health care system/)).to
      .exist;
    expect(screen.getByText(/type of care, provider name/)).to.exist;
    // Verify the page renders without errors
    expect(screen.getByRole('heading', { level: 1 })).to.exist;
  });

  it('handles edge case when vamcEhrData is missing', () => {
    const missingEhrDataState = {
      ...baseState,
      user: {
        profile: {
          facilities: [],
        },
      },
    };

    const screen = setup(missingEhrDataState);

    // Should default to VistA-only content when EHR data is missing (both hasOracle and hasVista are false)
    expect(screen.getByText(/Select a different VA health care system/)).to
      .exist;
    expect(screen.getByText(/type of care, provider name/)).to.exist;
    // Verify the page renders without errors
    expect(screen.getByRole('heading', { level: 1 })).to.exist;
  });

  it('renders content for mixed EHR systems with multiple facilities', () => {
    const screen = setup(baseState);

    // Verify the page renders correctly with mixed systems
    expect(screen.getByRole('heading', { level: 1 })).to.exist;

    // Should have at least one "Update your contact list" link
    const updateLink = screen.getByTestId('update-contact-list-link');
    expect(updateLink).to.exist;
  });

  it('does not redirect when accessed directly via URL', async () => {
    const { history } = setup();

    await waitFor(() => {
      expect(history.location.pathname).to.equal(
        '/new-message/care-team-help/',
      );
    });
  });
});
