import { format } from 'date-fns';
import React, { useMemo } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import ConfirmationFAQ from '../components/ConfirmationPage/ConfirmationFAQ';
import ConfirmationPrintView from '../components/ConfirmationPage/ConfirmationPrintView';
import ConfirmationScreenView from '../components/ConfirmationPage/ConfirmationScreenView';
import {
  isEnrollmentSubmission,
  isExistingSubmission,
  isNewSubmission,
} from '../utils/helpers';

export const TITLE_BY_SUBMISSION_TYPE = Object.freeze({
  new: 'You submitted your application for CHAMPVA benefits',
  existing: 'You submitted your updated application for CHAMPVA benefits',
  enrollment: 'You submitted your updated information for CHAMPVA benefits',
});

const SUBMISSION_TYPE_RULES = [
  ['new', isNewSubmission],
  ['existing', isExistingSubmission],
  ['enrollment', isEnrollmentSubmission],
];

const getSubmissionTypeTitle = formData => {
  const matchedType = SUBMISSION_TYPE_RULES.find(([, predicate]) =>
    predicate(formData),
  )?.[0];
  return TITLE_BY_SUBMISSION_TYPE[matchedType] || TITLE_BY_SUBMISSION_TYPE.new;
};

const selectFormData = state => ({
  timestamp: state.form.submission?.timestamp,
  formData: state.form.data,
});

const ConfirmationPage = () => {
  const { formData, timestamp } = useSelector(selectFormData, shallowEqual);
  const certifierName = useMemo(
    () => formData.statementOfTruthSignature ?? formData.signature ?? '',
    [formData],
  );
  const submitDate = useMemo(
    () => timestamp && format(new Date(timestamp), 'MMMM d, yyyy'),
    [timestamp],
  );
  const viewProps = useMemo(
    () => ({
      alertTitle: getSubmissionTypeTitle(formData),
      isTypeNew: isNewSubmission(formData),
      certifierName,
      submitDate,
    }),
    [formData, certifierName, submitDate],
  );

  return (
    <div className="confirmation-page vads-u-margin-bottom--2p5">
      <section className="screen-only">
        <ConfirmationScreenView {...viewProps} />
      </section>

      <section className="print-only">
        <ConfirmationPrintView {...viewProps} />
      </section>

      <ConfirmationFAQ formData={formData} />

      <p className="screen-only">
        <va-link href="https://ask.va.gov" text="Go to Ask VA" />
      </p>
      <p className="screen-only">
        <va-link-action href="/" text="Go back to VA.gov" />
      </p>
    </div>
  );
};

export default ConfirmationPage;
