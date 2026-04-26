import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import FormTitle from 'platform/forms-system/src/js/components/FormTitle';
import SaveInProgressIntro from 'platform/forms/save-in-progress/SaveInProgressIntro';
import { focusElement, scrollToTop } from 'platform/utilities/ui';

const TITLE = 'Apply for VA Education Benefits Under the National Call to Service Program';
const SUBTITLE = 'VA Form 22-1990n';

const OMB_RES_BURDEN = 15;
const OMB_NUMBER = '2900-0154';
const OMB_EXP_DATE = '03/31/2026';

export const IntroductionPage = ({ route }) => {
  const { formConfig, pageList } = route;

  useEffect(() => {
    scrollToTop();
    focusElement('h1');
  }, []);

  return (
    <article className="schemaform-intro">
      <FormTitle title={TITLE} subTitle={SUBTITLE} />

      <p className="vads-u-font-size--lg">
        Use this form to apply for education benefits under the National Call to
        Service (NCS) program. The NCS program is for servicemembers who signed
        an NCS enlistment contract with the Department of Defense.
      </p>

      <h2 className="vads-u-margin-top--3">Eligibility requirements</h2>
      <p>You may be eligible for NCS education benefits if you:</p>
      <ul>
        <li>First entered military service on or after October 1, 2003</li>
        <li>
          Signed an enlistment contract with the Department of Defense under the
          National Call to Service program
        </li>
        <li>
          Elected one of the two education incentives provided by the NCS
          program, as documented on DD Form 2863
        </li>
      </ul>

      <va-alert status="info" visible>
        <p className="vads-u-margin-y--0">
          <strong>Save time</strong> — sign in to pre-fill your personal
          information and save your progress as you go.
        </p>
      </va-alert>

      <h2 className="vads-u-margin-top--3">What you&apos;ll need to apply</h2>
      <p>
        Please have the following documents available before you begin. You will
        need to upload them during the application.
      </p>
      <ul>
        <li>
          <strong>DD Form 2863</strong> (NCS Election of Options) — required
        </li>
        <li>
          <strong>DD Form 214</strong> (Member 4 copy) — required (may be
          submitted later if you are on terminal leave)
        </li>
        <li>
          <strong>Voided personal check or deposit slip</strong> — required if
          you choose to enroll in direct deposit
        </li>
      </ul>

      <va-accordion>
        <va-accordion-item header="Eligibility details">
          <p>
            The NCS program was created under Section 510, Title 10, U.S. Code.
            To be eligible, you must have completed the active duty component of
            the NCS program (typically 15 months) and elected either:
          </p>
          <ul>
            <li>
              A cash bonus, followed by service in the Selected Reserve, or
            </li>
            <li>
              Education assistance under Chapter 30 (Montgomery GI Bill), or
            </li>
            <li>
              Student loan repayment under the College Loan Repayment Program,
              or
            </li>
            <li>
              A combination of these benefits as specified on DD Form 2863
            </li>
          </ul>
          <p>
            Eligibility is determined by VBA adjudicators after your application
            is submitted. Filing this form does not guarantee benefits.
          </p>
        </va-accordion-item>
        <va-accordion-item header="Privacy Act information">
          <p>
            <strong>
              PRIVACY ACT INFORMATION (Title 38, U.S.C. 3471; 38 CFR 21.9635):
            </strong>{' '}
            The information requested on this form is used to determine your
            eligibility for VA education benefits. It is authorized by Title 38,
            U.S.C., Chapter 30, and may be disclosed pursuant to a routine use
            identified in the Privacy Act system of records{' '}
            <strong>58VA21/22/28</strong> — Compensation, Pension, Education and
            Veteran Readiness and Employment Records — VA.
          </p>
          <p>
            Providing this information is voluntary. Failure to furnish the
            information will delay or may prevent a decision on your entitlement
            to benefits.
          </p>
          <p>
            <strong>Respondent Burden:</strong> We need this information to
            determine your eligibility for education benefits. Title 38 U.S.C.
            501(a) and (b) authorizes collection of this information. The
            estimated burden is <strong>{OMB_RES_BURDEN} minutes</strong> to
            complete this form. OMB Control No.{' '}
            <strong>{OMB_NUMBER}</strong>, expires{' '}
            <strong>{OMB_EXP_DATE}</strong>.
          </p>
        </va-accordion-item>
      </va-accordion>

      <SaveInProgressIntro
        headingLevel={2}
        prefillEnabled={formConfig.prefillEnabled}
        messages={formConfig.saveInProgress.messages}
        pageList={pageList}
        startText="Start the education benefits application"
        devOnly={{ forceShowFormControls: true }}
      />

      <div className="omb-info--container vads-u-padding-left--0 vads-u-margin-top--2">
        <va-omb-info
          res-burden={OMB_RES_BURDEN}
          omb-number={OMB_NUMBER}
          exp-date={OMB_EXP_DATE}
        />
      </div>
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
};

export default IntroductionPage;