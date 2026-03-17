import React from 'react';
import PropTypes from 'prop-types';
import BaseAlert from './BaseAlert';

const ErrorAlert = ({ appType, debtError, copayError }) => {
  const type = appType.toLowerCase();

  const getTypesLabel = () => {
    if (debtError && copayError) return 'overpayment and copay';
    if (debtError) return 'overpayment';
    return 'copay';
  };

  return (
    <>
      <BaseAlert
        status="error"
        data-testid={`balance-card-alert-${type}`}
        headerKey="alertsCards.error.heading"
        headerValues={{ type: getTypesLabel() }}
        bodyKey="alertsCards.error.body"
      />
    </>
  );
};

ErrorAlert.propTypes = {
  appType: PropTypes.string,
  copayError: PropTypes.bool,
  debtError: PropTypes.bool,
};

export default ErrorAlert;
