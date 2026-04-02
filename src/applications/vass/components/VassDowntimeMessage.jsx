import React from 'react';
import PropTypes from 'prop-types';
import externalServiceStatus from 'platform/monitoring/DowntimeNotification/config/externalServiceStatus';
import { VASS_PHONE_NUMBER } from '../utils/constants';

export default function VassDowntimeMessage({ status, children }) {
  if (status === externalServiceStatus.down) {
    return (
      <va-alert
        visible
        status="warning"
        class="vads-u-margin-bottom--4"
        data-testid="vass-downtime-message"
      >
        <h2 slot="headline">We're working on this scheduling tool right now</h2>
        <p>
          You can't access the VA Solid Start scheduling tool right now. Check
          back soon.
        </p>
        <p>
          If you need to schedule a call now, call us at{' '}
          <va-telephone contact={VASS_PHONE_NUMBER} />. We're here Monday
          through Friday, 8:00 a.m. to 9:00 p.m. ET.
        </p>
      </va-alert>
    );
  }

  return children;
}

VassDowntimeMessage.propTypes = {
  children: PropTypes.node,
  status: PropTypes.string,
};
