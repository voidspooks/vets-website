import { transformForSubmit as formsSystemTransformForSubmit } from 'platform/forms-system/src/js/helpers';
import { format } from 'date-fns-tz';

function formatDateTime(date) {
  const formatted = format(date, 'MMMM dd, yyyy h:mm aaaa z');
  return formatted.replace(/\b([A-Z])[SD]T\b/, '$1T');
}

export default function transformForSubmit(formConfig, form) {
  const transformedData = JSON.parse(
    formsSystemTransformForSubmit(formConfig, form),
  );

  const dateSubmitted = new Date();
  const dateExpires = new Date(dateSubmitted);
  dateExpires.setFullYear(dateExpires.getFullYear() + 1);

  return JSON.stringify({
    ...transformedData,
    formNumber: formConfig.formId,
    dateSubmitted: formatDateTime(dateSubmitted),
    dateExpires: formatDateTime(dateExpires),
  });
}
