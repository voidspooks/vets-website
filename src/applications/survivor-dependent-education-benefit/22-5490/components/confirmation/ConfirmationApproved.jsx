import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import environment from 'platform/utilities/environment';
import LoadingIndicator from '../LoadingIndicator';

const LETTER_ENDPOINT = `${
  environment.API_URL
}/meb_api/v0/forms_claim_letter?type=Chapter35`;

const ConfirmationApproved = ({
  claimantName,
  confirmationDate,
  confirmationError,
  confirmationLoading,
  printPage,
  sendConfirmation,
  userEmail,
  userFirstName,
  chosenBenefit,
}) => {
  useEffect(
    () => {
      sendConfirmation({
        claimStatus: 'ELIGIBLE',
        email: userEmail,
        firstName: userFirstName,
      });
    },
    [sendConfirmation, userEmail, userFirstName],
  );

  if (confirmationLoading) {
    return <LoadingIndicator message="Sending confirmation email..." />;
  }

  if (confirmationError) {
    // Continue to show confirmation page even if email fails
    // eslint-disable-next-line no-console
    console.error('Error sending confirmation email:', confirmationError);
  }

  const isFry = chosenBenefit === 'fry';
  const benefitName = isFry
    ? 'Fry Scholarship'
    : "Survivors' and Dependents' Educational Assistance";
  const chapterNumber = isFry ? 'Chapter 33' : 'Chapter 35';

  return (
    <>
      <div className="vads-u-margin-bottom--6">
        <va-alert
          close-btn-aria-label="Close notification"
          status="success"
          visible
        >
          <h3 slot="headline">
            Congratulations! You have been approved for the {benefitName},{' '}
            {chapterNumber}
          </h3>
          <div>
            We reviewed your application and have determined that you are
            eligible for educational benefits under the {benefitName},{' '}
            {chapterNumber}. Your Certificate of Eligibility is now available. A
            physical copy will also be mailed to your mailing address.
          </div>
          <va-link
            download
            href={LETTER_ENDPOINT}
            filetype="PDF"
            text="Download your Certificate of Eligibility"
            class="vads-u-padding-top--2"
          />
        </va-alert>
      </div>

      <h2>Application for VA Education Benefits (VA Form 22-5490)</h2>

      <va-accordion>
        <va-accordion-item header="Information you submitted on this form">
          <div className="vads-u-margin-bottom--2">
            <h4 className="vads-u-margin-bottom--0p5 vads-u-font-weight--bold">
              Who submitted this form
            </h4>
            {claimantName.trim() ? (
              <p className="vads-u-margin--0">{claimantName}</p>
            ) : (
              <p className="vads-u-margin--0">Not provided</p>
            )}
          </div>

          <div className="vads-u-margin-bottom--2">
            <h4 className="vads-u-margin-bottom--0p5 vads-u-font-weight--bold">
              Date received
            </h4>
            <p className="vads-u-margin--0">{confirmationDate}</p>
          </div>
        </va-accordion-item>
      </va-accordion>

      <div className="vads-u-margin-top--4">
        <h3>Print this confirmation page</h3>
        <p>
          If you’d like to keep a copy of the information on this page, you can
          print it now. You won’t be able to access this page later. Please note
          that an email with this information will be automatically sent to your
          email provided on the application.
        </p>
        <va-button
          uswds
          className="usa-button vads-u-margin-top--2 vads-u-width--auto"
          text="Print this page for your records"
          onClick={printPage}
        />
      </div>

      <div className="vads-u-margin-top--4 vads-u-margin-bottom--4">
        <h2>What to expect next</h2>
        <h3>Download your Certificate of Eligibility</h3>
        <p>
          Once you’ve confirmed your school or program, you may bring your
          Certificate of Eligibility to your School Certifying Official to
          provide proof of eligibility.
        </p>
      </div>

      <div className="vads-u-margin-bottom--4">
        <h2>What can I do while I wait</h2>
        <ul>
          <li>
            If you need to submit documentation to VA, such as service records,
            please send this through our{' '}
            <va-link href="https://ask.va.gov" external text="Ask VA" />{' '}
            feature.
          </li>
          <li>
            Review and/or update your direct deposit information on your{' '}
            <va-link href="/profile" text="VA.gov profile" />.
          </li>
          <li>
            Use our{' '}
            <va-link
              href="https://www.va.gov/education/gi-bill-comparison-tool/"
              text="GI Bill Comparison Tool"
            />{' '}
            to help you decide which school is best for you.
          </li>
          <li>
            Learn more about VA benefits and programs through the{' '}
            <va-link
              href="https://benefits.va.gov/gibill/docs/gibguideseries/chooseyoureducationbenefits.pdf"
              external
              filetype="PDF"
              text="Building Your Future with the GI Bill Series"
            />
            .
          </li>
        </ul>
      </div>
    </>
  );
};

ConfirmationApproved.propTypes = {
  chosenBenefit: PropTypes.string.isRequired,
  claimantName: PropTypes.string.isRequired,
  confirmationDate: PropTypes.string.isRequired,
  printPage: PropTypes.func.isRequired,
  sendConfirmation: PropTypes.func.isRequired,
  userEmail: PropTypes.string.isRequired,
  userFirstName: PropTypes.string.isRequired,
  confirmationError: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  confirmationLoading: PropTypes.bool,
};

ConfirmationApproved.defaultProps = {
  confirmationError: null,
  confirmationLoading: false,
};

export default ConfirmationApproved;
