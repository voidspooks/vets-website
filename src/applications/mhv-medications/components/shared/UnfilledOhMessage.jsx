import React from 'react';
import PropTypes from 'prop-types';
import { pharmacyPhoneNumber } from '@department-of-veterans-affairs/mhv/exports';
import CallPharmacyPhone from './CallPharmacyPhone';
import { pageType } from '../../util/dataDogConstants';

/**
 * Displays a message for unfilled Oracle Health prescriptions
 * @param {Object} props
 * @param {Object} props.prescription - The prescription object
 * @param {boolean} props.showLinks - Whether to show links (facility finder, etc.)
 * @param {boolean} props.showPhoneInline - Whether to show phone number inline (false for status dropdown)
 * @param {string} props.page - The page context (LIST or DETAILS)
 * @param {string} props.testId - Optional test ID override
 */
const UnfilledOhMessage = ({
  prescription,
  showLinks = true,
  showPhoneInline = true,
  page,
  testId,
}) => {
  const pharmacyPhone = pharmacyPhoneNumber(prescription);
  const shouldShowPhoneInline = showPhoneInline && page === pageType.LIST;

  return (
    <div className="no-print" data-testid={testId || 'active-unfilled-oh'}>
      <p className="vads-u-margin-bottom--2">
        You can’t refill this prescription online right now.{' '}
      </p>
      <p className="vads-u-margin-bottom--2">
        {pharmacyPhone ? (
          <>
            {shouldShowPhoneInline ? (
              <>
                If you need a refill, call your VA pharmacy{' '}
                <CallPharmacyPhone
                  cmopDivisionPhone={pharmacyPhone}
                  page={pageType.LIST}
                />
              </>
            ) : (
              <>
                If you need a refill, call your VA pharmacy at the phone number
                listed below.
              </>
            )}
          </>
        ) : (
          <>
            To refill now, call your VA pharmacy’s automated refill line. The
            number is on your prescription label, or contact your VA pharmacy.
          </>
        )}
      </p>
      {showLinks &&
        !pharmacyPhone && (
          <p className="vads-u-margin-y--0">
            <a href="https://www.va.gov/find-locations">
              Find your VA facility
            </a>
          </p>
        )}
    </div>
  );
};

UnfilledOhMessage.propTypes = {
  prescription: PropTypes.object.isRequired,
  page: PropTypes.string,
  showLinks: PropTypes.bool,
  showPhoneInline: PropTypes.bool,
  testId: PropTypes.string,
};

export default UnfilledOhMessage;
