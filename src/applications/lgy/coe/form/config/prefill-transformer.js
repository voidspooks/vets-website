import { TOGGLE_NAMES } from 'platform/utilities/feature-toggles';
import { toggleValuesSelector } from 'platform/utilities/feature-toggles/useFeatureToggle';
import { TOGGLE_KEY } from '../constants';

export const prefillTransformer = (pages, formData, metadata, state) => {
  const toggles = toggleValuesSelector(state);

  if (!toggles[TOGGLE_NAMES[TOGGLE_KEY]]) {
    return { pages, formData, metadata };
  }

  const { veteranSsnLastFour = '' } = formData?.nonPrefill || {};

  return {
    pages,
    formData: {
      ...formData,
      veteranSsnLastFour,
    },
    metadata,
  };
};
