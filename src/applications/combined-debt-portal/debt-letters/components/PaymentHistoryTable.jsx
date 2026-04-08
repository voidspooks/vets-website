import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { deductionCodes } from '../const/deduction-codes';
import { currency } from '../utils/page';
import { formatDate } from '../../combined/utils/helpers';
import Pagination from '../../combined/components/Pagination';
import usePagination from '../../combined/hooks/usePagination';

const getFirstNotificationDateFromCurrentDebt = history => {
  if (!history || history[0]?.date === '') return 'N/A';
  return history[0]?.date;
};

const getPaymentHistoryDescription = transactionDescription => {
  if (
    transactionDescription.startsWith('Increase to AR') ||
    transactionDescription.startsWith('Increase to New AR')
  ) {
    return 'Balance increase';
  }
  if (transactionDescription.startsWith('AR Decrease')) {
    return 'Balance decrease';
  }
  if (transactionDescription.includes('Write Off')) {
    return 'Write Off';
  }
  if (
    transactionDescription.includes('Reversal') ||
    transactionDescription.includes('TOP Reversal')
  ) {
    return 'Reversal';
  }
  return 'Other';
};

const transformData = (transactions = [], history = [], currentDebt) => {
  // Apply transformations
  const formattedTransactions = transactions.map(payment => ({
    formattedDate: formatDate(payment.transactionDate),
    formattedDescription: getPaymentHistoryDescription(
      payment.transactionDescription,
    ),
    formattedTransactionAmount: currency.format(
      parseFloat(payment.transactionTotalAmount),
    ),
  }));

  // Create the last debt row
  const lastDebtRow = {
    formattedDate: formatDate(getFirstNotificationDateFromCurrentDebt(history)),
    formattedDescription:
      deductionCodes[currentDebt.deductionCode] || currentDebt.benefitType,
    formattedTransactionAmount: currency.format(
      parseFloat(currentDebt.originalAr || 0),
    ),
  };

  return [...formattedTransactions, lastDebtRow];
};

const PaymentHistoryTable = ({ sortedFiscal, sortedHistory, currentDebt }) => {
  const columns = ['Date', 'Description', 'Amount'];
  const tableRef = useRef(null);
  const ITEM_TYPE = 'transactions';

  const allTableData = transformData(sortedFiscal, sortedHistory, currentDebt);

  // Hooks must be called before any early returns
  const pagination = usePagination(allTableData);
  const paginationText = pagination.getPaginationText(ITEM_TYPE);

  // Return early if no data to display
  if (!allTableData || allTableData.length === 0) {
    return null;
  }

  return (
    <div key={`table-wrapper-${pagination.currentPage}`}>
      <va-table
        ref={tableRef}
        id="debt-statement-table-charges"
        tabindex={pagination.hasPagination ? '-1' : undefined}
        table-title="Transaction History"
        table-title-summary={paginationText}
        uswds
        full-width
        table-type="bordered"
        class="vads-u-display--block"
      >
        <va-table-row slot="headers">
          {columns.map((col, index) => (
            <span key={`table-header-${index}`}>{col}</span>
          ))}
        </va-table-row>
        {pagination.currentItems.map(
          (
            { formattedDate, formattedDescription, formattedTransactionAmount },
            index,
          ) => (
            <va-table-row key={`${index}`}>
              <span className="vads-u-width--fit">{formattedDate}</span>
              <span>
                <p className="vads-u-margin-top--0 vads-u-margin--0 vads-u-font-size-md">
                  <strong>{formattedDescription}</strong>
                </p>
              </span>
              <span className="vads-u-width--fit vads-u-text-align--right">
                {formattedTransactionAmount}
              </span>
            </va-table-row>
          ),
        )}
      </va-table>
      <Pagination
        currentPage={pagination.currentPage}
        totalItems={pagination.totalItems}
        itemsPerPage={pagination.itemsPerPage}
        onPageChange={page => pagination.onPageChangeWFocus(page, tableRef)}
        ariaLabel="Most recent statement charges pagination navigation"
      />
    </div>
  );
};

PaymentHistoryTable.propTypes = {
  sortedFiscal: PropTypes.arrayOf(
    PropTypes.shape({
      transactionDate: PropTypes.string.isRequired,
      transactionDescription: PropTypes.string.isRequired,
      transactionTotalAmount: PropTypes.number.isRequired,
    }),
  ),
  sortedHistory: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string,
    }),
  ),
  currentDebt: PropTypes.shape({
    originalAr: PropTypes.number.isRequired,
    deductionCode: PropTypes.string,
    benefitType: PropTypes.string,
  }).isRequired,
};

export default PaymentHistoryTable;
