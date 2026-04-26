import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { isLOA3, isLoggedIn } from 'platform/user/selectors';
import FormTitle from 'platform/forms-system/src/js/components/FormTitle';
import SaveInProgressIntro from 'platform/forms/save-in-progress/SaveInProgressIntro';
import { focusElement, scrollToTop } from 'platform/utilities/ui';

const OMB_RES_BURDEN = 15;
const OMB_NUMBER = '2900-0154';
const OMB_EXP_DATE = '03/31/2026';

export const IntroductionPage = ({ route, userLoggedIn, userIdVerified }) => {
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
        Service (NCS) program if you completed a short-term enlistment under 10
        U.S.C. &sect; 510.
      </p>

      <h2>Eligibility requirements</h2>
      <p>You may be eligible for NCS education benefits if you:</p>
      <ul>
        <li>First entered military service on or after October 1, 2003</li>
        <li>
          Signed an enlistment contract with the Department of Defense under the
          National Call to Service program
        </li>
        <li>
          Elected an education incentive on DD Form 2863 (National Call to
          Service Election of Options)
        </li>
      </ul>

      <va-alert status="info" visible>
        <h3 slot="headline">What you'll need to apply</h3>
        <div>
          <ul>
            <li>
              <strong>DD Form 2863</strong> (National Call to Service Election
              of Options) — required for eligibility verification
            </li>
            <li>
              <strong>DD Form 214</strong> (Member 4 copy) for all periods of
              active duty service
            </li>
            <li>
              <strong>Bank account information</strong> (routing and account
              numbers) if you want to enroll in direct deposit
            </li>
          </ul>
        </div>
      </va-alert>

      <h2>How to apply</h2>
      <va-process-list>
        <va-process-list-item header="Gather your documents">
          Locate your DD Form 2863 and DD Form 214 Member 4 copy before
          starting. If you are on terminal leave, you may submit without your
          DD Form 214 and provide it when issued.
        </va-process-list-item>
        <va-process-list-item header="Complete the application">
          Fill out all required sections. Your application will be saved as you
          go so you can return and finish later.
        </va-process-list-item>
        <va-process-list-item header="Upload supporting documents">
          Upload your DD Form 2863 and DD Form 214. If enrolling in direct
          deposit, also upload a voided check or deposit slip.
        </va-process-list-item>
        <va-process-list-item header="Submit your application">
          Review all information and certify that your statements are true
          before submitting.
        </va-process-list-item>
      </va-process-list>

      <SaveInProgressIntro
        prefillEnabled={formConfig.prefillEnabled}
        messages={formConfig.saveInProgress.messages}
        pageList={pageList}
        startText="Start the education benefits application"
        unauthStartText="Sign in to start your application"
        headingLevel={2}
        devOnly={{ forceShowFormControls: true }}
      />

      <p>
        <strong>Note:</strong> According to federal law, there are criminal
        penalties, including a fine and/or imprisonment for up to 5 years, for
        withholding information or for providing incorrect information. (See 18
        U.S.C. 1001)
      </p>

      <va-omb-info
        res-burden={OMB_RES_BURDEN}
        omb-number={OMB_NUMBER}
        exp-date={OMB_EXP_DATE}
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