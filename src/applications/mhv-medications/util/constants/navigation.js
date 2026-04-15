export const Paths = {
  LANDING: '/',
  LIST: '/list',
  REFILL_STATUS: '/refill-status',
};

export const InnerNavigationPaths = [
  {
    path: Paths.LANDING,
    label: 'Medication Refills',
    mobileLabel: 'Med refills',
    datatestid: 'landing-inner-nav',
  },
  {
    path: Paths.LIST,
    label: 'Medications List',
    mobileLabel: 'Meds list',
    datatestid: 'list-inner-nav',
  },
  {
    path: Paths.REFILL_STATUS,
    label: 'Refill Status',
    datatestid: 'refill-status-inner-nav',
  },
];
