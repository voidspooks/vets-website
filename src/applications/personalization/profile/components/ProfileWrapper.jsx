import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { useFeatureToggle } from 'platform/utilities/feature-toggles';
import InitializeVAPServiceID from '@@vap-svc/containers/InitializeVAPServiceID';
import { isSchedulingPreferencesPilotEligible as isSchedulingPreferencesPilotEligibleSelector } from '~/platform/user/selectors';
import ProfileSubNav from './ProfileSubNav';
import { PROFILE_PATHS } from '../constants';
import { ProfileFullWidthContainer } from './ProfileFullWidthContainer';
import { getRoutesForNav } from '../routesForNav';
import { normalizePath } from '../../common/helpers';
import { ProfileBreadcrumbs } from './ProfileBreadcrumbs';
import { ProfilePrivacyPolicy } from './ProfilePrivacyPolicy';

const LAYOUTS = {
  SIDEBAR: 'sidebar',
  FULL_WIDTH: 'full-width',
  FULL_WIDTH_AND_BREADCRUMBS: 'full-width-and-breadcrumbs',
};

// we want to use a different layout for the specific routes
// the profile hub and edit page are full width, while the others
// include a sidebar navigation
const getLayout = ({ currentPathname }) => {
  const path = normalizePath(currentPathname);

  const fullWidthAndBreadcrumbsPaths = [PROFILE_PATHS.PROFILE_ROOT];

  const fullWidthPaths = [
    PROFILE_PATHS.EDIT,
    PROFILE_PATHS.SCHEDULING_PREF_CONTACT_METHOD,
    PROFILE_PATHS.SCHEDULING_PREF_CONTACT_TIMES,
    PROFILE_PATHS.SCHEDULING_PREF_APPOINTMENT_TIMES,
  ];

  if (fullWidthAndBreadcrumbsPaths.includes(path)) {
    return LAYOUTS.FULL_WIDTH_AND_BREADCRUMBS;
  }

  // if the current path is in the list of full width paths, use that layout
  if (fullWidthPaths.includes(path)) {
    return LAYOUTS.FULL_WIDTH;
  }

  // fallback to the sidebar layout
  return LAYOUTS.SIDEBAR;
};

const ProfileWrapper = ({
  children,
  isLOA3,
  isInMVI,
  isSchedulingPreferencesPilotEligible,
}) => {
  const location = useLocation();

  const { TOGGLE_NAMES, useToggleValue } = useFeatureToggle();
  const profileHideHealthCareContacts = useToggleValue(
    TOGGLE_NAMES.profileHideHealthCareContacts,
  );

  const routesForNav = getRoutesForNav({
    profileHideHealthCareContacts,
  });

  const layout = useMemo(
    () => {
      return getLayout({
        currentPathname: location.pathname,
      });
    },
    [location.pathname],
  );

  const content = (
    <>
      {layout === LAYOUTS.SIDEBAR && (
        <>
          <div className="vads-u-padding-x--1 medium-screen:vads-u-display--none">
            <ProfileBreadcrumbs routes={routesForNav} />
            <ProfileSubNav
              className="vads-u-margin-top--neg1 vads-u-margin-bottom--4"
              routes={routesForNav}
              isLOA3={isLOA3}
              isInMVI={isInMVI}
              isSchedulingPreferencesPilotEligible={
                isSchedulingPreferencesPilotEligible
              }
            />
          </div>

          <div className="vads-l-grid-container vads-u-padding-x--0">
            <ProfileBreadcrumbs
              routes={routesForNav}
              className={`medium-screen:vads-u-padding-left--2 vads-u-padding-left--1 ${isLOA3 &&
                'vads-u-display--none medium-screen:vads-u-display--block'}`}
            />
            <div className="vads-l-row">
              <div className="vads-u-display--none medium-screen:vads-u-display--block vads-l-col--3 vads-u-padding-left--2">
                <ProfileSubNav
                  routes={routesForNav}
                  isLOA3={isLOA3}
                  isInMVI={isInMVI}
                  isSchedulingPreferencesPilotEligible={
                    isSchedulingPreferencesPilotEligible
                  }
                  className="vads-u-margin-bottom--5"
                />
              </div>
              <div className="vads-l-col--12 vads-u-padding-bottom--4 vads-u-padding-x--1 medium-screen:vads-l-col--9 medium-screen:vads-u-padding-x--2 small-desktop-screen:vads-l-col--9">
                {/* children will be passed in from React Router one level up */}
                {children}
                <ProfilePrivacyPolicy />
              </div>
            </div>
          </div>
        </>
      )}

      {layout === LAYOUTS.FULL_WIDTH && (
        <ProfileFullWidthContainer breadcrumbs={false}>
          <>
            {children}
            <ProfilePrivacyPolicy />
          </>
        </ProfileFullWidthContainer>
      )}

      {layout === LAYOUTS.FULL_WIDTH_AND_BREADCRUMBS && (
        <ProfileFullWidthContainer breadcrumbs>
          <>
            {children}
            <ProfilePrivacyPolicy />
          </>
        </ProfileFullWidthContainer>
      )}
    </>
  );

  // Wrap all Profile content with InitializeVAPServiceID for LOA3 users in MVI.
  // This ensures VA Profile ID is created before any Profile pages are accessed.
  // NOTE: Child components (e.g., NotificationSettings, DirectDeposit, PaperlessDelivery)
  // should NOT wrap themselves in InitializeVAPServiceID, as initialization is now handled here.
  if (isLOA3 && isInMVI) {
    return <InitializeVAPServiceID>{content}</InitializeVAPServiceID>;
  }

  return content;
};

const mapStateToProps = state => {
  const hero = state.vaProfile?.hero;
  const isSchedulingPreferencesPilotEligible = isSchedulingPreferencesPilotEligibleSelector(
    state,
  );
  return {
    hero,
    isSchedulingPreferencesPilotEligible,
  };
};

ProfileWrapper.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  hero: PropTypes.object,
  isInMVI: PropTypes.bool,
  isLOA3: PropTypes.bool,
  isSchedulingPreferencesPilotEligible: PropTypes.bool,
  location: PropTypes.object,
};

export default connect(mapStateToProps)(ProfileWrapper);
