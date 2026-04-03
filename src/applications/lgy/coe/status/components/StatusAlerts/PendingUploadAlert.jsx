import React from 'react';
import PropTypes from 'prop-types';
import { formatDateLong } from 'platform/utilities/date';

export const PendingUploadAlert = ({ referenceNumber, requestDate }) => (
  <va-alert status="warning" class="vads-u-margin-bottom--4">
    <h2 slot="headline">We need more information from you</h2>
    <div>
      <p className="vads-u-margin-y--0">
        You requested a COE on: {requestDate && formatDateLong(requestDate)}
      </p>
      <p>
        You’ll need to upload the documents so we can make a decision on your
        COE request.
      </p>
      <p className="vads-u-margin-bottom--0">
        Reference Number: {referenceNumber}
      </p>
    </div>
  </va-alert>
);

PendingUploadAlert.propTypes = {
  referenceNumber: PropTypes.string.isRequired,
  requestDate: PropTypes.string.isRequired,
};
