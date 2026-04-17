import React from 'react';
import PropTypes from 'prop-types';

const ExpenseCard = ({ date, endDate, amount, frequency }) => {
  let dateLabel = null;

  if (date && endDate) {
    dateLabel = `${date} - ${endDate}`;
  } else {
    dateLabel = date;
  }

  return (
    <>
      <p className="vads-u-margin-y--0">{dateLabel}</p>
      <p className="vads-u-margin-y--0">{frequency}</p>
      <p className="vads-u-margin-y--0">{amount}</p>
    </>
  );
};

ExpenseCard.propTypes = {
  amount: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  frequency: PropTypes.string.isRequired,
  endDate: PropTypes.string,
};

export default ExpenseCard;
