import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { isLOA3, isLoggedIn } from 'platform/user/selectors';
import { IntroductionPageView } from '../../shared/components/IntroductionPageView';

const ombInfo = {
  resBurden: '10',
  ombNumber: '2900-0198',
  expDate: '03/31/2026',
};

export const IntroductionPage = ({ route, userIdVerified, userLoggedIn }) => {
  const content = {
    formTitle: 'Application for Annual Clothing Allowance',
    formSubTitle: 'VA Form 10-8678',
    authStartFormText: 'Start the application',
    saveInProgressText:
      'Please complete the 10-8678 form to apply for your annual clothing allowance.',
    displayNonVeteranMessaging: false,
    hideSipIntro: userLoggedIn && !userIdVerified,
  };

  const childContent = (
    <>
      <p>
        Use this form to apply for an annual clothing allowance if your
        service-connected disability requires a prosthetic, orthopedic
        appliance, or skin medication that damages your clothing.
      </p>

      <h2>What to know before you fill out this form</h2>
      <ul>
        <li>
          You must submit this application on or before{' '}
          <strong>August 1</strong> of the benefit year you’re applying for.
        </li>
        <li>You’ll need your Social Security number.</li>
        <li>
          You’ll need details about each appliance or skin medication and the VA
          facility that issued it.
        </li>
        <li>
          In some cases, you may be eligible for more than one clothing
          allowance.
        </li>
      </ul>
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
