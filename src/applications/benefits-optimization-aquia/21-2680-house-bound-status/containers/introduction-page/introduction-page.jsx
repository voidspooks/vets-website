/**
 * @module containers/IntroductionPage
 * @description Introduction page for VA Form 21-2680
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { focusElement, scrollToTop } from 'platform/utilities/ui';
import FormTitle from 'platform/forms-system/src/js/components/FormTitle';
import SaveInProgressIntro from 'platform/forms/save-in-progress/SaveInProgressIntro';
import { useSelector } from 'react-redux';
import { isLOA3, isLoggedIn } from 'platform/user/selectors';
import {
  TITLE,
  SUBTITLE,
} from '@bio-aquia/21-2680-house-bound-status/constants';
import VerifyAlert from 'platform/user/authorization/components/VerifyAlert';

/** @constant {number} OMB_RES_BURDEN - Estimated burden in minutes */
const OMB_RES_BURDEN = 30;

/** @constant {string} OMB_NUMBER - OMB control number */
const OMB_NUMBER = '2900-0721';

/** @constant {string} OMB_EXP_DATE - OMB expiration date */
const OMB_EXP_DATE = '02/28/2026';

/**
 * Process list component
 * @returns {React.ReactElement} Process steps
 */
const ProcessList = () => {
  return (
    <va-process-list>
      <va-process-list-item header="Check eligibility requirements before you apply">
        <p>
          If you think you (or someone you provide care for) may be eligible,
          but you’re not sure, we encourage you to apply. Special Monthly
          Compensation (SMC) or Special Monthly Pension (SMP) benefits are
          granted if the person applying:
        </p>
        <ul>
          <li>
            Requires help with everyday tasks, such as:
            <ul>
              <li>Bathing</li>
              <li>Feeding</li>
              <li>Dressing</li>
              <li>Using the restroom</li>
              <li>Adjusting prosthetic devices</li>
              <li>
                Protecting themself from the hazards of the daily environment
              </li>
            </ul>
          </li>
          <li>Is housebound (because of permanent disability)</li>
        </ul>
        <p>To receive Special Monthly Compensation the person applying must:</p>
        <ul>
          <li>Be a Veteran, with a service related disability OR</li>
          <li>
            Be the surviving spouse or parent of a Veteran who receives VA
            compensation
          </li>
        </ul>
        <p>To receive Special Monthly Pension, the person applying must:</p>
        <ul>
          <li>Be eligible for Veteran’s pension or Survivor’s benefits </li>
        </ul>
      </va-process-list-item>
      <va-process-list-item header="Gather information">
        <p>You’ll need this information about the person applying:</p>
        <ul>
          <li>Their name</li>
          <li>Their date of birth</li>
          <li>Their social security number</li>
          <li>Their mailing address</li>
          <li>Their home phone number</li>
        </ul>
        <p>
          If the person applying is currently in the hospital, we’ll need to
          know the name of the hospital and the date they were admitted.
        </p>
      </va-process-list-item>
      <va-process-list-item header="Fill out your half of form 21-2680">
        <p>There are two options to fill out form 21-2680:</p>
        <ul>
          <li>
            Log in to your myVA account below and fill out the form digitally OR
          </li>
          <li>
            <a href="https://www.vba.va.gov/pubs/forms/vba-21-2680-are.pdf">
              Download a PDF of form 21-2680
            </a>{' '}
            and fill it out{' '}
          </li>
        </ul>
      </va-process-list-item>
      <va-process-list-item header="Have a medical provider to fill out the second half of form 21-2680">
        <p>After you have completed your half of the form, you can either:</p>
        <ul>
          <li>
            send the form to a medical provider via a secure messaging platform,
            like myHealtheVet or
          </li>
          <li>print the form and bring it to a medical provider in person.</li>
        </ul>
        <p>
          The medical provider must be a Medical Doctor (MD) or Doctor of
          Osteopathic (DO) medicine, physician assistant or advanced practice
          registered nurse.
        </p>
        <p>
          Once the medical provider has completed their part of the form and
          signed it, they’ll return it to you.
        </p>
      </va-process-list-item>
      <va-process-list-item header="Submit your completed form">
        <p>
          Upload the completed form with both your half and the medical
          provider’s half to VA.gov. You can access{' '}
          <a href="/forms/upload/21-2680/introduction">
            the upload page on VA.gov
          </a>
          .
        </p>
      </va-process-list-item>
    </va-process-list>
  );
};

/**
 * Introduction page component
 * @param {Object} props - Component properties
 * @returns {React.ReactElement} Introduction page
 */
export const IntroductionPage = ({ route }) => {
  const userLoggedIn = useSelector(state => isLoggedIn(state));
  const userIdVerified = useSelector(state => isLOA3(state));
  const { formConfig, pageList } = route;
  const showVerifyIdentity = userLoggedIn && !userIdVerified;

  useEffect(() => {
    scrollToTop();
    focusElement('h1');
  }, []);

  return (
    <article className="schemaform-intro">
      <FormTitle title={TITLE} subTitle={SUBTITLE} />

      <p className="vads-u-font-size--lg vads-u-font-family--serif vads-u-font-weight--normal vads-u-line-height--4">
        You can begin an application for Aid and Attendance or Housebound
        allowance benefits here. If you’re eligible, we’ll add these benefits as
        an additional payment to your monthly compensation or pension benefits.
      </p>

      <va-alert status="info" class="vads-u-margin-bottom--4" uswds>
        <h2 slot="headline" className="vads-u-font-size--h3">
          This form has two parts
        </h2>
        <ul>
          <li>You will fill out the first half</li>
          <li>A medical provider will fill out the second half</li>
        </ul>
        <p className="vads-u-margin-bottom--0">
          You’ll be asked at the end of the form to download what you’ve filled
          out and send it to a medical provider.
        </p>
      </va-alert>

      <h2 className="vads-u-font-size--h3 vads-u-margin-top--0">
        Follow these steps to get started
      </h2>

      <ProcessList />

      <div className="vads-u-margin-bottom--4">
        <va-additional-info trigger="What happens after you apply">
          <p>
            We’ll contact you by mail if we need more information. Once we
            process your application, we’ll mail you a letter with our decision.
          </p>
        </va-additional-info>
      </div>

      {showVerifyIdentity ? (
        <VerifyAlert headingLevel={3} dataTestId="verifyIdAlert" />
      ) : (
        <SaveInProgressIntro
          headingLevel={2}
          prefillEnabled={formConfig.prefillEnabled}
          verifiedPrefillAlert={<></>}
          messages={formConfig.savedFormMessages}
          pageList={pageList}
          startText="Start your application"
          hideUnauthedStartLink
          devOnly={{
            forceShowFormControls: true,
          }}
        />
      )}

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
      prefillEnabled: PropTypes.bool.isRequired,
      savedFormMessages: PropTypes.object.isRequired,
    }).isRequired,
    pageList: PropTypes.arrayOf(PropTypes.object).isRequired,
  }).isRequired,
};
