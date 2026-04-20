import React from 'react';
import PropTypes from 'prop-types';

const StatusAlertBanner = ({ testId, icon, children }) => (
  <div className="rx-status-alert-banner" data-testid={testId} role="status">
    <va-icon icon={icon} size={3} aria-hidden="true" />
    <span className="vads-u-margin-y--0 vads-u-margin-left--1">{children}</span>
  </div>
);

StatusAlertBanner.propTypes = {
  children: PropTypes.node,
  icon: PropTypes.string,
  testId: PropTypes.string,
};

export default StatusAlertBanner;
