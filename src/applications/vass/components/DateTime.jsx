import React from 'react';
import PropTypes from 'prop-types';
import { formatInTimeZone } from 'date-fns-tz';

import { getBrowserTimezone, getTimezoneAbbreviation } from '../utils/timezone';

const formatInBrowserTimezone = dateString => {
  const timezone = getBrowserTimezone();

  // Format date as "Weekday, Month DD, YYYY"
  const formattedDate = formatInTimeZone(
    dateString,
    timezone,
    'EEEE, MMMM dd, yyyy', // e.g., "Monday, November 17, 2025"
  );

  // Format time as "3:15 p.m." (no leading zero, lowercase with periods)
  const time = formatInTimeZone(dateString, timezone, 'h:mm aaaa');
  const abbreviation = getTimezoneAbbreviation(timezone, new Date(dateString));

  const formattedTime = `${time} ${abbreviation}`;

  return { formattedDate, formattedTime };
};

const DateTime = ({ dateTime }) => {
  const { formattedDate, formattedTime } = formatInBrowserTimezone(dateTime);
  return (
    <p
      className="vads-u-margin-top--0p5 vads-u-margin-bottom--1"
      data-dd-privacy="mask"
      data-testid="date-time-description"
    >
      {formattedDate}
      <br />
      {formattedTime}
    </p>
  );
};

DateTime.propTypes = {
  dateTime: PropTypes.string.isRequired,
};

export default DateTime;
