import React from 'react';
import PropTypes from 'prop-types';
import {
  VaCard,
  VaLink,
  VaTagStatus,
} from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import { differenceInCalendarDays, parseISO } from 'date-fns';

import { buildDateFormatter } from '../utils/helpers';

const formatDate = buildDateFormatter();
const formatShortDate = buildDateFormatter('MM/dd/yyyy');

const EXPIRING_THRESHOLD_DAYS = 60;

const TYPE_LABELS = {
  compensation: 'Disability compensation',
  pension: 'Veteran’s Pension',
  survivor: 'Dependency and Indemnity Compensation (DIC)',
};

const getTypeLabel = type => TYPE_LABELS[type] || type;

const isExpiringSoon = expirationDate => {
  const daysUntilExpiration = differenceInCalendarDays(
    parseISO(expirationDate),
    new Date(),
  );
  return (
    daysUntilExpiration >= 0 && daysUntilExpiration <= EXPIRING_THRESHOLD_DAYS
  );
};

const getBodyText = (type, expirationDate, expiring) => {
  const formattedDate = formatDate(expirationDate);
  const typeLabel = getTypeLabel(type).toLowerCase();

  if (expiring) {
    return `This intent to file will expire on ${formattedDate}. If you haven’t submitted a ${typeLabel} claim yet, you can do that now.`;
  }

  return `We’ll apply this intent to file to a ${typeLabel} claim you submit before ${formattedDate}.`;
};

const IntentToFileCard = ({ itf }) => {
  const { type, creationDate, expirationDate } = itf;
  const expiring = isExpiringSoon(expirationDate);
  const typeLabel = getTypeLabel(type);
  const recordedDate = formatDate(creationDate);
  const bodyText = getBodyText(type, expirationDate, expiring);

  return (
    <VaCard className="vads-u-margin-y--3" data-testid={`itf-card-${type}`}>
      {expiring && (
        <div className="vads-u-margin-bottom--2">
          <VaTagStatus
            text={`Expires on ${formatShortDate(expirationDate)}`}
            status="warning"
          />
        </div>
      )}
      <h3 className="vads-u-margin-y--0">{typeLabel}</h3>
      <p className="vads-u-margin-top--0 vads-u-margin-bottom--1">
        Intent to file recorded on {recordedDate}
      </p>
      <p className="vads-u-margin-top--0 vads-u-margin-bottom--1">{bodyText}</p>
      <VaLink
        active
        href="/track-claims/your-claims"
        text="Check if you have an in-progress claim"
      />
    </VaCard>
  );
};

IntentToFileCard.propTypes = {
  itf: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    creationDate: PropTypes.string.isRequired,
    expirationDate: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
  }).isRequired,
};

export default IntentToFileCard;
