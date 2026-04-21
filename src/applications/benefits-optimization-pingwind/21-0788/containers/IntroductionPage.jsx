import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { isLOA3, isLoggedIn } from 'platform/user/selectors';
import { IntroductionPageView } from '../../shared/components/IntroductionPageView';
import { introductionPageText } from '../definitions/constants';

const ombInfo = {
  resBurden: '15',
  ombNumber: '2900-0666',
  expDate: '02/28/2029',
};

export const IntroductionPage = ({ route, userIdVerified, userLoggedIn }) => {
  const content = {
    formTitle: introductionPageText.formTitle,
    formSubTitle: introductionPageText.formSubTitle,
    authStartFormText: introductionPageText.authStartFormText,
    saveInProgressText: introductionPageText.saveInProgressText,
    displayNonVeteranMessaging: true,
    hideSipIntro: userLoggedIn && !userIdVerified,
  };

  const childContent = (
    <>
      <p className="vads-u-margin-top--3 vads-u-margin-bottom--3">
        {introductionPageText.intro}
      </p>
      <va-process-list>
        <va-process-list-item
          header={introductionPageText.readBeforeHeader}
          level={2}
        >
          <ul>
            {introductionPageText.readBeforeItems.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </va-process-list-item>
        <va-process-list-item
          header={introductionPageText.whatYouNeedHeader}
          level={2}
        >
          <ul>
            {introductionPageText.whatYouNeedItems.map(item => (
              <li key={item.label}>
                <strong>{item.label}:</strong> {item.text}
              </li>
            ))}
          </ul>
        </va-process-list-item>
        <va-process-list-item
          header={introductionPageText.startHeader}
          level={2}
        >
          <p>{introductionPageText.startBody}</p>
          <p>{introductionPageText.startFollowup}</p>
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
      devOnly={{ forceShowFormControls: true }}
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
