import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom-v5-compat';
import {
  getPrescriptionsList,
  getPrescriptionById,
} from '../api/prescriptionsApi';
import { STATION_NUMBER_PARAM } from '../util/constants';
import { selectCernerPilotFlag } from '../util/selectors';

/**
 * Custom hook to fetch prescription data
 * @param {string} prescriptionId - The ID of the prescription to fetch
 * @param {object} queryParams - Query parameters for fetching the prescription list
 * @returns {object} - The prescription data, loading state, error state, resolved station number,
 *                     and flag indicating if station number lookup is complete
 */
export const usePrescriptionData = (prescriptionId, queryParams) => {
  const [searchParams] = useSearchParams();
  const stationNumber = searchParams.get(STATION_NUMBER_PARAM);
  const isCernerPilot = useSelector(selectCernerPilotFlag);

  const [
    cachedPrescriptionAvailable,
    setCachedPrescriptionAvailable,
  ] = useState(true);
  const [prescription, setPrescription] = useState(null);
  const [prescriptionApiError, setPrescriptionApiError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Get cached prescription from list if available
  const cachedPrescription = getPrescriptionsList.useQueryState(queryParams, {
    selectFromResult: ({ data: prescriptionsList }) => {
      return prescriptionsList?.prescriptions?.find(
        item => String(item.prescriptionId) === String(prescriptionId),
      );
    },
  });

  // Build query params for getPrescriptionById
  // Use stationNumber from URL if available (required for v2 API when Cerner pilot is enabled)
  // Only fall back to cached prescription's stationNumber when Cerner pilot is enabled
  const getStationNumber = () => {
    if (stationNumber) return stationNumber;
    if (isCernerPilot && cachedPrescription?.stationNumber) {
      return cachedPrescription.stationNumber;
    }
    return undefined;
  };

  const resolvedStationNumber = getStationNumber();

  // Determine if the station number lookup is complete
  // The lookup is complete when:
  // 1. We have a station number from the URL (immediate resolution), OR
  // 2. We're not using Cerner pilot (station number not required), OR
  // 3. We found a station number from the cached prescription, OR
  // 4. We've determined the cached prescription is not available (cache lookup is done), OR
  // 5. We found a cached prescription but it has no stationNumber (lookup done, no station number)
  const isStationNumberLookupComplete = useMemo(
    () => {
      // If station number is in URL, lookup is immediately complete
      if (stationNumber) return true;
      // If not using Cerner pilot, station number is not required
      if (!isCernerPilot) return true;
      // If we found station number from cached prescription, lookup is complete
      if (resolvedStationNumber) return true;
      // If we found a cached prescription but it has no stationNumber, lookup is complete
      if (
        cachedPrescription?.prescriptionId &&
        !cachedPrescription?.stationNumber
      ) {
        return true;
      }
      // If cache lookup is done (prescription not found), lookup is complete
      return !cachedPrescriptionAvailable;
    },
    [
      stationNumber,
      isCernerPilot,
      resolvedStationNumber,
      cachedPrescriptionAvailable,
      cachedPrescription,
    ],
  );

  // Skip API call if Cerner pilot is enabled but no station number is available from any source
  // This prevents failed API calls while waiting for redirect or cached data
  const shouldSkipDueToMissingStationNumber =
    isCernerPilot && !resolvedStationNumber && !cachedPrescriptionAvailable;

  const prescriptionByIdParams = {
    id: prescriptionId,
    stationNumber: resolvedStationNumber,
  };

  // Fetch individual prescription when needed
  const { data, error, isLoading: queryLoading } = getPrescriptionById.useQuery(
    prescriptionByIdParams,
    {
      skip: cachedPrescriptionAvailable || shouldSkipDueToMissingStationNumber,
    },
  );

  // Handle prescription data from either source
  useEffect(
    () => {
      if (cachedPrescriptionAvailable && cachedPrescription?.prescriptionId) {
        setPrescription(cachedPrescription);
        setIsLoading(false);
      } else if (!queryLoading) {
        if (error) {
          setCachedPrescriptionAvailable(false);
          setPrescriptionApiError(error);
          setIsLoading(false);
        } else if (data) {
          setPrescription(data);
          setIsLoading(false);
        }
      }
    },
    [
      cachedPrescription,
      data,
      error,
      queryLoading,
      cachedPrescriptionAvailable,
    ],
  );

  // Determine when to fetch individual prescription
  useEffect(
    () => {
      if (
        cachedPrescriptionAvailable &&
        !cachedPrescription?.prescriptionId &&
        !queryLoading
      ) {
        setCachedPrescriptionAvailable(false);
      }
    },
    [cachedPrescription, queryLoading, cachedPrescriptionAvailable],
  );

  return {
    prescription,
    prescriptionApiError,
    isLoading,
    resolvedStationNumber,
    isStationNumberLookupComplete,
  };
};
