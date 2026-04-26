import { transformForSubmit as platformTransformForSubmit } from 'platform/forms-system/src/js/helpers';

export default function transformForSubmit(formConfig, form) {
  const transformedData = JSON.parse(
    platformTransformForSubmit(formConfig, form),
  );

  return JSON.stringify({
    educationBenefitsClaim: {
      form: JSON.stringify(transformedData),
      formType: '1990n',
    },
  });
}