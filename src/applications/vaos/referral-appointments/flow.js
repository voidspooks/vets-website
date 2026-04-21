import { startReferralTimer } from './utils/timer';

/**
 * Function to get referral page flow.
 *
 * @export
 * @param {string} referralId - The referral unique identifier
 * @param {string} appointmentId - The appointment unique identifier
 * @param {string} providerId - The provider for appointment slots
 * @param {string} providerType - The provider type for the unified booking endpoint ('va' or 'eps')
 * @returns {object} Referral appointment workflow object
 */
export function getPageFlow(
  referralId,
  appointmentId,
  providerId = null,
  providerType = null,
) {
  return {
    error: {
      url: '/',
      label: 'Back to appointments',
      next: '',
      previous: 'appointments',
    },
    appointments: {
      url: '/',
      label: 'Appointments',
      next: 'scheduleReferral',
      previous: '',
    },
    referralsAndRequests: {
      url: '/referrals-requests',
      label: 'Referrals and requests',
      next: 'scheduleReferral',
      previous: 'appointments',
    },
    scheduleReferral: {
      url: `/schedule-referral?id=${referralId}`,
      label: 'Appointment Referral',
      next: 'providerSelection',
      previous: 'referralsAndRequests',
    },
    providerSelection: {
      url: `/schedule-referral/provider-selection?id=${referralId}`,
      label: 'Select a provider',
      next: 'scheduleAppointment',
      previous: 'scheduleReferral',
    },
    scheduleAppointment: {
      url: `/schedule-referral/date-time?id=${referralId}&providerId=${providerId}`,
      label: 'Schedule an appointment with your provider',
      next: 'reviewAndConfirm',
      previous: 'providerSelection',
    },
    reviewAndConfirm: {
      url: `/schedule-referral/review?id=${referralId}`,
      label: 'Review your appointment details',
      next: 'complete',
      previous: 'scheduleAppointment',
    },
    complete: {
      url: `/schedule-referral/complete/${appointmentId}?id=${referralId}&providerType=${providerType}`,
      label: 'Your appointment is scheduled',
      next: 'details',
      previous: 'appointments',
    },
    details: {
      url:
        providerType === 'eps'
          ? `/${appointmentId}?eps=true`
          : `/${appointmentId}`,
      label: '',
      next: '',
      previous: 'complete',
    },
  };
}

export function routeToPageInFlow(
  history,
  current,
  action,
  referralId,
  appointmentId,
  providerId,
  providerType,
) {
  const pageFlow = getPageFlow(
    referralId,
    appointmentId,
    providerId,
    providerType,
  );
  // if there is no current page meaning there was an error fetching referral data
  // then we are on an error state in the form and back should go back to appointments.
  const nextPageString = current
    ? pageFlow[current][action]
    : 'referralsAndRequests';
  const nextPage = pageFlow[nextPageString];
  if (action === 'next' && nextPageString === 'scheduleReferral') {
    startReferralTimer(referralId);
  }

  if (nextPage?.url) {
    if (action === 'previous') {
      history.replace(nextPage.url);
    } else {
      history.push(nextPage.url);
    }
  } else if (nextPage) {
    throw new Error(`Tried to route to a page without a url: ${nextPage}`);
  } else {
    throw new Error('Tried to route to page that does not exist');
  }
}

export function routeToPreviousReferralPage(
  history,
  current,
  referralId = null,
) {
  let resolvedReferralId = referralId;
  // Give the router some context to keep the user in the same referral when navigating back if not
  // explicitly passed
  if (!referralId && history.location?.search) {
    const params = new URLSearchParams(history.location.search);
    resolvedReferralId = params.get('id');
  }
  return routeToPageInFlow(history, current, 'previous', resolvedReferralId);
}

export function routeToNextReferralPage(
  history,
  current,
  referralId = null,
  appointmentId = null,
  providerId = null,
  providerType = null,
) {
  return routeToPageInFlow(
    history,
    current,
    'next',
    referralId,
    appointmentId,
    providerId,
    providerType,
  );
}

export function routeToCCPage(history, page, referralId = null) {
  const pageFlow = getPageFlow(referralId);
  const nextPage = pageFlow[page];
  let { url } = nextPage;
  const currentParams = new URLSearchParams(history.location?.search);
  const providerId = currentParams.get('providerId');
  if (providerId && !url.includes('providerId=')) {
    const separator = url.includes('?') ? '&' : '?';
    url = `${url}${separator}providerId=${providerId}`;
  }
  return history.push(url);
}

/* Function to get label from the flow
 * The URL displayed in the browser address bar is compared to the 
 * flow URL
 *
 * @export
 * @param {string} currentPage - the current page in the referral flow
 * @returns {string} the label string
 */

/**
 * Given the page you are currently on, return the text for a back link
 * that points at that page's `previous` entry in the flow.
 *
 * @export
 * @param {string} fromPage - the current page key in the referral flow
 * @returns {string} a "Back to ..." string, or 'Back' if no previous label exists
 */
export function getReferralBackLinkText(fromPage) {
  const _flow = getPageFlow();
  const previousKey = _flow[fromPage]?.previous;
  const previousLabel = _flow[previousKey]?.label;
  if (!previousLabel) {
    return 'Back';
  }
  return `Back to ${previousLabel.toLowerCase()}`;
}

export function getReferralPageKeyFromPathname(pathname) {
  if (!pathname) {
    return null;
  }
  if (pathname.includes('/schedule-referral/complete/')) {
    return 'complete';
  }
  if (pathname.includes('/schedule-referral/review')) {
    return 'reviewAndConfirm';
  }
  if (pathname.includes('/schedule-referral/date-time')) {
    return 'scheduleAppointment';
  }
  if (pathname.includes('/schedule-referral/provider-selection')) {
    return 'providerSelection';
  }
  if (pathname.includes('/schedule-referral')) {
    return 'scheduleReferral';
  }
  if (
    pathname === '/referrals-requests' ||
    pathname.startsWith('/referrals-requests/')
  ) {
    return 'referralsAndRequests';
  }
  if (pathname === '/') {
    return 'appointments';
  }
  return null;
}

export function getReferralUrlLabel(currentPage) {
  const _flow = getPageFlow();
  const result = _flow[currentPage];

  switch (currentPage) {
    case 'complete':
      return 'Back to appointments';
    case 'scheduleReferral':
      return 'Back to referrals and requests';
    case 'reviewAndConfirm':
    case 'scheduleAppointment':
    case 'providerSelection':
      return 'Back';
    default:
      if (!result) {
        return null;
      }
      return result.label;
  }
}
