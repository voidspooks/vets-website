import { arrayBuilderPages } from 'platform/forms-system/src/js/patterns/array-builder';
import {
  hasOhi,
  hasTypeOther,
  isNewClaim,
  policyDatesEnabled,
  whenAll,
} from '../../utils/helpers';
import insuranceStatus from './insuranceStatus';
import insuranceType from './insuranceType';
import insuranceTypeOther from './insuranceTypeOther';
import overview from './overview';
import policy from './policy';
import provider from './provider';
import summary, { insuranceOptions } from './summary';

export const insurancePages = {
  insuranceStatus: {
    path: 'insurance-status',
    title: 'Beneficiary health insurance status',
    depends: isNewClaim,
    ...insuranceStatus,
  },
  ...arrayBuilderPages(insuranceOptions, pageBuilder => ({
    insuranceIntro: pageBuilder.introPage({
      path: 'insurance-intro',
      title: '[noun plural]',
      depends: hasOhi,
      ...overview,
    }),
    insuranceSummary: pageBuilder.summaryPage({
      title: 'Review your [noun plural]',
      path: 'insurance-review',
      depends: hasOhi,
      ...summary,
    }),
    insurancePolicy: pageBuilder.itemPage({
      title: 'Policy information',
      path: 'policy-info/:index',
      depends: hasOhi,
      ...policy,
    }),
    insuranceProvider: pageBuilder.itemPage({
      title: 'Provider information',
      path: 'provider-info/:index',
      depends: policyDatesEnabled,
      ...provider,
    }),
    insuranceType: pageBuilder.itemPage({
      title: 'Insurance type',
      path: 'insurance-type/:index',
      depends: hasOhi,
      ...insuranceType,
    }),
    insuranceTypeOther: pageBuilder.itemPage({
      title: 'Other insurance type',
      path: 'insurance-type-other/:index',
      depends: whenAll(hasOhi, hasTypeOther),
      ...insuranceTypeOther,
    }),
  })),
};
