import React from 'react';
import { CHAMPVA_PHONE_NUMBER } from '../../../shared/constants';
import { CONTACTS } from '../../utils/imports';

const ConfirmationFAQ = () => (
  <>
    <section className="confirmation-faq">
      <h2>What to expect next</h2>
      <p>
        You don’t need to do anything unless we send you a letter asking for
        more information.
      </p>
      <p>
        If you or the applicants are eligible for CHAMPVA, we’ll send a CHAMPVA
        ID card and guide in the mail.
      </p>
      <p>
        <va-link
          href="/resources/what-to-do-after-applying-for-champva-benefits/"
          text="Learn what to do after you apply for CHAMPVA benefits"
          external
        />
      </p>
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

export default ConfirmationFAQ;
