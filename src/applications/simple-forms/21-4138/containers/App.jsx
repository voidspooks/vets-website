import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { toggleValues } from 'platform/site-wide/feature-toggles/selectors';
import FEATURE_FLAG_NAMES from 'platform/utilities/feature-toggles/featureFlagNames';
import RoutedSavableApp from 'platform/forms/save-in-progress/RoutedSavableApp';
import environment from 'platform/utilities/environment';
import { useBrowserMonitoring } from 'platform/monitoring/Datadog';
import formConfig from '../config/form';
import { WIP } from '../../shared/components/WIP';
import { workInProgressContent } from '../config/constants';
import { RUM_ACTIONS, SUBMISSION_ERROR_STATUSES } from '../config/monitoring';

const EXCLUDED_DOMAINS = [
  'resource.digital.voice.va.gov',
  'browser-intake-ddog-gov.com',
  'google-analytics.com',
  'eauth.va.gov',
  'api.va.gov',
];

export const BROWSER_MONITORING_PROPS = {
  toggleName: 'form214138BrowserMonitoringEnabled',
  applicationId: '7fccf5de-fc36-44c4-9dd0-1687f521536e',
  clientToken: 'pub371bb36afe0e4c66507112e4a03011f5',
  site: 'ddog-gov.com',
  service: '21-4138',
  env: environment.vspEnvironment(),
  sessionSampleRate: 100,
  sessionReplaySampleRate:
    environment.vspEnvironment() === 'staging' ? 100 : 20,
  version: '1.0.0',
  trackUserInteractions: true,
  trackFrustrations: true,
  trackResources: true,
  trackLongTasks: true,
  defaultPrivacyLevel: 'mask-user-input',
  beforeSend: ({ action, type, resource }) => {
    // eslint-disable-next-line no-param-reassign
    if (action?.type === 'click') action.target.name = 'Form item';
    return !(
      type === 'resource' &&
      EXCLUDED_DOMAINS.some(domain => resource.url.includes(domain))
    );
  },
};

function App({ location, children, showForm, isLoading, submissionStatus }) {
  useBrowserMonitoring(BROWSER_MONITORING_PROPS);

  const prevStatusRef = useRef(null);
  useEffect(
    () => {
      const prev = prevStatusRef.current;
      prevStatusRef.current = submissionStatus;

      if (submissionStatus === prev) return;

      if (SUBMISSION_ERROR_STATUSES.has(submissionStatus)) {
        window.DD_RUM?.addAction(RUM_ACTIONS.SUBMISSION_FAILURE, {
          reason: submissionStatus,
        });
      } else if (submissionStatus === 'applicationSubmitted') {
        window.DD_RUM?.addAction(RUM_ACTIONS.SUBMISSION_SUCCESS);
      }
    },
    [submissionStatus],
  );

  if (isLoading) {
    return (
      <va-loading-indicator
        message="Please wait while we load the application for you."
        class="vads-u-margin-y--4"
        set-focus
      />
    );
  }
  if (!showForm) {
    return <WIP content={workInProgressContent} />;
  }

  return (
    <RoutedSavableApp formConfig={formConfig} currentLocation={location}>
      {children}
    </RoutedSavableApp>
  );
}

App.propTypes = {
  children: PropTypes.element.isRequired,
  location: PropTypes.object.isRequired,
  isLoading: PropTypes.bool,
  showForm: PropTypes.bool,
  submissionStatus: PropTypes.string,
};

const mapStateToProps = state => ({
  isLoading: state?.featureToggles?.loading,
  showForm:
    toggleValues(state)[FEATURE_FLAG_NAMES.form214138] ||
    environment.isLocalhost(),
  submissionStatus: state?.form?.submission?.status,
});

export default connect(mapStateToProps)(App);
