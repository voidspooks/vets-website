import { enhancedFlowEnabled } from '../../utils/helpers';
import contactInformation from './contactInformation';
import role from './role';
import submissionType from './submissionType';

export const applicationStatusPages = {
  submissionType: {
    path: 'submission-type',
    title: 'CHAMPVA application or enrollment status',
    depends: enhancedFlowEnabled,
    ...submissionType,
  },
  certifierRole: {
    path: 'who-is-applying',
    title: 'Your role in this submission',
    ...role,
  },
  primaryContactInformation: {
    path: 'primary-contact-information',
    title: 'Your contact information',
    depends: enhancedFlowEnabled,
    ...contactInformation,
  },
};
