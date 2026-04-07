import { arrayBuilderPages } from 'platform/forms-system/src/js/patterns/array-builder';
import {
  hasEligibleApplicant,
  hasPartA,
  hasPartB,
  hasPartC,
  hasPartD,
  hasPartsABorC,
  needsDenialProof,
  needsIneligibilityProof,
} from '../../utils/helpers';
import medicareIntroduction from './medicareIntroduction';
import medicareNumber from './medicareNumber';
import ohiIntroduction from './ohiIntroduction';
import partACardUpload from './partACardUpload';
import partADenialNotice from './partADenialNotice';
import partADenialProof from './partADenialProof';
import partAEffectiveDate from './partAEffectiveDate';
import partAEligibilityStatus from './partAEligibilityStatus';
import partAIneligibilityProof from './partAIneligibilityProof';
import partAPartBCardUpload from './partAPartBCardUpload';
import partAPartBEffectiveDates from './partAPartBEffectiveDates';
import partBCardUpload from './partBCardUpload';
import partBEffectiveDate from './partBEffectiveDate';
import partCCardUpload from './partCCardUpload';
import partCCarrier from './partCCarrier';
import partDCardUpload from './partDCardUpload';
import partDEffectiveDate from './partDEffectiveDate';
import partDStatus from './partDStatus';
import participants from './participants';
import planTypes from './planTypes';
import summary, { medicareOptions } from './summary';

export const medicarePages = {
  ohiIntro: {
    path: 'medicare-and-other-health-insurance',
    title: 'Report Medicare and other health insurance',
    ...ohiIntroduction,
  },
  medicareIntro: {
    path: 'report-medicare',
    title: 'Report Medicare',
    ...medicareIntroduction,
  },
  ...arrayBuilderPages(medicareOptions, pageBuilder => ({
    medicareSummary: pageBuilder.summaryPage({
      path: 'medicare-plans',
      title: 'Medicare plans',
      ...summary,
    }),
    participant: pageBuilder.itemPage({
      path: 'medicare-participants/:index',
      title: 'Medicare participant',
      ...participants,
    }),
    medicarePlanType: pageBuilder.itemPage({
      path: 'medicare-plan-type/:index',
      title: 'Medicare plan type',
      ...planTypes,
    }),
    medicareBeneficiaryIdentifier: pageBuilder.itemPage({
      path: 'medicare-beneficiary-identifier/:index',
      title: 'Medicare beneficiary identifier',
      ...medicareNumber,
    }),
    medicarePartAEffectiveDate: pageBuilder.itemPage({
      path: 'medicare-part-a-effective-date/:index',
      title: 'Medicare Part A effective date',
      depends: hasPartA,
      ...partAEffectiveDate,
    }),
    medicarePartACardUpload: pageBuilder.itemPage({
      path: 'medicare-part-a-card/:index',
      title: 'Upload Medicare Part A card',
      depends: hasPartA,
      ...partACardUpload,
    }),
    medicarePartBEffectiveDate: pageBuilder.itemPage({
      path: 'medicare-part-b-effective-date/:index',
      title: 'Medicare Part B effective date',
      depends: hasPartB,
      ...partBEffectiveDate,
    }),
    medicarePartBCardUpload: pageBuilder.itemPage({
      path: 'medicare-part-b-card/:index',
      title: 'Upload Medicare Part B card',
      depends: hasPartB,
      ...partBCardUpload,
    }),
    medicarePartADenial: pageBuilder.itemPage({
      path: 'medicare-part-a-denial-notice/:index',
      title: 'Medicare Part A denial',
      depends: hasPartB,
      ...partADenialNotice,
    }),
    medicarePartADenialProofUpload: pageBuilder.itemPage({
      path: 'medicare-proof-of-part-a-denial/:index',
      title: 'Upload proof of Medicare ineligibility',
      depends: needsDenialProof,
      ...partADenialProof,
    }),
    medicarePartAPartBEffectiveDates: pageBuilder.itemPage({
      path: 'medicare-parts-a-and-b-effective-dates/:index',
      title: 'Medicare effective dates',
      depends: hasPartsABorC,
      ...partAPartBEffectiveDates,
    }),
    medicareABCardUpload: pageBuilder.itemPage({
      path: 'medicare-parts-a-and-b-card/:index',
      title: 'Upload Medicare card (A/B)',
      depends: hasPartsABorC,
      ...partAPartBCardUpload,
    }),
    medicarePartCCarrierEffectiveDate: pageBuilder.itemPage({
      path: 'medicare-part-c-carrier-and-effective-date/:index',
      title: 'Medicare Part C carrier and effective date',
      depends: hasPartC,
      ...partCCarrier,
    }),
    medicarePartCCardUpload: pageBuilder.itemPage({
      path: 'medicare-part-c-card/:index',
      title: 'Upload Medicare Part C card',
      depends: hasPartC,
      ...partCCardUpload,
    }),
    medicarePartDStatus: pageBuilder.itemPage({
      path: 'medicare-part-d-status/:index',
      title: 'Medicare Part D status',
      ...partDStatus,
    }),
    medicarePartDCarrierEffectiveDate: pageBuilder.itemPage({
      path: 'medicare-part-d-carrier-and-effective-date/:index',
      title: 'Medicare Part D carrier and effective date',
      depends: hasPartD,
      ...partDEffectiveDate,
    }),
    medicarePartDCardUpload: pageBuilder.itemPage({
      path: 'medicare-part-d-card/:index',
      title: 'Upload Medicare Part D card',
      depends: hasPartD,
      ...partDCardUpload,
    }),
  })),
  medicareEligibilityStatus: {
    path: 'medicare-status',
    title: 'Medicare status',
    depends: hasEligibleApplicant,
    ...partAEligibilityStatus,
  },
  medicareIneligibilityProof: {
    path: 'medicare-proof-of-ineligibility',
    title: 'Proof of Medicare ineligibility',
    depends: needsIneligibilityProof,
    ...partAIneligibilityProof,
  },
};
