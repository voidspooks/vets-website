import React from 'react';
import PropTypes from 'prop-types';
import { dataDogActionNames } from '../../util/dataDogConstants';

const CallPharmacyPhone = ({ cmopDivisionPhone, page, showPeriod = true }) => {
  const number = cmopDivisionPhone
    ? cmopDivisionPhone.replace(/[^0-9]/g, '')
    : null;
  return (
    <>
      {number ? (
        <>
          <span> at </span>
          <va-telephone
            contact={number}
            data-testid="pharmacy-phone-number"
            data-dd-privacy="mask"
            data-dd-action-name={`${
              dataDogActionNames.shared.PHARMACY_PHONE_NUMBER_LINK
            }${page}`}
          />{' '}
          (<va-telephone tty contact="711" />){showPeriod && '.'}
        </>
      ) : (
        <>{showPeriod && '.'}</>
      )}
    </>
  );
};

CallPharmacyPhone.propTypes = {
  cmopDivisionPhone: PropTypes.string,
  page: PropTypes.string,
  showPeriod: PropTypes.bool,
};

export default CallPharmacyPhone;
