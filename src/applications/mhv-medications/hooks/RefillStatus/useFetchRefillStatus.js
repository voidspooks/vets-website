import { useMemo } from 'react';
import { useGetPrescriptionsListQuery } from '../../api/prescriptionsApi';
import { dispStatusObj, rxListSortingOptions } from '../../util/constants';

/**
 * Custom hook to fetch in-progress prescription refill status data.
 * Filters prescriptions to only include those that are:
 * - Submitted (dispStatus === 'Active: Submitted')
 * - In progress (dispStatus === 'Active: Refill in Process')
 * - Shipped (dispStatus === 'Active' with tracking completeDateTime within 15 days)
 *
 * @returns {Object} The prescription data, loading state, and error state
 */
export const useFetchRefillStatus = () => {
  const { data, error, isLoading, isFetching } = useGetPrescriptionsListQuery(
    { sortEndpoint: rxListSortingOptions.alphabeticalOrder.API_ENDPOINT },
    { refetchOnMountOrArgChange: true },
  );

  const getInProgressPrescriptions = prescriptions => {
    const fifteenDaysAgo = new Date().setDate(new Date().getDate() - 15);

    // TODO tooEarly logic not implemented yet, always returns []
    return prescriptions.reduce(
      (inProgressMedications, prescription) => {
        if (prescription.dispStatus === dispStatusObj.submitted) {
          inProgressMedications.submitted.push(prescription);
        } else if (prescription.dispStatus === dispStatusObj.refillinprocess) {
          inProgressMedications.inProgress.push(prescription);
        } else if (prescription.dispStatus === dispStatusObj.active) {
          const latestTracking = prescription.trackingList?.[0];
          if (
            latestTracking?.completeDateTime &&
            Date.parse(latestTracking.completeDateTime) >= fifteenDaysAgo
          ) {
            inProgressMedications.shipped.push(prescription);
          }
        }

        return inProgressMedications;
      },
      { inProgress: [], shipped: [], submitted: [], tooEarly: [] },
    );
  };

  const { inProgress, shipped, submitted, tooEarly } = useMemo(
    () => getInProgressPrescriptions(data?.prescriptions || []),
    [data?.prescriptions],
  );

  return {
    inProgress,
    shipped,
    submitted,
    tooEarly,
    prescriptionsApiError: error,
    isLoading: isLoading || isFetching,
  };
};

export default useFetchRefillStatus;
