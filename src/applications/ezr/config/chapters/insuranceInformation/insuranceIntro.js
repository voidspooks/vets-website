import {
  titleUI,
  descriptionUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import content from '../../../locales/en/content.json';
import { HealthInsuranceDescription } from '../../../components/FormDescriptions/HealthInsuranceDescriptions';
/**
 * Declare schema attributes for health introduction page
 * @returns {PageSchema}
 */
export default {
  uiSchema: {
    ...titleUI(content['insurance-summary-title']),
    ...descriptionUI(HealthInsuranceDescription),
  },
  schema: {
    type: 'object',
    properties: {},
  },
};
