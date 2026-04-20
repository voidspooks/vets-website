import React from 'react';
import PropTypes from 'prop-types';
import AlertMessage from './AlertMessage';
import { determineFormData } from '../../helpers';

import { SHORT_NAME_MAP, RESPONSES } from '../../constants/question-data-map';

const StepOne = ({ formResponses }) => {
  const reason = formResponses[SHORT_NAME_MAP.REASON];

  const { num: formNumber, link: formLink } = determineFormData(formResponses);
  let formTitle = `Form ${formNumber}`;
  const formFileName = formLink.split('/').pop();
  if ([293, 149].includes(formNumber)) {
    formTitle = `DD Form ${formNumber}`;
  }

  const header = `Download and fill out DD Form ${formNumber}`;

  const renderItemDetailsIntro = () => {
    const line14Text =
      'In item 14, make sure to give a thorough answer to why you’re applying for a discharge upgrade or correction.';
    if (reason === RESPONSES.REASON_PTSD || reason === RESPONSES.REASON_TBI) {
      return (
        <>
          <p>
            {line14Text} It’s important to explain how your service was
            impacted. Many Veterans attach extra pages to answer this question.
            Consider answering these questions in your response:
          </p>
          <ul>
            <li>
              Did you have a condition that may explain or contribute to the
              discharge?
            </li>
            <li>
              Did that condition start or get worse during your military
              service?
            </li>
            <li>
              How did the condition directly explain or contribute to the
              discharge?
            </li>
            <li>
              How did the condition carry more weight than any other reasons you
              may have been discharged for?
            </li>
          </ul>
        </>
      );
    }
    if (reason === RESPONSES.REASON_SEXUAL_ASSAULT) {
      return (
        <>
          <p>
            {line14Text} It’s important to explain how your service was
            impacted. Many Veterans attach extra pages to answer this question.
            Consider answering these questions in your response:
          </p>
          <ul>
            <li>Did that experience happen during your military service?</li>
            <li>
              How did the experience directly explain or contribute to the
              discharge?
            </li>
            <li>
              How did the experience carry more weight than any other reasons
              you may have been discharged for?
            </li>
          </ul>
        </>
      );
    }
    if (
      reason === RESPONSES.REASON_SEXUAL_ORIENTATION ||
      reason === RESPONSES.REASON_UNJUST ||
      reason === RESPONSES.REASON_ERROR
    ) {
      return (
        <>
          <p>
            {line14Text} It’s important to explain how your service was
            impacted. Many Veterans attach extra pages to answer this question.
          </p>
        </>
      );
    }
    if (reason === RESPONSES.REASON_DD215_UPDATE_TO_DD214) {
      return (
        <>
          <p>
            {line14Text} You should explain why you need a new DD214, including
            any problems you face when you have to show both the DD214 and the
            DD215. Many Veterans attach extra pages to answer this question.
          </p>
        </>
      );
    }
    if (reason === RESPONSES.REASON_TRANSGENDER) {
      return (
        <>
          <p>{line14Text}</p>
        </>
      );
    }
    return null;
  };

  const renderStepOneText = () => {
    const DRBReviewBullets = (
      <>
        <p>
          You can request either a Documentary Review or Personal Appearance
          Review from the Discharge Review Board (DRB). Here are some tips on
          choosing a review option:
        </p>
        <ul>
          <li>
            Documentary Reviews are typically faster. We recommend starting with
            this review first.
          </li>
          <li>
            If your case is complicated or has a lot of details, you may want to
            choose a Personal Appearance Review. You’ll have to pay your travel
            costs for a Personal Appearance Review.
          </li>
          <li>
            If your Documentary Review is denied, you can appeal through a
            Personal Appeal Review. You can’t request a Documentary Review after
            a Personal Appearance Review.
          </li>
        </ul>
      </>
    );
    if (
      reason === RESPONSES.REASON_PTSD &&
      (formResponses[SHORT_NAME_MAP.PREV_APPLICATION_TYPE] ===
        RESPONSES.PREV_APPLICATION_BCNR ||
        formResponses[SHORT_NAME_MAP.PREV_APPLICATION_TYPE] ===
          RESPONSES.PREV_APPLICATION_BCMR) &&
      (formResponses[SHORT_NAME_MAP.FAILURE_TO_EXHAUST] ===
        RESPONSES.FAILURE_TO_EXHAUST_BCNR_YES ||
        formResponses[SHORT_NAME_MAP.FAILURE_TO_EXHAUST] ===
          RESPONSES.FAILURE_TO_EXHAUST_BCMR_YES)
    ) {
      return (
        <>
          <p>
            Because you’re applying for reconsideration of a previous
            application, you’ll need to enter your previous application number
            in Item 11b.
          </p>
          <p>
            <strong>Note:</strong> You’re eligible for reconsideration if you
            have new evidence to present that wasn’t available the last time you
            applied. Make sure to explain exactly what that new evidence is.
            Additionally, changes in DOD policy, like new consideration
            guidelines for PTSD, TBI, and sexual assault or harassment, can
            qualify you for reconsideration.
          </p>
          {DRBReviewBullets}
        </>
      );
    }
    if (
      reason === RESPONSES.REASON_PTSD &&
      formResponses[SHORT_NAME_MAP.PREV_APPLICATION] === RESPONSES.YES &&
      formResponses[SHORT_NAME_MAP.PREV_APPLICATION_TYPE] ===
        RESPONSES.PREV_APPLICATION_DRB_DOCUMENTARY &&
      formResponses[SHORT_NAME_MAP.PRIOR_SERVICE] === RESPONSES.PRIOR_SERVICE_NO
    ) {
      return (
        <>
          <p>
            Because you’re applying for reconsideration of a previous
            application, you’ll need to enter your previous application number
            in Item 11b.
          </p>
          <p>
            Because your application was denied during a Documentary Review, you
            must apply for a Personal Appearance Review in Washington, DC.
            You’ll have to pay your travel costs for a Personal Appearance
            Review.
          </p>
        </>
      );
    }
    if (
      reason === RESPONSES.REASON_PTSD ||
      reason === RESPONSES.REASON_SEXUAL_ORIENTATION ||
      reason === RESPONSES.REASON_TBI ||
      reason === RESPONSES.REASON_UNJUST ||
      reason === RESPONSES.REASON_ERROR
    ) {
      return DRBReviewBullets;
    }
    if (reason === RESPONSES.REASON_SEXUAL_ASSAULT) {
      return (
        <>
          <p>
            <strong>Note:</strong> Even if you didn’t file charges or report the
            incident, you can still apply for an upgrade.
          </p>
          {DRBReviewBullets}
        </>
      );
    }
    if (reason === RESPONSES.REASON_TRANSGENDER) {
      return (
        <>
          <p>Many Veterans attach extra pages to answer this question.</p>
          <p>
            In item 16, make sure to add the date you found the mistake. If it’s
            been more than 3 years, you’ll need to include a reason why the
            Board should consider your application. You can still apply for a
            correction even if it’s been more than 3 years since you found the
            mistake. You may want to share new evidence for recent changes in
            policy that support your claim.
          </p>
          <p>
            <strong>Note:</strong> In item 17, we’ll ask if you’re willing to
            appear in person before the Board in Washington, DC. This isn’t
            common. But it may help your case if you’re willing to appear in
            person.
          </p>
        </>
      );
    }
    return null;
  };

  return (
    <va-process-list-item header={header} level="2">
      {renderItemDetailsIntro()}
      {renderStepOneText()}
      {/* Intentionally not using <va-link> per Platform Analytics team */}
      <va-link
        download
        href={formLink}
        className="vads-u-margin-bottom--1"
        filetype="PDF"
        filename={formFileName}
        text={`Download ${formTitle} (opens in a new tab)`}
        onClick={e => {
          e.preventDefault();
          window.open(formLink, '_blank');
        }}
      />
      <AlertMessage
        content={
          <>
            <h3 className="usa-alert-heading">
              If you need help filling out your form
            </h3>
            <p>
              You can appoint an accredited attorney, claims agent, or Veterans
              Service Organization (VSO) representative.{' '}
              <va-link
                external
                href="/get-help-from-accredited-representative/find-rep"
                text="Get help from an accredited representative"
              />
              .
            </p>
          </>
        }
        isVisible
        status="warning"
      />
    </va-process-list-item>
  );
};

StepOne.propTypes = {
  formResponses: PropTypes.object.isRequired,
};

export default StepOne;
