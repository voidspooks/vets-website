const stagingStations = ['984', '983'];
// V1 community care pilot stations
const prodStations = ['659', '657', '648'];
// V2 community care pilot stations
const prodStationsV2 = ['534', '508'];

/**
 * Determines if a patient is in the Community Care (CC) pilot program user station.
 *
 * @param {boolean} featureCCDirectScheduling - Flag indicating if the CC direct scheduling feature is enabled.
 * @param {Array<{ facilityId: string }>} patientFacilities - Array of patient facilities with their IDs.
 * @returns {boolean} - Returns true if the patient is in the CC pilot program user station, otherwise false.
 */
const getIsInPilotUserStations = (
  featureCCDirectScheduling,
  patientFacilities = [],
) => {
  const pilotStations = [...stagingStations, ...prodStations];
  // eslint-disable-next-line no-unused-vars
  const hasPilotStation = patientFacilities.some(station =>
    pilotStations.includes(station.facilityId),
  );

  return featureCCDirectScheduling && hasPilotStation;
};

/**
 * Determines if a patient is in the Community Care (CC) pilot program user station V2.
 *
 * @param {boolean} featureCCDirectScheduling - Flag indicating if the CC direct scheduling feature is enabled.
 * @param {Array<{ facilityId: string }>} patientFacilities - Array of patient facilities with their IDs.
 * @returns {boolean} - Returns true if the patient is in the CC pilot program user station V2, otherwise false.
 */
const getIsInPilotUserStationsV2 = (
  featureCCDirectSchedulingV2,
  patientFacilities = [],
) => {
  const pilotStations = [...stagingStations, ...prodStationsV2];
  const hasPilotStation = patientFacilities.some(station =>
    pilotStations.includes(station.facilityId),
  );

  return featureCCDirectSchedulingV2 && hasPilotStation;
};

const getIsInPilotReferralStation = referral => {
  const validStationIds = [
    ...stagingStations,
    // Charleston
    '534',
    '534QD',
    '534GH',
    '534QC',
    '534GF',
    '534GD',
    '534QE',
    '534GC',
    '534GE',
    '534GB',
    '534BY',
    '534GG',
    // Atlanta
    '508',
    '508QK',
    '508QF',
    '508QC',
    '508QI',
    '508QJ',
    '508GA',
    '508GP',
    '508GO',
    '508GQ',
    '508QE',
    '508GG',
    '508GH',
    '508GF',
    '508QH',
    '508GN',
    '508GI',
    '508GE',
    '508GS',
    '508GM',
    '508GK',
    '508GL',
    '508GJ',
  ];
  return validStationIds.includes(referral.stationId);
};

export {
  getIsInPilotUserStations,
  getIsInPilotUserStationsV2,
  getIsInPilotReferralStation,
};
