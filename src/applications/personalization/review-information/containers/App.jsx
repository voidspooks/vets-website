import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router';
import { connect, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import RoutedSavableApp from 'platform/forms/save-in-progress/RoutedSavableApp';
import { RequiredLoginView } from '@department-of-veterans-affairs/platform-user/RequiredLoginView';
import backendServices from '@department-of-veterans-affairs/platform-user/profile/backendServices';
import { useFeatureToggle } from 'platform/utilities/feature-toggles';
import formConfig from '../config/form';

export const App = ({ location, children, user, router }) => {
  const serviceRequired = [backendServices.USER_PROFILE];
  const {
    useToggleLoadingValue,
    useFormFeatureToggleSync,
  } = useFeatureToggle();
  const togglesLoading = useToggleLoadingValue();
  useFormFeatureToggleSync(['veteranOnboardingPrefillPattern']);

  const formData = useSelector(state => state?.form?.data);
  const toggleSynced = formData?.veteranOnboardingPrefillPattern !== undefined;
  const isPrefillOn = formData?.veteranOnboardingPrefillPattern === true;

  // Once the toggle is known, redirect to the correct starting page
  const [ready, setReady] = useState(false);
  useEffect(
    () => {
      if (toggleSynced && !ready) {
        const target = isPrefillOn
          ? '/prefill-contact-information'
          : '/contact-information';
        if (location.pathname !== target) router.replace(target);
        setReady(true);
      }
    },
    [toggleSynced, ready, isPrefillOn, location.pathname, router],
  );

  if (togglesLoading || !ready) {
    return (
      <va-loading-indicator message="Loading your information..." set-focus />
    );
  }

  return (
    <RequiredLoginView serviceRequired={serviceRequired} user={user} verify>
      <RoutedSavableApp
        formConfig={formConfig}
        currentLocation={location}
        skipPrefill
      >
        {children}
      </RoutedSavableApp>
    </RequiredLoginView>
  );
};
App.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  location: PropTypes.object,
  router: PropTypes.object,
  user: PropTypes.shape({
    profile: PropTypes.shape({}),
  }),
};

const mapStateToProps = state => ({
  user: state.user,
});

export default withRouter(connect(mapStateToProps)(App));
