import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';

import { isLOA3, isLoggedIn } from 'platform/user/selectors';
import { IntroductionPageView } from '../../shared/components/IntroductionPageView';
import { FORM_21_4502 } from '../definitions/constants';

const ombInfo = {
  resBurden: '15',
  ombNumber: '2900-0093',
  expDate: '08/31/2027',
};

const { INTRODUCTION: I } = FORM_21_4502;

export const IntroductionPage = ({ route, userIdVerified, userLoggedIn }) => {
  const content = {
    formTitle: I.FORM_TITLE,
    formSubTitle: '',
    authStartFormText: I.AUTH_START_FORM_TEXT,
    saveInProgressText: I.SAVE_IN_PROGRESS_TEXT,
    displayNonVeteranMessaging: true,
    hideSipIntro: userLoggedIn && !userIdVerified,
  };
  const childContent = (
    <>
      <p className="vads-u-margin-top--3 vads-u-margin-bottom--3">{I.INTRO}</p>

      <va-process-list>
        <va-process-list-item header={I.STEP_ELIGIBILITY_TITLE}>
          <p>{I.STEP_ELIGIBILITY_BODY}</p>
          <ul>
            {I.STEP_ELIGIBILITY_BULLETS.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </va-process-list-item>
        <va-process-list-item header={I.STEP_GATHER_TITLE}>
          <p>
            <strong>{I.STEP_GATHER_BASIC_LABEL}</strong>{' '}
            {I.STEP_GATHER_BASIC_BODY}
          </p>
          <p>
            <strong>{I.STEP_GATHER_APPLICATION_LABEL}</strong>{' '}
            {I.STEP_GATHER_APPLICATION_BODY}
          </p>
        </va-process-list-item>
        <va-process-list-item header={I.STEP_START_TITLE}>
          <p>{I.STEP_START_BODY}</p>
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
