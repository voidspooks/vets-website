import { arrayBuilderPages } from 'platform/forms-system/src/js/patterns/array-builder';
import summaryPage, { insuranceArrayOptions } from './policySummary';
import policyInformation from './policyInformation';

import content from '../../../locales/en/content.json';

const healthInsurancePolicyPages = arrayBuilderPages(
  insuranceArrayOptions,
  pagebuilder => ({
    healthInsurancePolicySummary: pagebuilder.summaryPage({
      title: content['insurance-summary-title'],
      path: 'insurance-information/policies',
      ...summaryPage,
    }),
    healthInsurancePolicyInformation: pagebuilder.itemPage({
      path: 'insurance-information/:index/policy-information',
      title: content['insurance-policy-information-title'],
      ...policyInformation,
    }),
  }),
);

export default healthInsurancePolicyPages;
