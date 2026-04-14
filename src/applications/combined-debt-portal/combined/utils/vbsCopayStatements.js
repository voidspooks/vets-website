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
 * Same facility, not the current copay, billing month at least one month before the current
 * copay’s — returns that copay with `compositeId` from the built identity, or null.
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

  const monthGap =
    billingMonthIndex(currentMonthlyStatement.billingMonthMeta) -
    billingMonthIndex(candidateMonthlyStatement.billingMonthMeta);
  if (monthGap < 1) return null;

  return { ...copay, compositeId: candidateMonthlyStatement.compositeId };
};

/**
 * Copays for prior monthly statements at this facility: billing months at least one month before
 * the current copay’s month (not the current row). Sorted by statement date descending;
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
 * Same rows as {@link getCopaysForPriorMonthlyStatements},
 * grouped by monthly statement (`compositeId`).
 *
 * @returns {Array<{ compositeId: string, facilityId: string, year: number, month: number, copays: object[] }>}
 */
export const groupCopaysByMonth = (copays, facilityId, currentCopayId) => {
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
      const bm = billingMonth(leadCopay);
      return {
        compositeId: leadCopay.compositeId,
        copays: sortedCopays,
        year: bm?.year,
        month: bm?.month,
        facilityId: bm?.facilityId,
      };
    }),
    ['year', 'month', 'facilityId'],
    ['desc', 'desc', 'asc'],
  );
};
