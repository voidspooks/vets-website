import React from 'react';
import PropTypes from 'prop-types';
import FacilityCodeAdditionalInfo from './FacilityCodeAdditionalInfo';

import { getCountryLabel } from '../helpers';

export const EmptyCard = () => {
  return (
    <div>
      <h3 aria-label="Institution not found">--</h3>
      <p>--</p>
    </div>
  );
};

export const DetailsCard = ({ details, isWithoutCode = false }) => {
  const {
    mailingAddress: {
      street,
      street2,
      street3,
      city,
      state,
      postalCode,
      country,
    },
    facilityCode,
  } = details;

  return (
    <div>
      <h3 aria-label={details.name}>{details.name}</h3>
      <p className="vads-u-margin-bottom--0">{street}</p>
      {street2 && <p className="vads-u-margin-y--0">{street2}</p>}
      {street3 && <p className="vads-u-margin-y--0">{street3}</p>}
      <p className="vads-u-margin-y--0">
        {city}, {state} {postalCode}
      </p>
      <p className="vads-u-margin-top--0">
        {getCountryLabel(country, isWithoutCode)}
      </p>
      {facilityCode && <FacilityCodeAdditionalInfo />}
    </div>
  );
};

DetailsCard.propTypes = {
  details: PropTypes.shape({
    name: PropTypes.string.isRequired,
    mailingAddress: PropTypes.shape({
      street: PropTypes.string.isRequired,
      street2: PropTypes.string,
      street3: PropTypes.string,
      city: PropTypes.string.isRequired,
      state: PropTypes.string,
      postalCode: PropTypes.string,
      country: PropTypes.string,
    }),
    facilityCode: PropTypes.string,
  }).isRequired,
  isWithoutCode: PropTypes.bool.isRequired,
};
