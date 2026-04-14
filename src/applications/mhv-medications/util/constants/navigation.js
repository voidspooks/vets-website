export const Paths = {
  LANDING: '/',
  HISTORY: '/history',
  IN_PROGRESS: '/in-progress',
};

export const InnerNavigationPaths = [
  {
    path: Paths.LANDING,
    label: 'Medication Refills',
    mobileLabel: 'Med refills',
    datatestid: 'landing-inner-nav',
  },
  {
    path: Paths.HISTORY,
    label: 'Medications List',
    mobileLabel: 'Meds list',
    datatestid: 'history-inner-nav',
  },
  {
    path: Paths.IN_PROGRESS,
    label: 'Refill Status',
    datatestid: 'in-progress-inner-nav',
  },
];
