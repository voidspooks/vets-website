import { summaryOfEvidenceDescription } from '../content/summaryOfEvidence';
import { standardTitle } from '../content/form0781';
import { isEvidenceEnhancement } from '../utils';

export const uiSchema = {
  'ui:title': ({ formData }) => {
    return isEvidenceEnhancement(formData)
      ? standardTitle(
          'Summary of supporting evidence for your disability claim',
        )
      : standardTitle('Summary of evidence');
  },
  'ui:description': summaryOfEvidenceDescription,
};

export const schema = {
  type: 'object',
  properties: {},
};
