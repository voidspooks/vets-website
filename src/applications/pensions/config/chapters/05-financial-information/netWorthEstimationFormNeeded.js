import { titleUI } from 'platform/forms-system/src/js/web-component-patterns';
import { NetWorthEstimationFormNeededDescription } from '../../../components/Descriptions';
import {
  netWorthEstimateIsOverThreshold,
  adjustTotalNetWorthBooleanIfNeeded,
} from '../../../helpers';

/** @type {PageSchema} */
export default {
  title: 'Additional form needed',
  path: 'financial/net-worth-estimation/additional-form-needed',
  initialData: {},
  depends: formData =>
    formData.totalNetWorth || netWorthEstimateIsOverThreshold(formData),
  uiSchema: {
    ...titleUI(
      'Additional form needed',
      NetWorthEstimationFormNeededDescription,
    ),
  },
  schema: {
    type: 'object',
    properties: {},
  },
  // Adding this form data change for totalNetWorth here instead of on the
  // netWorthEstimation page because changing it before the additional form
  // needed page was preventing the depends from displaying the page. This
  // caused the form to jump to the introduction page
  onContinue: adjustTotalNetWorthBooleanIfNeeded,
};
