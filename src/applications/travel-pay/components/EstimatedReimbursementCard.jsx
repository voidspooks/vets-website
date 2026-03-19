import React from 'react';
import PropTypes from 'prop-types';

import { EXPENSE_TYPES } from '../constants';
import { formatAmount } from '../util/complex-claims-helper';

const EstimatedReimbursementCard = ({ expenses, totalCostRequested }) => {
  const totalByExpenseType = Object.fromEntries(
    Object.entries(
      (expenses ?? []).reduce((acc, expense) => {
        const { expenseType } = expense;
        acc[expenseType] =
          (acc[expenseType] || 0) + (expense.costRequested || 0);
        return acc;
      }, {}),
    ).sort(([a], [b]) => {
      const order = Object.keys(EXPENSE_TYPES);
      return order.indexOf(a) - order.indexOf(b);
    }),
  );

  return (
    <va-card data-testid="estimated-reimbursement-card" background>
      <h2 className="vads-u-margin-top--1">Estimated reimbursement</h2>
      <ul>
        {Object.entries(totalByExpenseType)
          .filter(([, total]) => total > 0)
          .map(([type, total]) => (
            <li key={type}>
              <strong>{EXPENSE_TYPES[type]?.title ?? type}</strong> $
              {formatAmount(total)}
            </li>
          ))}
      </ul>
      <p>
        <strong>Total:</strong> ${formatAmount(totalCostRequested ?? 0)}
      </p>
      <p>
        Before we can pay you back for expenses, you must pay a deductible. The
        current deductible is <strong>$3</strong> one-way or <strong>$6</strong>{' '}
        round-trip for each appointment. You’ll pay no more than{' '}
        <strong>$18</strong> total each month.
      </p>
      <va-link
        href="/resources/reimbursed-va-travel-expenses-and-mileage-rate/#monthlydeductible"
        text="Learn more about deductibles for VA travel claims"
        external
      />
    </va-card>
  );
};

EstimatedReimbursementCard.propTypes = {
  expenses: PropTypes.arrayOf(
    PropTypes.shape({
      expenseType: PropTypes.string,
      costRequested: PropTypes.number,
    }),
  ),
  totalCostRequested: PropTypes.number,
};

export default EstimatedReimbursementCard;
