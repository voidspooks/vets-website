import React from 'react';

const IntentToFileErrorAlert = () => (
  <va-alert data-testid="itf-error-alert" status="warning" visible>
    <h2 slot="headline">We can’t access your intents to file right now</h2>
    <p className="vads-u-margin-top--0 vads-u-margin-bottom--1">
      We’re sorry. There’s a problem with our system. Refresh this page or try
      again later.
    </p>
    <p className="vads-u-margin-top--0 vads-u-margin-bottom--0">
      If it still doesn’t work, call us at <va-telephone contact="8008271000" />{' '}
      (<va-telephone contact="711" tty="true" />
      ). We’re here Monday through Friday, 8:00 a.m. to 9:00 p.m. ET.
    </p>
  </va-alert>
);

export default IntentToFileErrorAlert;
