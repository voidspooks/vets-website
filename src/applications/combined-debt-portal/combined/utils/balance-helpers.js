import head from 'lodash/head';
import { isAfter } from 'date-fns';

export const calculateTotalDebts = debts => {
  return debts
    ? debts.reduce((acc, curr) => {
        return acc + curr.currentAr;
      }, 0)
    : 0;
};

export const getLatestDebt = debts => {
  return debts
    ? debts.reduce((acc, curr) => {
        const mostRecentHistory = head(curr.debtHistory);
        if (mostRecentHistory) {
          if (!acc) {
            return mostRecentHistory.date;
          }
          return isAfter(new Date(acc), new Date(mostRecentHistory.date))
            ? acc
            : mostRecentHistory.date;
        }
        return acc;
      }, null)
    : null;
};

export const calculateTotalBills = (bills, version) => {
  return bills
    ? bills.reduce((acc, currDebt) => {
        const amount =
          version === 'v1'
            ? currDebt.attributes?.currentBalance || 0
            : currDebt.pHAmtDue || 0;
        return acc + amount;
      }, 0)
    : 0;
};

export const getLatestBill = (bills, meta = null, version) => {
  // Check for v1 API date first
  if (version === 'v1') {
    const v1Date = meta?.copaySummary?.lastUpdatedOn;
    return v1Date ? new Date(v1Date) : null;
  }

  // v0 API logic - bills is an array of statements
  if (version === 'v0') {
    return bills
      ? bills.reduce((acc, currBill) => {
          if (currBill.pSStatementDateOutput) {
            if (!acc) {
              return currBill.pSStatementDateOutput;
            }
            return isAfter(
              new Date(acc),
              new Date(currBill.pSStatementDateOutput),
            )
              ? acc
              : currBill.pSStatementDateOutput;
          }
          return acc;
        }, null)
      : null;
  }

  return null;
};
