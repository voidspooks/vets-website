import React, { useEffect } from 'react';
import { focusElement } from '@department-of-veterans-affairs/platform-utilities/ui';
import InProgressMedicationsProcessList from '../components/PrescriptionsInProgress/InProgressMedicationsProcessList';
import NeedHelp from '../components/shared/NeedHelp';
import ApiErrorNotification from '../components/shared/ApiErrorNotification';
import useFetchPrescriptionsInProgress from '../hooks/PrescriptionsInProgress/useFetchPrescriptionsInProgress';
import { pageType } from '../util/dataDogConstants';
import InProgressMedicationsEmptyView from '../components/PrescriptionsInProgress/InProgressMedicationsEmptyView';
import MedicationResources from '../components/shared/MedicationResources';
import InnerNavigation from '../components/shared/InnerNavigation';

const PrescriptionsInProgress = () => {
  const {
    inProgress,
    shipped,
    submitted,
    tooEarly,
    prescriptionsApiError,
    isLoading,
  } = useFetchPrescriptionsInProgress();

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
      return <InProgressMedicationsEmptyView />;
    }

    return (
      <InProgressMedicationsProcessList
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
      <h1 data-testid="in-progress-medications-heading">
        In-progress medications
      </h1>
      {prescriptionsApiError && (
        <ApiErrorNotification errorType="access" content="medications" />
      )}
      <InnerNavigation />
      <p>
        Medications that are shipped will remain in this list for 15 days from
        the date of shipping. To review all your medications, go to your
        medication history.
      </p>
      {renderContent()}
      <MedicationResources page={pageType.IN_PROGRESS} headingLevel={2} />
      <NeedHelp page={pageType.IN_PROGRESS} headingLevel={2} />
    </div>
  );
};

export default PrescriptionsInProgress;
