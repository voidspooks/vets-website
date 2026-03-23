import { useSelector } from 'react-redux';
import { selectPatientFacilities } from '@department-of-veterans-affairs/platform-user/cerner-dsot/selectors';
import {
  selectFeatureCCDirectSchedulingV2,
  selectFeatureCCDirectScheduling,
} from '../../redux/selectors';
import {
  getIsInPilotUserStations,
  getIsInPilotUserStationsV2,
} from '../utils/pilot';

const emptyPatientFacilities = [];

const useIsInPilotUserStations = () => {
  const featureCCDirectScheduling = useSelector(
    selectFeatureCCDirectScheduling,
  );

  const featureCCDirectSchedulingV2 = useSelector(
    selectFeatureCCDirectSchedulingV2,
  );

  const patientFacilities = useSelector(selectPatientFacilities);

  return {
    isInPilotUserStations: getIsInPilotUserStations(
      featureCCDirectScheduling,
      patientFacilities || emptyPatientFacilities,
    ),
    isInPilotUserStationsV2: getIsInPilotUserStationsV2(
      featureCCDirectSchedulingV2,
      patientFacilities || emptyPatientFacilities,
    ),
  };
};

export { useIsInPilotUserStations };
