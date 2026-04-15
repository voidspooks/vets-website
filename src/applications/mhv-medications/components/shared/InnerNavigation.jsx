import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom-v5-compat';
import {
  InnerNavigationPaths,
  MOBILE_BREAKPOINT_PX,
  Paths,
} from '../../util/constants';
import { dataDogActionNames } from '../../util/dataDogConstants';

const MOBILE_BREAKPOINT = `(max-width: ${MOBILE_BREAKPOINT_PX}px)`;

const innerNavDDActions = {
  [Paths.LANDING]: {
    [Paths.LIST]:
      dataDogActionNames.refillPage
        .GO_TO_REVIEW_AND_PRINT_MEDICATION_HISTORY_LINK,
    [Paths.REFILL_STATUS]:
      dataDogActionNames.refillPage.GO_TO_YOUR_IN_PROGRESS_MEDICATIONS_LINK,
  },
  [Paths.LIST]: {
    [Paths.LANDING]:
      dataDogActionNames.medicationsHistoryPage.REFILL_MEDICATIONS_LINK,
    [Paths.REFILL_STATUS]:
      dataDogActionNames.medicationsHistoryPage
        .GO_TO_YOUR_IN_PROGRESS_MEDICATIONS_LINK,
  },
  [Paths.REFILL_STATUS]: {
    [Paths.LANDING]: dataDogActionNames.inProgressPage.REFILL_MEDICATIONS_LINK,
    [Paths.LIST]:
      dataDogActionNames.inProgressPage
        .GO_TO_REVIEW_AND_PRINT_MEDICATION_HISTORY_LINK,
  },
};

const InnerNavigation = () => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(
    window.matchMedia(MOBILE_BREAKPOINT).matches,
  );

  // Update the link text when the screen changes between mobile and desktop
  useEffect(() => {
    const mql = window.matchMedia(MOBILE_BREAKPOINT);

    const handleChange = e => setIsMobile(e.matches);
    mql.addEventListener('change', handleChange);

    return () => mql.removeEventListener('change', handleChange);
  }, []);

  const isActiveLink = path => {
    if (location.pathname === '/') {
      return path.path === Paths.LANDING;
    }
    return location.pathname === path.path;
  };

  const currentPath =
    location.pathname === '/' ? Paths.LANDING : location.pathname;

  return (
    <div
      className="
        do-not-print
        vads-u-margin-top--3
        vads-l-row
        "
    >
      <div
        className="
          vads-u-border-bottom--1px
          vads-u-border-color--gray-medium
          vads-u-display--flex
          vads-u-flex-wrap--wrap
          vads-u-flex--fill
          vads-u-width--full
          mobile-lg:vads-u-flex--auto
        "
      >
        {InnerNavigationPaths.map((innerNav, i) => (
          <div
            key={innerNav.path}
            data-testid={innerNav.datatestid}
            className={`
              vads-u-font-size--lg
              vads-u-display--flex
              ${i < InnerNavigationPaths.length - 1 && 'vads-u-margin-right--2'}
              vads-u-justify-content--center
              vads-u-padding-x--1p5
              ${
                isActiveLink(innerNav)
                  ? 'vads-u-border-bottom--5px vads-u-border-color--primary'
                  : ''
              }
            `}
          >
            <Link
              data-dd-action-name={
                !isActiveLink(innerNav)
                  ? innerNavDDActions[currentPath]?.[innerNav.path]
                  : undefined
              }
              className={`inner-nav-link hide-visited-link vads-u-text-decoration--none ${
                isActiveLink(innerNav)
                  ? 'vads-u-font-weight--bold vads-u-color--base'
                  : ''
              }`}
              to={innerNav.path}
              aria-current={isActiveLink(innerNav) ? 'page' : undefined}
              aria-label={innerNav.label}
            >
              {isMobile && innerNav.mobileLabel
                ? innerNav.mobileLabel
                : innerNav.label}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InnerNavigation;
