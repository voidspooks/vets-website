import React, { useEffect, useState } from 'react';

import { getDiagnostics } from '../utils/api';
import { isProduction } from '../utils/environment';

export default function EnvironmentBanner() {
  const [crmEnvironment, setCrmEnvironment] = useState(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isProduction()) return;

    getDiagnostics()
      .then(res => {
        setCrmEnvironment(res?.crmEnvironment?.toUpperCase() || null);
      })
      .catch(() => {
        setCrmEnvironment(null);
      });
  }, []);

  if (!crmEnvironment || isDismissed) return null;

  return (
    <div className="environment-banner">
      <span>{crmEnvironment}</span>
      {/* eslint-disable-next-line @department-of-veterans-affairs/prefer-button-component */}
      <button
        type="button"
        onClick={() => setIsDismissed(true)}
        aria-label="Dismiss environment banner"
        className="dismiss-button"
      >
        <va-icon icon="close" size="2" />
      </button>
    </div>
  );
}
