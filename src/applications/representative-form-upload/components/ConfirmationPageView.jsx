import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { Toggler } from 'platform/utilities/feature-toggles';
import { scrollTo } from 'platform/utilities/scroll';
import { waitForRenderThenFocus } from 'platform/utilities/ui/focus';

export const ConfirmationPageView = ({
  name,
  submitDate,
  confirmationNumber,
  childContent = null,
  claimantId,
}) => {
  const { first, last } = name;
  const alertRef = useRef(null);

  const formattedSubmitDate =
    submitDate && typeof submitDate === 'object'
      ? format(submitDate, 'MMMM d, yyyy')
      : null;

  useEffect(
    () => {
      if (alertRef?.current) {
        scrollTo('topScrollElement');
        // delay focus for Safari
        waitForRenderThenFocus('h2', alertRef.current);
      }
    },
    [alertRef],
  );

  return (
    <div>
      <div className="print-only">
        <img
          src="https://www.va.gov/img/design/logo/logo-black-and-white.png"
          alt="VA logo"
          width="300"
        />
      </div>
      <va-alert uswds status="success" ref={alertRef}>
        {submitDate && <h2>You’ve submitted the form</h2>}
        {formattedSubmitDate ? (
          <p>
            You submitted the form and supporting evidence on{' '}
            <strong>{formattedSubmitDate}</strong>
          </p>
        ) : null}
        <p>
          Your confirmation number is: <strong>{confirmationNumber}</strong>
        </p>
        <p>
          <strong>Note:</strong> Print this page or copy the confirmation number
          for your records.
        </p>
      </va-alert>
      <Toggler
        toggleName={
          Toggler.TOGGLE_NAMES.accreditedRepresentativePortalClaimantDetails
        }
      >
        <Toggler.Enabled>
          <va-link-action
            href={`/representative/find-claimant/submission-history/${claimantId}`}
            class="vads-u-margin-top--2"
            text={`Go to ${first} ${last}'s submission history`}
            type="secondary"
          />
        </Toggler.Enabled>
      </Toggler>
      <section>
        <h2 className="vads-u-margin-top--3">What to expect</h2>
        <va-process-list>
          <va-process-list-item header="Now, we'll process your form">
            <p>
              The submission is in progress and is being processed through
              Central Mail before reaching VBMS.
            </p>
          </va-process-list-item>
          <va-process-list-item header="Next, we'll review the files">
            <p>
              If we need more information after reviewing the form and
              supporting evidence, we’ll contact you by email.
            </p>
          </va-process-list-item>
        </va-process-list>
      </section>
      <va-link-action
        href="/representative/submissions"
        class="vads-u-margin-bottom--4"
        text="Go back to submissions"
        type="secondary"
      />
      {childContent || null}
    </div>
  );
};

ConfirmationPageView.propTypes = {
  childContent: PropTypes.object,
  claimantId: PropTypes.string,
  confirmationNumber: PropTypes.string,
  name: PropTypes.shape({
    first: PropTypes.string,
    last: PropTypes.string,
  }),
  submitDate: PropTypes.object,
};
