import React from 'react';
import PropTypes from 'prop-types';
import { titleCase } from '../../utils/formatters';
import AppointmentDate from '../../components/AppointmentDate';
import AppointmentTime from '../../components/AppointmentTime';
import ProviderAddress from './ProviderAddress';
import { getModalityDisplay } from '../utils/modality';

export default function ConfirmationAppointmentCard({
  date,
  timezone,
  typeOfCare,
  isCC,
  providerName,
  organizationName,
  clinicName,
  facilityName,
  modality,
  address,
  detailsLink,
  onDetailsClick,
}) {
  const { text: modalityText, icon: modalityIcon } = getModalityDisplay(
    modality,
  );

  return (
    <div
      className="vads-u-margin-top--6 vads-u-border-top--1px vads-u-border-bottom--1px vads-u-border-color--gray-lighter"
      data-testid="appointment-block"
    >
      <p
        className="vads-u-margin-bottom--0 vads-u-font-family--serif"
        data-testid="appointment-date-container"
      >
        <AppointmentDate date={date} timezone={timezone} />
      </p>
      <h2
        className="vads-u-margin-top--0 vads-u-margin-bottom-1"
        data-testid="appointment-time-container"
      >
        <AppointmentTime date={date} timezone={timezone} />
      </h2>
      <strong data-dd-privacy="mask" data-testid="appointment-type">
        {titleCase(typeOfCare)}
      </strong>
      <p
        className="vads-u-margin-bottom--0"
        data-testid="appointment-care-type"
      >
        {isCC ? 'Community care' : 'VA care'}
      </p>
      {isCC ? (
        <p
          className="vads-u-margin-bottom--0"
          data-dd-privacy="mask"
          data-testid="appointment-provider-name"
        >
          {providerName || 'Provider name not available'}
        </p>
      ) : (
        <p
          className="vads-u-margin-bottom--0"
          data-dd-privacy="mask"
          data-testid="appointment-clinic-name"
        >
          Clinic: {clinicName || 'Not available'}
        </p>
      )}
      <p
        className="vads-u-margin-bottom--0 vads-u-display--flex vads-u-align-items--center"
        data-testid="appointment-modality"
      >
        <va-icon
          icon={modalityIcon}
          size={3}
          aria-hidden="true"
          className="vads-u-margin-right--0p5"
        />
        <span>{modalityText}</span>
      </p>
      <p
        className="vads-u-margin-bottom--0"
        data-dd-privacy="mask"
        data-testid="appointment-organization-name"
      >
        {isCC
          ? organizationName || 'Organization not available'
          : facilityName || 'Facility not available'}
      </p>
      <ProviderAddress address={address} />
      <p>
        <va-link
          href={detailsLink}
          data-testid="cc-details-link"
          text="Details"
          onClick={onDetailsClick}
        />
      </p>
    </div>
  );
}

ConfirmationAppointmentCard.propTypes = {
  address: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  date: PropTypes.string.isRequired,
  detailsLink: PropTypes.string.isRequired,
  isCC: PropTypes.bool.isRequired,
  timezone: PropTypes.string.isRequired,
  typeOfCare: PropTypes.string.isRequired,
  onDetailsClick: PropTypes.func.isRequired,
  clinicName: PropTypes.string,
  facilityName: PropTypes.string,
  modality: PropTypes.string,
  organizationName: PropTypes.string,
  providerName: PropTypes.string,
};
