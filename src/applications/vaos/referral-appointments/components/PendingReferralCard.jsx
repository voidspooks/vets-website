import React from 'react';
import { format, parseISO } from 'date-fns';
import PropTypes from 'prop-types';
import { titleCase } from '../../utils/formatters';
import ListItem from '../../components/ListItem';
import AppointmentRow from '../../components/AppointmentRow';
import AppointmentColumn from '../../components/AppointmentColumn';

const PendingReferralCard = ({ referral, index }) => {
  const first = index === 0;
  // onlineSchedule is not yet implemented on the backend for pilot. Default to true if it is null/undefined.
  const onlineSchedule = referral.onlineSchedule ?? true;
  const providerSelectLink = onlineSchedule
    ? `schedule-referral/provider-selection?id=${
        referral.uuid
      }&referrer=referrals-requests`
    : null;
  const detailLink = `schedule-referral?id=${
    referral.uuid
  }&referrer=referrals-requests`;

  const parsedDate = parseISO(referral.expirationDate);
  const expiration = format(parsedDate, 'MMMM d, yyyy');
  const categoryOfCare = titleCase(referral.categoryOfCare);

  return (
    <ListItem borderTop={first} borderBottom status="pending">
      <AppointmentRow className="vads-u-padding-y--1 mobile:vads-u-flex-direction--row">
        <AppointmentColumn
          className="vads-u-padding-top--1 vads-u-padding-bottom--0p5"
          size="1"
        >
          <va-link
            href={detailLink}
            text={`${categoryOfCare} referral`}
            data-dd-privacy="mask"
            class="vads-u-font-weight--bold"
          />
          <p
            id={`ref-desc-${index}`}
            className="vads-u-padding-left--0 vads-u-margin-bottom--0 vads-u-margin-top--1"
          >
            <strong>Expiration date:</strong> {expiration}
          </p>
          {referral.hasAppointments && (
            <p
              className="vads-u-margin-top--0 vads-u-margin-bottom--0p5"
              data-testid="has-appointments-message"
            >
              You’ve already scheduled 1 or more appointments for this referral.
            </p>
          )}
          {!referral.hasAppointments &&
            onlineSchedule && (
              <div className="vaos-hide-for-print vads-u-padding-left--0 vads-u-margin-top--0p5">
                <va-link-action
                  type="secondary"
                  href={providerSelectLink}
                  aria-labelledby={`ref-title-${index} ref-desc-${index}`}
                  text="Schedule an appointment"
                  data-testid="schedule-appointment-link"
                />
              </div>
            )}
          {!referral.hasAppointments &&
            !onlineSchedule && (
              <p
                className="vads-u-margin-top--0 vads-u-margin-bottom--0p5"
                data-testid="cannot-schedule-online-message"
              >
                Online scheduling isn’t available for this referral.
              </p>
            )}
        </AppointmentColumn>
      </AppointmentRow>
    </ListItem>
  );
};

PendingReferralCard.propTypes = {
  index: PropTypes.number.isRequired,
  referral: PropTypes.object.isRequired,
};

export default PendingReferralCard;
