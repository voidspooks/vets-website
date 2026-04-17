import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { dataDogActionNames, pageType } from '../../util/dataDogConstants';
import { selectMedicationsManagementImprovementsFlag } from '../../util/selectors';
import MedsByMailContent from '../MedicationsList/MedsByMailContent';
import { selectHasMedsByMailFacility } from '../../selectors/selectUser';

const MedicationResources = ({ page, headingLevel = 3 }) => {
  const isManagementImprovementsEnabled = useSelector(
    selectMedicationsManagementImprovementsFlag,
  );
  const hasMedsByMailFacility = useSelector(selectHasMedsByMailFacility);

  // Memoize DataDog action names based on page type to prevent recalculation on every render
  const actionNames = useMemo(
    () => {
      const pageActionMap = {
        [pageType.LIST]: dataDogActionNames.medicationsListPage,
        [pageType.REFILL]: dataDogActionNames.refillPage,
        [pageType.HISTORY]: dataDogActionNames.medicationsHistoryPage,
        [pageType.REFILL_STATUS]: dataDogActionNames.refillStatusPage,
      };

      const pageActions = pageActionMap[page] || dataDogActionNames.refillPage;

      return {
        orderMedicalSuppliesLink: pageActions.ORDER_MEDICAL_SUPPLIES_LINK,
        seiLink: pageActions.GO_TO_SELF_ENTERED_HEALTH_INFORMATION_LINK,
        notificationLink: pageActions.GO_TO_UPDATE_NOTIFICATION_SETTINGS_LINK,
        allergiesLink: pageActions.GO_TO_ALLERGIES_AND_REACTIONS_LINK,
      };
    },
    [page],
  );

  const HeadingTag = `h${headingLevel}`;

  if (isManagementImprovementsEnabled) {
    return (
      <div
        aria-labelledby="medication-resources-heading"
        data-testid="rx-medication-resources-container"
      >
        <HeadingTag
          id="medication-resources-heading"
          className="vads-u-border-bottom--2px vads-u-border-color--primary vads-u-line-height--5 vads-u-font-size--h3"
        >
          More medication resources
        </HeadingTag>

        <p>
          <va-link
            href="/health-care/order-medical-supplies/"
            text="Order medical supplies and devices"
            data-testid="order-medical-supplies-link"
            data-dd-action-name={actionNames.orderMedicalSuppliesLink}
          />
        </p>

        <p>
          <va-link
            href="/my-health/medical-records/download?sei=true"
            text="Download your self-entered health information"
            data-testid="download-your-self-entered-health-information-link"
            data-dd-action-name={actionNames.seiLink}
          />
        </p>

        <p>
          <va-link
            href="/profile/notifications/"
            text="Update notification settings"
            data-testid="update-notification-settings-link"
            data-dd-action-name={actionNames.notificationLink}
          />
        </p>

        <p className={hasMedsByMailFacility ? 'vads-u-margin-bottom--1' : ''}>
          <va-link
            href="/my-health/medical-records/allergies/"
            text="Review your allergies and reactions"
            data-testid="review-your-allergies-and-reactions-link"
            data-dd-action-name={actionNames.allergiesLink}
          />
        </p>

        {hasMedsByMailFacility && <MedsByMailContent headingLevel={3} />}
      </div>
    );
  }

  // Hidden when feature flag is disabled
  return null;
};

MedicationResources.propTypes = {
  page: PropTypes.string.isRequired,
  headingLevel: PropTypes.oneOf([1, 2, 3, 4, 5, 6]),
};

export default MedicationResources;
