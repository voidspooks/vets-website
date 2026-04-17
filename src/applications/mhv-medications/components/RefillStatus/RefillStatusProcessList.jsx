import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { selectIsCernerPatient } from 'platform/user/cerner-dsot/selectors';

import Prescription from './Prescription';
import TooEarlyToRefillCard from './TooEarlyToRefillCard';

import pluralize from '../../util/helpers/pluralize';
import { REFILL_STATUS_DISPLAY_TYPES } from '../../util/constants';

const SubmittedStep = ({ submitted = [], tooEarly = [] }) => {
  const descriptionText = submitted.length
    ? `We’ve received your request to refill ${pluralize(
        submitted.length,
        'this prescription',
        'these prescriptions',
      )}. It may take up to 7 days to start processing your request.`
    : 'You don’t have any refill requests.';

  return (
    <va-process-list-item header="Request submitted" level={2}>
      <p>{descriptionText}</p>
      <p>
        <strong>Note: </strong>
        Medications prescribed in the last 24 hours may not appear here yet.
      </p>
      <div data-testid="submitted-prescriptions">
        {submitted.map(prescription => (
          <Prescription
            key={prescription.prescriptionId}
            displayType={REFILL_STATUS_DISPLAY_TYPES.SUBMITTED}
            prescription={prescription}
          />
        ))}
      </div>
      {tooEarly.length > 0 && <TooEarlyToRefillCard tooEarly={tooEarly} />}
    </va-process-list-item>
  );
};

SubmittedStep.propTypes = {
  submitted: PropTypes.array.isRequired,
  tooEarly: PropTypes.array.isRequired,
};

const InProgressStep = ({ prescriptions }) => {
  const isOHUser = useSelector(selectIsCernerPatient);
  const descriptionText = prescriptions.length
    ? `We’re working to fill ${pluralize(
        prescriptions.length,
        'this prescription',
        'these prescriptions',
      )}.${
        isOHUser
          ? ' If your refill is taking longer than expected, call your VA pharmacy’s automated refill line. The phone number is on your prescription label or in your medication details page.'
          : ''
      }`
    : 'You don’t have any fills in progress.';
  return (
    <va-process-list-item header="Fill in progress" level={2}>
      <p>{descriptionText}</p>
      <div data-testid="refill-status-prescriptions">
        {prescriptions.map(prescription => (
          <Prescription
            key={prescription.prescriptionId}
            displayType={REFILL_STATUS_DISPLAY_TYPES.IN_PROGRESS}
            prescription={prescription}
          />
        ))}
      </div>
    </va-process-list-item>
  );
};

InProgressStep.propTypes = {
  prescriptions: PropTypes.array.isRequired,
};

const ShippedStep = ({ prescriptions }) => {
  const descriptionText = prescriptions.length
    ? `${pluralize(
        prescriptions.length,
        'This prescription is on its way to you or has already arrived',
        'These prescriptions are on their way to you or have already arrived',
      )}. It usually takes 3-5 days after shipping for prescriptions to arrive at your address.`
    : 'You don’t have any prescriptions shipped within the past 15 days.';
  return (
    <va-process-list-item header="Prescription shipped" level={2}>
      <p>{descriptionText}</p>
      <div data-testid="shipped-prescriptions">
        {prescriptions.map(prescription => (
          <Prescription
            key={prescription.prescriptionId}
            displayType={REFILL_STATUS_DISPLAY_TYPES.SHIPPED}
            prescription={prescription}
          />
        ))}
      </div>
    </va-process-list-item>
  );
};

ShippedStep.propTypes = {
  prescriptions: PropTypes.array.isRequired,
};

const RefillStatusProcessList = ({
  inProgress = [],
  shipped = [],
  submitted = [],
  tooEarly = [],
}) => (
  <va-process-list>
    <SubmittedStep submitted={submitted} tooEarly={tooEarly} />
    <InProgressStep prescriptions={inProgress} />
    <ShippedStep prescriptions={shipped} />
  </va-process-list>
);

RefillStatusProcessList.propTypes = {
  inProgress: PropTypes.arrayOf(
    PropTypes.shape({
      prescriptionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
    }),
  ),
  shipped: PropTypes.arrayOf(
    PropTypes.shape({
      prescriptionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
    }),
  ),
  submitted: PropTypes.arrayOf(
    PropTypes.shape({
      prescriptionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
    }),
  ),
  tooEarly: PropTypes.arrayOf(
    PropTypes.shape({
      prescriptionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
    }),
  ),
};

export default RefillStatusProcessList;
