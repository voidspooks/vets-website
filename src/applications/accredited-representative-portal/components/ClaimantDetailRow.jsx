// components/ClaimantDetailRow.jsx
import React from 'react';
import PropTypes from 'prop-types';

const ClaimantDetailRow = ({ label, value }) => (
  <li className="claimant-detail-row">
    <p className="claimant-detail-row__label">{label}</p>
    <div className="claimant-detail-row__value">{value ?? '—'}</div>
  </li>
);

ClaimantDetailRow.propTypes = {
  label: PropTypes.node.isRequired,
  value: PropTypes.node,
};

export default ClaimantDetailRow;
