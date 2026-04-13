import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import { isLOA3, isLoggedIn } from 'platform/user/selectors';
import { IntroductionPageView } from '../../shared/components/IntroductionPageView';
import { FORM_10_8678 } from '../definitions/constants';

const ombInfo = {
  resBurden: '10',
  ombNumber: '2900-0198',
  expDate: '03/31/2026',
};

const { INTRODUCTION: I } = FORM_10_8678;

const boldTrailingConjunction = text => {
  const parts = text.match(/^(.*?)(,?\s(?:or|and))$/);

  if (!parts) return text;

  return (
    <>
      {parts[1]}
      <strong>{parts[2]}</strong>
    </>
  );
};

export const IntroductionPage = ({ route, userIdVerified, userLoggedIn }) => {
  const content = {
    formTitle: I.FORM_TITLE,
    formSubTitle: I.FORM_SUBTITLE,
    authStartFormText: I.AUTH_START_FORM_TEXT,
    saveInProgressText: I.SAVE_IN_PROGRESS_TEXT,
    displayNonVeteranMessaging: true,
    hideSipIntro: userLoggedIn && !userIdVerified,
  };

  const childContent = (
    <>
      <div className="vads-u-margin-top--3 vads-u-margin-bottom--3">
        <p className="va-introtext">{I.INTRO}</p>
        <p className="va-introtext">{I.INTRO_FOLLOWUP}</p>
      </div>

      <va-process-list>
        <va-process-list-item header={I.STEP_ELIGIBILITY_TITLE} level={2}>
          <p>{I.STEP_ELIGIBILITY_INTRO}</p>
          <p>{I.STEP_ELIGIBILITY_CONDITION_INTRO}</p>
          <ul>
            {I.STEP_ELIGIBILITY_BULLETS.map(item => (
              <li key={item}>{boldTrailingConjunction(item)}</li>
            ))}
          </ul>

          <h3 className="vads-u-font-size--h4 vads-u-margin-bottom--1">
            {I.STEP_ELIGIBILITY_ADDITIONAL_INFO_TITLE}
          </h3>
          <p>{I.STEP_ELIGIBILITY_ADDITIONAL_INFO_INTRO}</p>
          <ul>
            {I.STEP_ELIGIBILITY_ADDITIONAL_INFO_BULLETS.map(item => (
              <li key={item}>{boldTrailingConjunction(item)}</li>
            ))}
          </ul>
        </va-process-list-item>

        <va-process-list-item header={I.STEP_GATHER_TITLE} level={2}>
          <p>{I.STEP_GATHER_INTRO}</p>
          <ul>
            {I.STEP_GATHER_BULLETS.map(item => (
              <li key={item.label}>
                <strong>{item.label}:</strong> {item.body}
              </li>
            ))}
          </ul>
        </va-process-list-item>

        <va-process-list-item header={I.STEP_START_TITLE} level={2}>
          <p>{I.STEP_START_BODY}</p>
          <p>{I.STEP_START_FOLLOWUP}</p>
        </va-process-list-item>
      </va-process-list>
    </>
  );

  return (
    <IntroductionPageView
      route={route}
      content={content}
      ombInfo={ombInfo}
      childContent={childContent}
      devOnly={{
        forceShowFormControls: true,
      }}
    />
  );
};

IntroductionPage.propTypes = {
  route: PropTypes.shape({
    formConfig: PropTypes.shape({
      prefillEnabled: PropTypes.bool,
      savedFormMessages: PropTypes.shape({}),
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
