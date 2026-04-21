import AccountSecurity from './components/account-security/AccountSecurity';
import ContactInformation from './components/contact-information/ContactInformation';
import PersonalInformation from './components/personal-information/PersonalInformation';
import ServiceHistoryInformation from './components/service-history-information/ServiceHistoryInformation';
import VeteranStatusWrapper from './components/veteran-status-card/VeteranStatusWrapper';
import AccreditedRepresentative from './components/accredited-representative/AccreditedRepresentative';
import { DirectDeposit } from './components/direct-deposit/DirectDeposit';
import DependentsAndContacts from './components/DependentsAndContacts';
import ConnectedApplications from './components/connected-apps/ConnectedApps';
import EmailAndTextNotifications from './components/notification-settings/EmailAndTextNotifications';
import { PROFILE_PATHS, PROFILE_PATH_NAMES } from './constants';
import PersonalHealthCareContacts from './components/personal-health-care-contacts';
import FinancialInformation from './components/FinancialInformation';
import HealthCareSettings from './components/HealthCareSettings';
import LettersAndDocuments from './components/LettersAndDocuments';
import AccountSecurityPage from './components/AccountSecurity';
import SchedulingPreferences from './components/health-care-settings/SchedulingPreferences';
import MessagesSignature from './components/health-care-settings/MessagesSignature';

// the routesForNav array is used in the routes file to build the routes
// the edit and hub routes are not present in the routesForNav array because
// they are not shown in nav UI
// subnavParent should be specified for routes that should appear inside a submenu
const routesForNav = [
  {
    component: PersonalInformation,
    name: PROFILE_PATH_NAMES.PERSONAL_INFORMATION,
    path: PROFILE_PATHS.PERSONAL_INFORMATION,
    requiresLOA3: true,
    requiresMVI: true,
  },
  {
    component: ContactInformation,
    name: PROFILE_PATH_NAMES.CONTACT_INFORMATION,
    path: PROFILE_PATHS.CONTACT_INFORMATION,
    requiresLOA3: true,
    requiresMVI: true,
  },
  {
    component: ServiceHistoryInformation,
    name: PROFILE_PATH_NAMES.SERVICE_HISTORY_INFORMATION,
    path: PROFILE_PATHS.SERVICE_HISTORY_INFORMATION,
    requiresLOA3: true,
    requiresMVI: true,
  },
  {
    component: FinancialInformation,
    name: PROFILE_PATH_NAMES.FINANCIAL_INFORMATION,
    path: PROFILE_PATHS.FINANCIAL_INFORMATION,
    requiresLOA3: true,
    requiresMVI: true,
    hasSubnav: true,
  },
  {
    component: DirectDeposit,
    name: PROFILE_PATH_NAMES.DIRECT_DEPOSIT,
    path: PROFILE_PATHS.DIRECT_DEPOSIT,
    requiresLOA3: true,
    requiresMVI: true,
    subnavParent: PROFILE_PATH_NAMES.FINANCIAL_INFORMATION,
  },
  {
    component: HealthCareSettings,
    name: PROFILE_PATH_NAMES.HEALTH_CARE_SETTINGS,
    path: PROFILE_PATHS.HEALTH_CARE_SETTINGS,
    requiresLOA3: true,
    requiresMVI: true,
    hasSubnav: true,
  },
  {
    component: PersonalHealthCareContacts,
    name: PROFILE_PATH_NAMES.HEALTH_CARE_CONTACTS,
    path: PROFILE_PATHS.HEALTH_CARE_CONTACTS,
    requiresLOA3: true,
    requiresMVI: true,
    subnavParent: PROFILE_PATH_NAMES.HEALTH_CARE_SETTINGS,
    featureFlag: 'profileHideHealthCareContacts',
  },
  {
    component: MessagesSignature,
    name: PROFILE_PATH_NAMES.MESSAGES_SIGNATURE,
    path: PROFILE_PATHS.MESSAGES_SIGNATURE,
    requiresLOA3: true,
    requiresMVI: true,
    subnavParent: PROFILE_PATH_NAMES.HEALTH_CARE_SETTINGS,
  },
  {
    component: SchedulingPreferences,
    name: PROFILE_PATH_NAMES.SCHEDULING_PREFERENCES,
    path: PROFILE_PATHS.SCHEDULING_PREFERENCES,
    requiresLOA3: true,
    requiresMVI: true,
    requiresSchedulingPreferencesPilot: true,
    subnavParent: PROFILE_PATH_NAMES.HEALTH_CARE_SETTINGS,
  },
  {
    component: DependentsAndContacts,
    name: PROFILE_PATH_NAMES.DEPENDENTS_AND_CONTACTS,
    path: PROFILE_PATHS.DEPENDENTS_AND_CONTACTS,
    requiresLOA3: true,
    requiresMVI: true,
    hasSubnav: true,
  },
  {
    component: AccreditedRepresentative,
    name: PROFILE_PATH_NAMES.ACCREDITED_REPRESENTATIVE,
    path: PROFILE_PATHS.ACCREDITED_REPRESENTATIVE,
    requiresLOA3: true,
    requiresMVI: true,
    subnavParent: PROFILE_PATH_NAMES.DEPENDENTS_AND_CONTACTS,
  },
  {
    component: LettersAndDocuments,
    name: PROFILE_PATH_NAMES.LETTERS_AND_DOCUMENTS,
    path: PROFILE_PATHS.LETTERS_AND_DOCUMENTS,
    requiresLOA3: true,
    requiresMVI: true,
    hasSubnav: true,
  },
  {
    component: VeteranStatusWrapper,
    name: PROFILE_PATH_NAMES.VETERAN_STATUS_CARD,
    path: PROFILE_PATHS.VETERAN_STATUS_CARD,
    requiresLOA3: true,
    requiresMVI: true,
    subnavParent: PROFILE_PATH_NAMES.LETTERS_AND_DOCUMENTS,
  },
  {
    component: EmailAndTextNotifications,
    name: PROFILE_PATH_NAMES.EMAIL_AND_TEXT_NOTIFICATIONS,
    path: PROFILE_PATHS.EMAIL_AND_TEXT_NOTIFICATIONS,
    requiresLOA3: true,
    requiresMVI: true,
  },
  {
    component: AccountSecurityPage,
    name: PROFILE_PATH_NAMES.ACCOUNT_SECURITY,
    path: PROFILE_PATHS.ACCOUNT_SECURITY,
    requiresLOA3: false,
    hasSubnav: true,
  },
  {
    component: ConnectedApplications,
    name: PROFILE_PATH_NAMES.CONNECTED_APPLICATIONS,
    path: PROFILE_PATHS.CONNECTED_APPLICATIONS,
    requiresLOA3: true,
    requiresMVI: true,
    subnavParent: PROFILE_PATH_NAMES.ACCOUNT_SECURITY,
  },
  {
    component: AccountSecurity,
    name: PROFILE_PATH_NAMES.SIGNIN_INFORMATION,
    path: PROFILE_PATHS.SIGNIN_INFORMATION,
    requiresLOA3: false,
    subnavParent: PROFILE_PATH_NAMES.ACCOUNT_SECURITY,
  },
];

export const getRoutesForNav = (
  { profileHideHealthCareContacts = false } = {
    profileHideHealthCareContacts: false,
  },
) => {
  return routesForNav.filter(route => {
    // filter out routes based on feature flags
    if (route.featureFlag?.includes('profileHideHealthCareContacts')) {
      return !profileHideHealthCareContacts;
    }
    return true;
  });
};

export const routeHasParent = (route, routes) => {
  const matchedRoute = routes.find(r => r.path === route.path);
  return Boolean(matchedRoute?.subnavParent);
};
