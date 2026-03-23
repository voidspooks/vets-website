/* istanbul ignore file */
import React from 'react';
import { useIsInPilotUserStations } from '../../../hooks/useIsInPilotUserStations';

export default function TestComponent() {
  const {
    isInPilotUserStations,
    isInPilotUserStationsV2,
  } = useIsInPilotUserStations();
  return (
    <div>
      <p>Test component</p>
      <p data-testid="pilot-value">{isInPilotUserStations.toString()}</p>
      <p data-testid="pilot-v2-value">{isInPilotUserStationsV2.toString()}</p>
    </div>
  );
}
