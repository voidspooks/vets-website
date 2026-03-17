import React, { createContext, useContext, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { uniqBy } from 'lodash';
import PropTypes from 'prop-types';
import { DEBTS_SET_ACTIVE_DEBT } from '../actions/debts';
import { getCopayDetailStatement } from '../actions/copays';
import {
  debtLettersShowLettersVBMS,
  showVHAPaymentHistory,
  sortStatementsByDate,
} from '../utils/helpers';
import {
  calculateTotalDebts,
  getLatestBill,
  getLatestDebt,
} from '../utils/balance-helpers';

const DebtCopayContext = createContext();

export const DebtCopayProvider = ({ children }) => {
  const dispatch = useDispatch();
  const reduxState = useSelector(state => state);
  const { combinedPortal } = reduxState;

  // Feature flags
  const shouldShowVHAPaymentHistory = showVHAPaymentHistory(reduxState);
  const showDebtLetterDownload = debtLettersShowLettersVBMS(reduxState);

  const contextValue = useMemo(
    () => {
      const { debtLetters, mcp } = combinedPortal || {};

      // Debt state
      const {
        debts = [],
        debtLinks = [],
        isError: debtError,
        isPending: isDebtPending,
        isPendingVBMS,
        isProfileUpdating,
        selectedDebt,
      } = debtLetters || {};

      // Copay state
      const {
        statements: copays,
        error: copayError,
        pending: copayLoading,
        selectedStatement: selectedCopay,
        isCopayDetailLoading,
      } = mcp || {};

      // Actions - Maybe add individual refreshes for debts and copays
      const fetchCopayDetails = id => {
        dispatch(getCopayDetailStatement(id));
      };

      const setActiveDebt = debt => {
        dispatch({ type: DEBTS_SET_ACTIVE_DEBT, debt });
      };

      // Derived values
      const debtLoading = isDebtPending || isPendingVBMS || isProfileUpdating;
      const copaysEmpty = shouldShowVHAPaymentHistory
        ? copays?.data?.length === 0
        : copays?.length === 0;
      const debtsEmpty =
        !debtError && debts.length === 0 && debtLinks.length === 0;
      const isNotEnrolledInHealthCare = copayError?.status === '403';

      // Determine VBS(cerner) or Lighthouse(vista) copay structures
      const v1Copays = copays?.data || [];
      const v1Meta = copays?.meta || {};
      const v0Copays = Array.isArray(copays) ? copays : [];
      const currentCopays = shouldShowVHAPaymentHistory ? v1Copays : v0Copays;

      // Data transformations
      const totalDebtCount = debts?.length;
      const totalCopayCount = shouldShowVHAPaymentHistory
        ? v1Meta.copaySummary?.copayBillCount || 0
        : v0Copays.length;

      const sortedCopays = shouldShowVHAPaymentHistory
        ? v1Copays
        : sortStatementsByDate(v0Copays);

      const copaysByUniqueFacility = shouldShowVHAPaymentHistory
        ? uniqBy(v1Copays, 'attributes.facilityId')
        : uniqBy(sortedCopays, 'pSFacilityNum');

      const getTotalCopayBalance = () => {
        if (shouldShowVHAPaymentHistory) {
          return v1Meta?.copaySummary?.totalCurrentBalance || 0;
        }

        return currentCopays.reduce((sum, stmt) => {
          return sum + (stmt.pHNewBalance || 0);
        }, 0);
      };

      const getV1LatestDate = () => {
        return v1Meta?.copaySummary?.lastUpdatedOn
          ? new Date(v1Meta.copaySummary.lastUpdatedOn)
          : null;
      };

      const latestCopayDate = shouldShowVHAPaymentHistory
        ? getV1LatestDate()
        : getLatestBill(v0Copays || []);

      // Debt UI checks
      const hasDebtData = !debtsEmpty;
      const isDebtLoading = debtLoading;
      const hasDebtError = debtError;

      // Copay UI checks
      const hasCopayData = !copaysEmpty;
      const isCopayLoading = copayLoading;
      const hasCopayError = copayError && !isNotEnrolledInHealthCare;

      // Combined UI Debt + Copay Checks
      const hasBothData = hasDebtData && hasCopayData;
      const isBothLoading = isDebtLoading && isCopayLoading;
      const hasBothError = hasDebtError && hasCopayError;
      const hasBothZero = debtsEmpty && copaysEmpty && !copayError; // debtsEmpty already checks debtError

      return {
        shouldShowVHAPaymentHistory,
        showDebtLetterDownload,

        debts,
        debtLinks,
        currentCopays,
        selectedDebt,
        selectedCopay,

        debtError,
        copayError,
        copaysEmpty,
        debtsEmpty,
        debtLoading,
        copayLoading,
        isPendingVBMS,
        isProfileUpdating,
        isCopayDetailLoading,
        isNotEnrolledInHealthCare,

        sortedCopays,
        copaysByUniqueFacility,
        fetchCopayDetails,
        setActiveDebt,
        totalCopayBalance: getTotalCopayBalance(),
        totalDebtBalance: calculateTotalDebts(debts),
        latestDebtDate: getLatestDebt(debts),
        latestCopayDate,
        totalDebtCount,
        totalCopayCount,

        hasDebtData,
        isDebtLoading,
        hasDebtError,
        hasCopayData,
        isCopayLoading,
        hasCopayError,
        hasBothData,
        isBothLoading,
        hasBothError,
        hasBothZero,
      };
    },
    [
      combinedPortal,
      shouldShowVHAPaymentHistory,
      showDebtLetterDownload,
      dispatch,
    ],
  );

  return (
    <DebtCopayContext.Provider value={contextValue}>
      {children}
    </DebtCopayContext.Provider>
  );
};

DebtCopayProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Custom hook to consume the context
export const useDebtCopayProvider = () => {
  const context = useContext(DebtCopayContext);

  if (!context) {
    throw new Error(
      'useDebtCopayProvider must be used within a DebtCopayContext',
    );
  }

  return context;
};
