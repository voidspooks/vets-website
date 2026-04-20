import { TOGGLE_KEY } from '../constants';

export const prefillTransformer = (pages, formData, metadata) => {
  if (!formData?.[`view:${TOGGLE_KEY}`]) {
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
