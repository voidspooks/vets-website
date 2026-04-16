import PropTypes from 'prop-types';
import React from 'react';
import FindCCFacilityLink from './FindCCFacilityLink';
import NewTabAnchor from '../../components/NewTabAnchor';
import UrgentCommunicationsBlock from './UrgentCommunicationsBlock';

const ErrorAlert = ({
  body,
  showFindCCFacilityLink = false,
  newTab = false,
  isVAAppointment = false,
}) => {
  if (isVAAppointment) {
    return (
      <va-alert data-testid="error" status="error">
        <h2>This tool isn’t working right now</h2>
        <p data-testid="error-body">
          We’re sorry. There’s a problem with appointments. Refresh this page or
          try again later.
        </p>
        <p>
          If that doesn’t work, you can call your local VA health care facility
          to schedule this appointment.
        </p>
        <NewTabAnchor
          href="/find-locations"
          data-testid="find-va-facility-link"
        >
          Find your local VA health care facility
        </NewTabAnchor>
        <UrgentCommunicationsBlock />
      </va-alert>
    );
  }

  return (
    <va-alert data-testid="error" status="error">
      <h2>We’re sorry. We’ve run into a problem.</h2>
      <p data-testid="error-body">
        {body || 'Something went wrong on our end. Please try again later.'}
      </p>
      {showFindCCFacilityLink && <FindCCFacilityLink newTab={newTab} />}
    </va-alert>
  );
};

export default ErrorAlert;

ErrorAlert.propTypes = {
  body: PropTypes.string,
  header: PropTypes.string,
  isVAAppointment: PropTypes.bool,
  newTab: PropTypes.bool,
  showFindCCFacilityLink: PropTypes.bool,
};
