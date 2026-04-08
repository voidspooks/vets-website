/**
 * VBS (non-Lighthouse): copay rows vs monthly statements (`pSStatementDateOutput`,
 * `pSFacilityNum`).
 */
import { groupBy, orderBy } from 'lodash';
import { isValid } from 'date-fns';

const statementDate = dateString => {
  if (dateString == null || dateString === '') return null;
  const parsedDate = new Date(
    typeof dateString === 'string' ? dateString.replace(/-/g, '/') : dateString,
  );
  return isValid(parsedDate) ? parsedDate : null;
};

/** `{ facilityId, year, month }` for the monthly statement this copay belongs to, or null. */
const billingMonth = copay => {
  if (copay?.pSFacilityNum == null || copay.pSFacilityNum === '') return null;
  const parsedDate = statementDate(copay.pSStatementDateOutput);
  if (!parsedDate) return null;
  return {
    facilityId: String(copay.pSFacilityNum),
    year: parsedDate.getFullYear(),
    month: parsedDate.getMonth() + 1,
  };
};

/** Monotonic index for calendar (year, month) so month distance is a simple subtraction. */
const billingMonthIndex = ({ year, month }) => year * 12 + month - 1;

/** Matches “past 6 months” of monthly statements: the six billing months before the open copay’s month. */
const PRIOR_MONTHLY_STATEMENT_MONTH_COUNT = 6;

const isWithinSixMonths = (candidateBillingMonthMeta, openBillingMonthMeta) => {
  const monthGap =
    billingMonthIndex(openBillingMonthMeta) -
    billingMonthIndex(candidateBillingMonthMeta);
  return monthGap >= 1 && monthGap <= PRIOR_MONTHLY_STATEMENT_MONTH_COUNT;
};

const sortCopaysByMonthlyStatementDateDesc = copays =>
  orderBy(
    copays,
    copay => statementDate(copay.pSStatementDateOutput)?.getTime() ?? -Infinity,
    'desc',
  );

/** Matches Lighthouse-style `composite_id`: "#{facility_num}-#{month}-#{year}" */
export const vbsCompositeId = (facilityNum, month, year) =>
  `${facilityNum}-${month}-${year}`;

/**
 * API copay rows do not include `composite_id`. Derive the monthly statement identity
 * (billing month + composite id) from `pSFacilityNum` and `pSStatementDateOutput`.
 */
const monthlyStatementIdentityFromCopay = copay => {
  const billingMonthMeta = billingMonth(copay);
  if (!billingMonthMeta) return null;
  return {
    billingMonthMeta,
    compositeId: vbsCompositeId(
      billingMonthMeta.facilityId,
      billingMonthMeta.month,
      billingMonthMeta.year,
    ),
  };
};

/**
 * Same facility, not the open copay, monthly statement in the six billing months before
 * the open copay’s — returns that copay with `compositeId` from the built identity, or null.
 */
const priorCopayWithCompositeId = (
  copay,
  facilityId,
  currentCopayId,
  currentMonthlyStatement,
) => {
  const isSameFacility = String(copay.pSFacilityNum) === String(facilityId);
  if (!isSameFacility || copay.id === currentCopayId) return null;

  const candidateMonthlyStatement = monthlyStatementIdentityFromCopay(copay);
  if (!candidateMonthlyStatement) return null;

  const withinSixMonths = isWithinSixMonths(
    candidateMonthlyStatement.billingMonthMeta,
    currentMonthlyStatement.billingMonthMeta,
  );

  if (!withinSixMonths) return null;

  return { ...copay, compositeId: candidateMonthlyStatement.compositeId };
};

/**
 * Copays for prior monthly statements at this facility: the **last six** billing months
 * before the open copay’s month (not the open row). Sorted by statement date descending;
 * each row includes a built `compositeId` (Lighthouse-style composite key).
 */
export const getCopaysForPriorMonthlyStatements = (
  copays,
  facilityId,
  currentCopayId,
) => {
  if (!copays?.length) return [];
  const currentCopay = copays.find(
    candidateCopay => candidateCopay.id === currentCopayId,
  );
  const currentMonthlyStatement = monthlyStatementIdentityFromCopay(
    currentCopay,
  );
  if (!currentMonthlyStatement) return [];

  const priorCopays = copays
    .map(copay =>
      priorCopayWithCompositeId(
        copay,
        facilityId,
        currentCopayId,
        currentMonthlyStatement,
      ),
    )
    .filter(enrichedCopay => enrichedCopay !== null);

  return sortCopaysByMonthlyStatementDateDesc(priorCopays);
};

/**
 * Same rows as {@link getCopaysForPriorMonthlyStatements} (six billing months back),
 * grouped by monthly statement (`compositeId`).
 *
 * @returns {Array<{ compositeId: string, facilityId: string, year: number, month: number, copays: object[] }>}
 */
export const groupCopaysByPriorMonthlyStatement = (
  copays,
  facilityId,
  currentCopayId,
) => {
  const flatCopays = getCopaysForPriorMonthlyStatements(
    copays,
    facilityId,
    currentCopayId,
  );
  const compositeBuckets = groupBy(flatCopays, 'compositeId');

  return orderBy(
    Object.values(compositeBuckets).map(bucketCopays => {
      const sortedCopays = sortCopaysByMonthlyStatementDateDesc(bucketCopays);
      const leadCopay = sortedCopays[0];
      const leadBillingMonth = billingMonth(leadCopay);
      return {
        compositeId: leadCopay.compositeId,
        facilityId: leadBillingMonth?.facilityId,
        year: leadBillingMonth?.year,
        month: leadBillingMonth?.month,
        copays: sortedCopays,
      };
    }),
    ['year', 'month', 'facilityId'],
    ['desc', 'desc', 'asc'],
  );
};
