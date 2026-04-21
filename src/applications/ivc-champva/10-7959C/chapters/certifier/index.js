import benefitStatus from './benefitStatus';
import certifierEmail from './certifierEmail';
import certifierRole from './certifierRole';
import { blankSchema } from '../../definitions';
import NotEnrolledPage from '../../components/FormPages/NotEnrolledPage';

const isNotEnrolled = formData =>
  formData['view:champvaBenefitStatus'] === false;

export const certifierPages = {
  certifierRole: {
    path: 'form-signature',
    title: 'Your role in this form',
    ...certifierRole,
  },
  benefitStatus: {
    path: 'champva-screen',
    title: 'Beneficiary’s CHAMPVA benefit status',
    ...benefitStatus,
  },
  benefitApplicationInfo: {
    path: 'benefit-application',
    title: 'Apply for Benefits',
    depends: isNotEnrolled,
    CustomPage: NotEnrolledPage,
    CustomPageReview: null,
    uiSchema: {},
    schema: blankSchema,
  },
  certifierEmail: {
    path: 'signer-email',
    title: 'Your email address',
    ...certifierEmail,
  },
};
