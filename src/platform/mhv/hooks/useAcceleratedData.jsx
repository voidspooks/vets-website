import FEATURE_FLAG_NAMES from '@department-of-veterans-affairs/platform-utilities/featureFlagNames';
import { selectIsCernerPatient } from '~/platform/user/cerner-dsot/selectors';
import { useSelector, useDispatch } from 'react-redux';
import { useMemo, useEffect } from 'react';

import { connectDrupalSourceOfTruthCerner } from '~/platform/utilities/cerner/dsot';

const useAcceleratedData = () => {
  const dispatch = useDispatch();

  const isAcceleratedDeliveryEnabled = useSelector(
    state =>
      state.featureToggles[FEATURE_FLAG_NAMES.mhvAcceleratedDeliveryEnabled],
  );
  const isAcceleratingAllergiesEnabled = useSelector(
    state =>
      state.featureToggles[
        FEATURE_FLAG_NAMES.mhvAcceleratedDeliveryAllergiesEnabled
      ],
  );
  const isAcceleratingCareNotesEnabled = useSelector(
    state =>
      state.featureToggles[
        FEATURE_FLAG_NAMES.mhvAcceleratedDeliveryCareNotesEnabled
      ],
  );
  const isAcceleratingConditionsEnabled = useSelector(
    state =>
      state.featureToggles[
        FEATURE_FLAG_NAMES.mhvAcceleratedDeliveryConditionsEnabled
      ],
  );
  const isAcceleratingVitalsEnabled = useSelector(
    state =>
      state.featureToggles[
        FEATURE_FLAG_NAMES.mhvAcceleratedDeliveryVitalSignsEnabled
      ],
  );
  const isAcceleratingVaccinesEnabled = useSelector(
    state =>
      state.featureToggles[
        FEATURE_FLAG_NAMES.mhvAcceleratedDeliveryVaccinesEnabled
      ],
  );

  const isAcceleratingLabsAndTestsEnabled = useSelector(
    state =>
      state.featureToggles[
        FEATURE_FLAG_NAMES.mhvAcceleratedDeliveryLabsAndTestsEnabled
      ],
  );

  const isAcceleratingMedicationsEnabled = useSelector(
    state => state.featureToggles[FEATURE_FLAG_NAMES.mhvMedicationsCernerPilot],
  );

  const isAcceleratingSecureMessagingEnabled = useSelector(
    state =>
      state.featureToggles[FEATURE_FLAG_NAMES.mhvSecureMessagingCernerPilot],
  );

  const isAcceleratingImagingStudiesEnabled = useSelector(
    state =>
      state.featureToggles[
        FEATURE_FLAG_NAMES.mhvMedicalRecordsFetchScdfImagingStudies
      ],
  );

  const isCcdOHEnabled = useSelector(
    state => state.featureToggles[FEATURE_FLAG_NAMES.mhvMedicalRecordsCcdOH],
  );

  useEffect(
    () => {
      // TECH DEBT: Do not trigger the connection when running unit tests because
      // the connection is not mocked and will cause the test to fail
      if (!window.Mocha) {
        // use Drupal based Cerner facility data
        connectDrupalSourceOfTruthCerner(dispatch);
      }
    },
    [dispatch],
  );

  // This is based on the facilities list in the user's profile
  const isCerner = useSelector(selectIsCernerPatient);

  // This is based on the 200CRNR flag from MPI (set in vets-api)
  const isCernerUser = useSelector(
    state => state.user?.profile?.isCernerPatient,
  );

  const { featureToggles, drupalStaticData } = useSelector(state => state);
  const isLoading = useMemo(
    () => {
      return featureToggles.loading || drupalStaticData?.vamcEhrData?.loading;
    },
    [drupalStaticData, featureToggles],
  );

  const isAcceleratingAllergies = useMemo(
    () => {
      return isAcceleratedDeliveryEnabled && isAcceleratingAllergiesEnabled;
    },
    [isAcceleratedDeliveryEnabled, isAcceleratingAllergiesEnabled],
  );

  const isAcceleratingCareNotes = useMemo(
    () => {
      return isAcceleratedDeliveryEnabled && isAcceleratingCareNotesEnabled;
    },
    [isAcceleratedDeliveryEnabled, isAcceleratingCareNotesEnabled],
  );

  const isAcceleratingConditions = useMemo(
    () => {
      return isAcceleratedDeliveryEnabled && isAcceleratingConditionsEnabled;
    },
    [isAcceleratedDeliveryEnabled, isAcceleratingConditionsEnabled],
  );

  const isAcceleratingVitals = useMemo(
    () => {
      return isAcceleratedDeliveryEnabled && isAcceleratingVitalsEnabled;
    },
    [isAcceleratedDeliveryEnabled, isAcceleratingVitalsEnabled],
  );

  const isAcceleratingVaccines = useMemo(
    () => {
      return isAcceleratedDeliveryEnabled && isAcceleratingVaccinesEnabled;
    },
    [isAcceleratedDeliveryEnabled, isAcceleratingVaccinesEnabled],
  );

  const isAcceleratingLabsAndTests = useMemo(
    () => {
      return (
        isAcceleratedDeliveryEnabled &&
        isAcceleratingLabsAndTestsEnabled &&
        isCerner
      );
    },
    [isAcceleratedDeliveryEnabled, isAcceleratingLabsAndTestsEnabled, isCerner],
  );

  const isAcceleratingMedications = useMemo(
    () => {
      return isAcceleratedDeliveryEnabled && isAcceleratingMedicationsEnabled;
    },
    [isAcceleratedDeliveryEnabled, isAcceleratingMedicationsEnabled],
  );

  const isAcceleratingSecureMessaging = useMemo(
    () => {
      return (
        isAcceleratedDeliveryEnabled && isAcceleratingSecureMessagingEnabled
      );
    },
    [isAcceleratedDeliveryEnabled, isAcceleratingSecureMessagingEnabled],
  );

  const isAcceleratingImagingStudies = useMemo(
    () => {
      return (
        isAcceleratedDeliveryEnabled && isAcceleratingImagingStudiesEnabled
      );
    },
    [isAcceleratedDeliveryEnabled, isAcceleratingImagingStudiesEnabled],
  );

  // CCD V2 (Oracle Health) is enabled when the CCD OH flag is on
  // AND the `200CRNR` flag from MPI (isCernerPatient)
  const isAcceleratingCCD = useMemo(
    () => {
      return isCcdOHEnabled && isCernerUser;
    },
    [isCcdOHEnabled, isCernerUser],
  );

  const isAccelerating = useMemo(
    () =>
      isAcceleratedDeliveryEnabled ||
      isAcceleratingAllergies ||
      isAcceleratingCareNotes ||
      isAcceleratingCCD ||
      isAcceleratingConditions ||
      isAcceleratingVitals ||
      isAcceleratingLabsAndTests ||
      isAcceleratingMedications ||
      isAcceleratingSecureMessaging,
    [
      isAcceleratedDeliveryEnabled,
      isAcceleratingAllergies,
      isAcceleratingConditions,
      isAcceleratingCareNotes,
      isAcceleratingCCD,
      isAcceleratingVitals,
      isAcceleratingLabsAndTests,
      isAcceleratingMedications,
      isAcceleratingSecureMessaging,
    ],
  );

  return {
    isLoading,
    isCerner,
    isAccelerating,
    isAcceleratingAllergies,
    isAcceleratingCareNotes,
    isAcceleratingCCD,
    isAcceleratingConditions,
    isAcceleratingVitals,
    isAcceleratingVaccines,
    isAcceleratingLabsAndTests,
    isAcceleratingMedications,
    isAcceleratingSecureMessaging,
    isAcceleratingImagingStudies,
  };
};

export default useAcceleratedData;
