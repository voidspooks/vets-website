import React from 'react';
import PropTypes from 'prop-types';
import { VaAlert } from '@department-of-veterans-affairs/component-library/dist/react-bindings';

const PartialRecordsWarning = ({ warnings }) => {
  if (!warnings?.length) return null;

  return (
    <VaAlert
      status="warning"
      visible
      class="vads-u-margin-y--3 no-print"
      data-testid="alert-partial-records-warning"
    >
      <h2 slot="headline">Some of your records may be incomplete</h2>
      <p>
        We’re sorry. We couldn’t load all of your information right now. Some of
        your records may be incomplete or missing. Please try again later.
      </p>
    </VaAlert>
  );
};

PartialRecordsWarning.propTypes = {
  warnings: PropTypes.array,
};

export default PartialRecordsWarning;
