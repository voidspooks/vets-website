import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import environment from 'platform/utilities/environment';
import LoadingIndicator from '../LoadingIndicator';

const LETTER_ENDPOINT = `${
  environment.API_URL
}/meb_api/v0/forms_claim_letter?type=Chapter35`;

const ConfirmationDenied = ({
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
        claimStatus: 'DENIED',
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
  const chapterLabel = isFry ? 'FRY, Chapter 33' : 'DEA, Chapter 35';

  return (
    <>
      <div className="vads-u-margin-bottom--6">
        <va-alert
          close-btn-aria-label="Close notification"
          status="info"
          visible
        >
          <h3 slot="headline">You’re not eligible for this benefit</h3>
          <div>
            Unfortunately, based on the information you provided and Department
            of Defense records, we have determined you are not eligible for the
            {benefitName} at this time. Your denial letter, which explains why
            you are ineligible, is now available. A physical copy will also be
            mailed to your mailing address.
          </div>
          <va-link
            download
            href={LETTER_ENDPOINT}
            filetype="PDF"
            text="Download your denial letter"
            class="vads-u-padding-top--2"
          />
        </va-alert>
      </div>
      <va-summary-box class="vads-u-margin-y--3">
        <h3
          slot="headline"
          className="vads-u-margin-top--0 vads-u-margin-bottom--0"
        >
          Application for VA Education Benefits (VA Form 22-5490)
        </h3>
        <h3
          slot="headline"
          className="vads-u-margin-top--0 vads-u-margin-bottom--0"
        >
          {chapterLabel}
        </h3>

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

        <div className="vads-u-margin-bottom--1">
          <h4 className="vads-u-margin-bottom--0p5 vads-u-font-weight--bold">
            Confirmation for your records
          </h4>
          <p className="vads-u-margin--0">
            You can print this confirmation page for your records.
          </p>
        </div>

        <div className="vads-u-margin-bottom--1">
          <va-button
            uswds
            className="usa-button vads-u-margin-top--3 vads-u-width--auto"
            text="Print this page"
            onClick={printPage}
          />
        </div>
      </va-summary-box>
      <div className="vads-u-margin-bottom--4">
        <h2>What happens next?</h2>
        <ul>
          <li>
            <va-link
              href={LETTER_ENDPOINT}
              download
              filetype="PDF"
              text="Download a copy of your denial letter for your records"
            />
            .
          </li>
          <li>
            We will review your eligibility for other VA education benefit
            programs.
          </li>
          <li>
            We’ll notify you if you’re eligible for other VA education benefits.
          </li>
          <li>There is no further action required by you at this time.</li>
          <li>
            <va-link
              href="https://benefits.va.gov/gibill/docs/gibguideseries/chooseyoureducationbenefits.pdf"
              external
              filetype="PDF"
              text="Learn more about VA benefits and programs through the Building Your Future with the GI Bill Series"
            />
            .
          </li>
        </ul>
      </div>
      <div className="vads-u-margin-bottom--4">
        <h2>What can I do if I disagree with this decision?</h2>
        <p>
          If you disagree with our decision, you can file an appeal. For more
          information about filing an appeal, visit{' '}
          <va-link
            href="https://www.va.gov/decision-reviews/"
            text="VA.gov's decision reviews page"
          />
          .
        </p>
      </div>
    </>
  );
};

ConfirmationDenied.propTypes = {
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

ConfirmationDenied.defaultProps = {
  confirmationError: null,
  confirmationLoading: false,
};

export default ConfirmationDenied;
