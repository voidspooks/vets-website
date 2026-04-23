import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { datadogRum } from '@datadog/browser-rum';
import { selectUser } from '@department-of-veterans-affairs/platform-user/selectors';
import { dataDogLogger } from 'platform/monitoring/Datadog/utilities';
import { TRACKED_SPINNER_DURATION } from '../../util/constants';

const DEFAULT_TIMEOUT = TRACKED_SPINNER_DURATION;

const TrackedSpinner = ({
  id,
  timeout = DEFAULT_TIMEOUT,
  onTimeout,
  ...rest
}) => {
  const user = useSelector(selectUser);
  const startRef = useRef(Date.now());

  useEffect(
    () => {
      if (!timeout || timeout <= 0) return undefined;
      const timer = setTimeout(() => {
        const elapsedTime = Date.now() - startRef.current;
        const duration = Math.max(0, elapsedTime / 1000);
        const payload = {
          id,
          duration,
          userId: user?.profile?.accountUuid,
        };
        datadogRum.addAction('sm_spinner_duration', payload);
        // Actions only have a 50% chance of logging (sessionSampleRate is 50), so also log a custom event to ensure we capture all timeouts
        dataDogLogger({
          message: 'SM Loading Spinner Timeout',
          attributes: payload,
        });
        onTimeout?.(payload);
      }, timeout);

      return () => clearTimeout(timer);
    },
    [timeout, id, user, onTimeout],
  );

  return <va-loading-indicator {...rest} />;
};

TrackedSpinner.propTypes = {
  id: PropTypes.string.isRequired,
  onTimeout: PropTypes.func,
  timeout: PropTypes.number,
};

export default TrackedSpinner;
