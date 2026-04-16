import PropTypes from 'prop-types';
import React from 'react';
import { CHAMPVA_PHONE_NUMBER } from '../../../shared/constants';
import { CONTACTS } from '../../utils/imports';
import {
  isEnrollmentSubmission,
  isNewSubmission,
  not,
} from '../../utils/helpers';
import { APP_URLS } from '../../utils/appUrls';

const ConfirmationFAQ = ({ formData }) => {
  const isEnrollment = isEnrollmentSubmission(formData);
  const isUpdate = not(isNewSubmission)(formData);
  const nounPlural = isEnrollment ? 'beneficiaries' : 'applicants';
  return (
    <>
      <section className="confirmation-faq">
        <h2>What to expect next</h2>
        {isEnrollment ? (
          <div data-testid="1010d-confirmation-enrollment-faq">
            <p>We’ll review and process your form.</p>
            <p>
              If we have any questions or need more information, we’ll contact
              you.
            </p>
          </div>
        ) : (
          <div data-testid="1010d-confirmation-apply-faq">
            <p>
              You don’t need to do anything unless we send you a letter asking
              for more information.
            </p>
            <p>
              If you or the applicants are eligible for CHAMPVA, we’ll send a
              CHAMPVA ID card and guide in the mail.
            </p>
            <p>
              <va-link
                href="/resources/what-to-do-after-applying-for-champva-benefits/"
                text="Learn what to do after you apply for CHAMPVA benefits"
                external
              />
            </p>
          </div>
        )}

        {isUpdate && (
          <div data-testid="1010d-confirmation-update-faq">
            <h3>If you need to update information for other {nounPlural}</h3>
            <p>You can submit a new form and follow the same steps.</p>
            <p>
              <va-link
                href={APP_URLS['1010d']}
                text={`Update information for other ${nounPlural}`}
                external
              />
            </p>
          </div>
        )}
      </section>

      <section className="confirmation-faq">
        <h2>How to contact us about your application</h2>
        <p>
          If you have any questions about your application, call us at{' '}
          <va-telephone contact={CHAMPVA_PHONE_NUMBER} /> (
          <va-telephone contact={CONTACTS['711']} tty />
          ). We’re here Monday through Friday, 8:00 a.m. to 7:30 p.m.{' '}
          <dfn>
            <abbr title="Eastern Time">ET</abbr>
          </dfn>
          .
        </p>

        <p>You can also use Ask VA to ask questions online.</p>
      </section>
    </>
  );
};

ConfirmationFAQ.propTypes = {
  formData: PropTypes.object,
};

export default ConfirmationFAQ;
