import React from 'react';
import PropTypes from 'prop-types';
import { pharmacyPhoneNumber } from '@department-of-veterans-affairs/mhv/exports';
import { UNFILLED_OH_MESSAGE_CONTENT } from '../../util/constants';
import CallPharmacyPhone from './CallPharmacyPhone';
import { pageType } from '../../util/dataDogConstants';

/**
 * Displays a message for unfilled Oracle Health prescriptions
 * @param {Object} props
 * @param {Object} props.prescription - The prescription object
 * @param {boolean} props.showLinks - Whether to show links (facility finder, etc.)
 * @param {boolean} props.showPhoneInline - Whether to show phone number inline (false for status dropdown)
 * @param {string} props.page - The page context (LIST or DETAILS)
 * @param {boolean} props.isMedicationsImprovementsEnabled - Whether to show updated S3 messaging
 * @param {string} props.testId - Optional test ID override
 */
const UnfilledOhMessage = ({
  prescription,
  showPhoneInline = true,
  page,
  isMedicationsImprovementsEnabled = false,
  testId,
}) => {
  const pharmacyPhone = pharmacyPhoneNumber(prescription);
  const shouldShowPhoneInline = showPhoneInline && page === pageType.LIST;

  const messageContent = isMedicationsImprovementsEnabled
    ? UNFILLED_OH_MESSAGE_CONTENT.MANAGEMENT_IMPROVEMENTS_ENABLED
    : UNFILLED_OH_MESSAGE_CONTENT.MANAGEMENT_IMPROVEMENTS_DISABLED;

  return (
    <div className="no-print" data-testid={testId || 'active-unfilled-oh'}>
      <p className="vads-u-margin-bottom--2">{messageContent.intro}</p>
      <p className="vads-u-margin-bottom--2">
        {pharmacyPhone ? (
          <>
            {shouldShowPhoneInline ? (
              <>
                {messageContent.withPhoneInlinePrefix}{' '}
                <CallPharmacyPhone
                  cmopDivisionPhone={pharmacyPhone}
                  page={page}
                />
              </>
            ) : (
              <>{messageContent.withPhoneBelow}</>
            )}
          </>
        ) : (
          <>{messageContent.withoutPhone}</>
        )}
      </p>
    </div>
  );
};

UnfilledOhMessage.propTypes = {
  prescription: PropTypes.object.isRequired,
  page: PropTypes.string,
  showPhoneInline: PropTypes.bool,
  isMedicationsImprovementsEnabled: PropTypes.bool,
  testId: PropTypes.string,
};

export default UnfilledOhMessage;
