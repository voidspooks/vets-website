import React from 'react';
import PropTypes from 'prop-types';
import { FLOW_TYPES, VASS_PHONE_NUMBER } from '../utils/constants';

const ErrorAlert = ({ flowType = FLOW_TYPES.SCHEDULE }) => {
  const header =
    flowType === FLOW_TYPES.CANCEL
      ? 'We can’t cancel your call right now'
      : 'We can’t schedule your call right now';
  return (
    <va-alert
      status="error"
      visible
      class="vads-u-margin-top--4"
      data-testid="api-error-alert"
    >
      <h2>{header}</h2>
      <p>
        We’re sorry. There’s a problem with our system. Refresh this page to
        start over or try again later.{' '}
      </p>
      <p>
        If you need to schedule now, call us at{' '}
        <va-telephone contact={VASS_PHONE_NUMBER} />. We’re here Monday through
        Friday, 8:00 a.m. to 9:00 p.m. ET.
      </p>
    </va-alert>
  );
};

export default ErrorAlert;

ErrorAlert.propTypes = {
  flowType: PropTypes.oneOf(Object.values(FLOW_TYPES)),
};
