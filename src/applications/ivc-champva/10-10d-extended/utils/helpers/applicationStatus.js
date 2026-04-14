import { not, whenAll, whenAny } from './form-config';

export const enhancedFlowEnabled = formData =>
  formData['view:form1010dEnhancedFlowEnabled'] === true;

export const submissionTypeIs = type => formData =>
  formData.submissionType === type;

export const isNewSubmission = whenAny(
  not(enhancedFlowEnabled),
  submissionTypeIs('new'),
);

export const isExistingSubmission = whenAll(
  enhancedFlowEnabled,
  submissionTypeIs('existing'),
);

export const isEnrollmentSubmission = whenAll(
  enhancedFlowEnabled,
  submissionTypeIs('enrollment'),
);
