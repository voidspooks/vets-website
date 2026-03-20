// components/ClaimantDetailRow.jsx
import React from 'react';
import PropTypes from 'prop-types';

const ClaimantDetailRow = ({ label, value }) => (
  <li>
    <p>{label}</p>
    <p>{value ?? '—'}</p>
  </li>
);

ClaimantDetailRow.propTypes = {
  label: PropTypes.node.isRequired,
  value: PropTypes.node,
};

export default ClaimantDetailRow;
