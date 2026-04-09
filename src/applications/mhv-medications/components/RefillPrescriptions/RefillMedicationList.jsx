import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom-v5-compat';
import { useSelector } from 'react-redux';
import { selectMedicationsManagementImprovementsFlag } from '../../util/selectors';
import { dataDogActionNames } from '../../util/dataDogConstants';

export const RefillMedicationList = ({
  medications,
  testId,
  showBold = false,
}) => {
  const isManagementImprovementsEnabled = useSelector(
    selectMedicationsManagementImprovementsFlag,
  );

  if (!medications?.length) return null;

  return (
    <ul className="va-list--disc" data-dd-privacy="mask" data-testid={testId}>
      {medications.map((medication, idx) => (
        <li
          className={`vads-u-padding-y--0 ${
            showBold ? 'vads-u-font-weight--bold' : ''
          }`}
          data-testid={`${testId}-${idx}`}
          key={`${medication?.prescriptionId || idx}`}
          data-dd-privacy="mask"
        >
          {isManagementImprovementsEnabled ? (
            <Link
              to={`/prescription/${medication?.prescriptionId}`}
              data-testid={`refill-success-medication-link-${idx}`}
              data-dd-action-name={
                dataDogActionNames.refillPage
                  .MEDICATION_NAME_LINK_IN_SUCCESS_ALERT
              }
            >
              {medication?.prescriptionName}
            </Link>
          ) : (
            medication?.prescriptionName
          )}
        </li>
      ))}
    </ul>
  );
};

RefillMedicationList.propTypes = {
  testId: PropTypes.string.isRequired,
  medications: PropTypes.array,
  showBold: PropTypes.bool,
};

export default RefillMedicationList;
