import React from 'react';
import { isAfter } from 'date-fns';
import { useSelector } from 'react-redux';
import { uniqBy } from 'lodash';
import BalanceCard from './BalanceCard';
import ZeroBalanceCard from './ZeroBalanceCard';
import AlertCard from './AlertCard';
import {
  calculateTotalDebts,
  getLatestBill,
  getLatestDebt,
  calculateTotalBills,
} from '../utils/balance-helpers';
import { APP_TYPES, selectUseLighthouseCopays } from '../utils/helpers';
import CopayAlertContainer from '../../medical-copays/components/CopayAlertContainer';

// Some terminology that could be helpful:
// debt(s) = debtLetters
// bill(s) = copays = mcp (medical-copays)

const getVersionedCopayData = (statements, shouldUseLighthouseCopays) => {
  const rawCopays = statements?.data;
  const version = shouldUseLighthouseCopays ? 'v1' : 'v0';
  const uniqueFacilities =
    version === 'v1'
      ? uniqBy(rawCopays || [], 'attributes.facilityId')
      : uniqBy(rawCopays || [], 'pSFacilityNum');

  return {
    copayBillCount: uniqueFacilities?.length,
    copayTotal: calculateTotalBills(uniqueFacilities, version),
    latestBillDate: getLatestBill(rawCopays, statements?.meta, version),
  };
};

const Balances = () => {
  // get balances from redux
  const { debtLetters, mcp } = useSelector(
    ({ combinedPortal }) => combinedPortal,
  );

  const shouldUseLighthouseCopays = useSelector(selectUseLighthouseCopays);

  const billError = mcp.error;
  const debtError = debtLetters.errors?.length > 0;
  const isEnrolledInHealthCare = billError?.code !== '403';

  // get Debt info
  const { debts } = debtLetters;
  const totalDebts = calculateTotalDebts(debts);
  const latestDebt = getLatestDebt(debts);

  // get Copay info
  const { copayBillCount, copayTotal, latestBillDate } = getVersionedCopayData(
    mcp.statements,
    shouldUseLighthouseCopays,
  );

  // Sort two valid BalancCards by date
  if (!debtError && !billError && totalDebts > 0 && copayBillCount > 0) {
    const debtFirst = isAfter(new Date(latestDebt), new Date(latestBillDate));
    return (
      <>
        <BalanceCard
          amount={debtFirst ? totalDebts : copayTotal}
          count={debtFirst ? debts.length : copayBillCount}
          date={debtFirst ? latestDebt : latestBillDate}
          appType={debtFirst ? APP_TYPES.DEBT : APP_TYPES.BILL}
        />
        <BalanceCard
          amount={debtFirst ? copayTotal : totalDebts}
          count={debtFirst ? copayBillCount : debts.length}
          date={debtFirst ? latestBillDate : latestDebt}
          appType={debtFirst ? APP_TYPES.BILL : APP_TYPES.DEBT}
        />
      </>
    );
  }

  // Sorting and returning cards
  // Order matters here:
  // BalanceCard > ZeroBalanceCard > AlertCard
  return (
    <>
      {/* BalanceCards */}
      {!debtError &&
        totalDebts > 0 && (
          <BalanceCard
            amount={totalDebts}
            count={debts.length}
            date={latestDebt}
            appType={APP_TYPES.DEBT}
          />
        )}
      {isEnrolledInHealthCare &&
        !billError &&
        copayBillCount > 0 && (
          <BalanceCard
            amount={copayTotal}
            count={copayBillCount}
            date={latestBillDate}
            appType={APP_TYPES.COPAY}
          />
        )}
      {/* ZeroBalanceCards */}
      {!debtError &&
        totalDebts === 0 && <ZeroBalanceCard appType={APP_TYPES.DEBT} />}
      {!billError &&
        copayBillCount === 0 && <ZeroBalanceCard appType={APP_TYPES.COPAY} />}
      {/* AlertCards */}
      {debtError && <AlertCard appType={APP_TYPES.DEBT} />}
      {isEnrolledInHealthCare &&
        billError && <AlertCard appType={APP_TYPES.COPAY} />}
      {!isEnrolledInHealthCare && (
        <>
          <CopayAlertContainer type="no-health-care" />
        </>
      )}
    </>
  );
};

export default Balances;
