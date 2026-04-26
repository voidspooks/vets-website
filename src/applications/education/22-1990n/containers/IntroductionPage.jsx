import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import FormTitle from 'platform/forms-system/src/js/components/FormTitle';
import SaveInProgressIntro from 'platform/forms/save-in-progress/SaveInProgressIntro';
import { isLOA3, isLoggedIn } from 'platform/user/selectors';
import { focusElement, scrollToTop } from 'platform/utilities/ui';

const OMB_RES_BURDEN = 15;
const OMB_NUMBER = '2900-0154';
const OMB_EXP_DATE = '03/31/2026';

export const IntroductionPage = ({ route, userIdVerified, userLoggedIn }) => {
  const { formConfig, pageList } = route;

  useEffect(() => {
    scrollToTop();
    focusElement('h1');
  }, []);

  return (
    <article className="schemaform-intro">
      <FormTitle
        title="Apply for VA Education Benefits Under the National Call to Service Program"
        subTitle="VA Form 22-1990n"
      />

      <p className="vads-u-font-size--lg">
        Use this form to apply for education benefits under the National Call to
        Service (NCS) program. The NCS program is authorized under Section 510,
        Title 10, U.S. Code.
      </p>

      <h2 className="vads-u-margin-top--3">Eligibility requirements</h2>
      <p>To use this form, you must meet all of the following criteria:</p>
      <ul>
        <li>
          You first entered military service on or after October 1, 2003
        </li>
        <li>
          You signed an enlistment contract with the Department of Defense (DoD)
          specifically under the National Call to Service program
        </li>
        <li>
          You elected one of the education incentives on your DD Form 2863
          (National Call to Service Election of Options)
        </li>
      </ul>

      <va-alert status="info" visible>
        <h3 slot="headline">What you'll need to apply</h3>
        <div>
          <p>Please have the following documents ready before you start:</p>
          <ul>
            <li>
              DD Form 2863 (National Call to Service Election of Options) —
              required
            </li>
            <li>
              DD Form 214 (Member 4 copy) for all periods of active duty service
              — required unless you are on terminal leave pending issuance
            </li>
            <li>
              Voided personal check or deposit slip — required if you want to
              enroll in direct deposit
            </li>
            <li>
              Your Social Security number and date of birth
            </li>
            <li>
              Your military service dates and branch of service
            </li>
          </ul>
        </div>
      </va-alert>

      <h2 className="vads-u-margin-top--3">How to apply</h2>

      <va-process-list>
        <va-process-list-item header="Check your eligibility">
          Answer a few questions to confirm you meet the NCS program
          requirements before starting your application.
        </va-process-list-item>
        <va-process-list-item header="Gather your documents">
          Locate your DD Form 2863, DD Form 214 (Member 4), and banking
          information if you want direct deposit.
        </va-process-list-item>
        <va-process-list-item header="Complete the application">
          Fill out all required sections. The form takes approximately 15
          minutes to complete.
        </va-process-list-item>
        <va-process-list-item header="Submit your application">
          Review your information and submit. You will receive a confirmation
          number after submission.
        </va-process-list-item>
      </va-process-list>

      <SaveInProgressIntro
        prefillEnabled={formConfig.prefillEnabled}
        messages={formConfig.saveInProgress.messages}
        pageList={pageList}
        startText="Start the education benefits application"
        unauthStartText="Sign in to start your application"
        hideUnauthedStartLink={!userLoggedIn}
        devOnly={{ forceShowFormControls: true }}
      />

      {userLoggedIn && !userIdVerified && (
        <va-alert status="warning" visible>
          <h3 slot="headline">Verify your identity to apply</h3>
          <p>
            You need to verify your identity before you can apply for education
            benefits. Verifying your identity helps us protect your personal
            information.
          </p>
        </va-alert>
      )}

      <va-accordion>
        <va-accordion-item header="How are education benefits paid?">
          <p>
            If you are approved for education benefits under the NCS program,
            VA will pay benefits directly to you via direct deposit or check.
            Benefits are paid based on your enrollment certification submitted
            by your school or training establishment using VA Form 22-1999.
          </p>
        </va-accordion-item>
        <va-accordion-item header="Privacy Act information">
          <p>
            The information you provide is covered under the Privacy Act of
            1974 (38 U.S.C. § 3471, 38 U.S.C. § 5701, 38 CFR § 1.526).
            Information is maintained in the System of Records 58VA21/22/28,
            Compensation, Pension, Education and Veteran Readiness and
            Employment Records — VA.
          </p>
        </va-accordion-item>
      </va-accordion>

      <p className="vads-u-margin-top--3">
        <strong>OMB Control Number:</strong> {OMB_NUMBER}
        <br />
        <strong>Expiration Date:</strong> {OMB_EXP_DATE}
        <br />
        <strong>Estimated Response Time:</strong> {OMB_RES_BURDEN} minutes
      </p>

      <SaveInProgressIntro
        prefillEnabled={formConfig.prefillEnabled}
        messages={formConfig.saveInProgress.messages}
        pageList={pageList}
        startText="Start the education benefits application"
        unauthStartText="Sign in to start your application"
        hideUnauthedStartLink={!userLoggedIn}
        buttonOnly
        devOnly={{ forceShowFormControls: true }}
      />
    </article>
  );
};

IntroductionPage.propTypes = {
  route: PropTypes.shape({
    formConfig: PropTypes.shape({
      prefillEnabled: PropTypes.bool,
      saveInProgress: PropTypes.shape({
        messages: PropTypes.shape({}),
      }),
    }),
    pageList: PropTypes.array,
  }),
  userIdVerified: PropTypes.bool,
  userLoggedIn: PropTypes.bool,
};

const mapStateToProps = state => ({
  userIdVerified: isLOA3(state),
  userLoggedIn: isLoggedIn(state),
});

export default connect(mapStateToProps)(IntroductionPage);