import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { APP_TYPES, currency, formatDate } from '../utils/helpers';

const getStateContent = (isZeroBalance, amount, count, date, appType, t) => {
  const type = appType.toLowerCase();
  const prefix = `alertsCards.statusUpdates.${type}`;

  if (isZeroBalance) {
    return {
      header: t(`${prefix}.zeroHeader`),
      body: t(`${prefix}.zeroBody`),
      linkText: null,
      linkDestination: null,
    };
  }
  return {
    header: t(`${prefix}.activeHeader`, {
      total: currency(amount),
      count,
      plural: count > 1 ? 's' : '',
    }),
    body: date
      ? t(`${prefix}.activeBody`, {
          date: formatDate(date),
        })
      : null,
    linkText: t(`${prefix}.linkText`),
    linkDestination: t(`${prefix}.linkDestination`),
  };
};

const StatusCard = ({ amount, count, date, appType }) => {
  const { t } = useTranslation();
  const isZeroBalance = count === 0;
  const { header, body, linkText, linkDestination } = getStateContent(
    isZeroBalance,
    amount,
    count,
    date,
    appType,
    t,
  );
  return (
    <va-card
      show-shadow
      class="vads-u-padding--3 vads-u-margin-bottom--3"
      data-testid={`status-card-${
        appType === APP_TYPES.DEBT ? 'debt' : 'copay'
      }${isZeroBalance ? '-zero' : ''}`}
    >
      <h2
        className="vads-u-margin-top--0 vads-u-margin-bottom--1p5 vads-u-font-size--h3"
        data-testid="card-header"
      >
        {header}
      </h2>
      <p
        className={`vads-u-margin-top--0 ${
          linkText ? 'vads-u-margin-bottom--1p5' : 'vads-u-margin-bottom--0'
        }`}
        data-testid="card-body"
      >
        {body}
      </p>
      {linkText && (
        <Link
          className="vads-u-font-weight--bold"
          to={linkDestination}
          data-testid="card-link"
        >
          {linkText}
          <va-icon
            icon="navigate_next"
            size={2}
            class="cdp-link-icon--active"
          />
        </Link>
      )}
    </va-card>
  );
};

StatusCard.propTypes = {
  appType: PropTypes.string.isRequired,
  amount: PropTypes.number,
  count: PropTypes.number,
  date: PropTypes.string,
};

export default StatusCard;
