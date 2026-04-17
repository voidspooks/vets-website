import React, { useEffect } from 'react';
import { focusElement } from '@department-of-veterans-affairs/platform-utilities/ui';
import RefillStatusProcessList from '../components/RefillStatus/RefillStatusProcessList';
import NeedHelp from '../components/shared/NeedHelp';
import ApiErrorNotification from '../components/shared/ApiErrorNotification';
import useFetchRefillStatus from '../hooks/RefillStatus/useFetchRefillStatus';
import { pageType } from '../util/dataDogConstants';
import RefillStatusEmptyView from '../components/RefillStatus/RefillStatusEmptyView';
import MedicationResources from '../components/shared/MedicationResources';
import InnerNavigation from '../components/shared/InnerNavigation';

const RefillStatus = () => {
  const {
    inProgress,
    shipped,
    submitted,
    tooEarly,
    prescriptionsApiError,
    isLoading,
  } = useFetchRefillStatus();

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="vads-u-padding-y--9">
          <va-loading-indicator
            message="Loading medications..."
            setFocus
            data-testid="loading-indicator"
          />
        </div>
      );
    }

    if (
      inProgress.length === 0 &&
      shipped.length === 0 &&
      submitted.length === 0 &&
      tooEarly.length === 0
    ) {
      return <RefillStatusEmptyView />;
    }

    return (
      <RefillStatusProcessList
        inProgress={inProgress}
        shipped={shipped}
        submitted={submitted}
        tooEarly={tooEarly}
      />
    );
  };

  useEffect(() => {
    focusElement(document.querySelector('h1'));
  }, []);

  return (
    <div>
      <h1 data-testid="refill-status-heading">Prescription refill status</h1>
      {prescriptionsApiError && (
        <ApiErrorNotification errorType="access" content="medications" />
      )}
      <InnerNavigation />
      {renderContent()}
      <MedicationResources page={pageType.REFILL_STATUS} headingLevel={2} />
      <NeedHelp page={pageType.REFILL_STATUS} headingLevel={2} />
    </div>
  );
};

export default RefillStatus;
