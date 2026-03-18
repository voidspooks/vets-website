import React from 'react';
import PropTypes from 'prop-types';
import { VaLink } from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import AppointmentScheduledAlert from './AppointmentScheduledAlert';
import HubCardList from './HubCardList';
import SelectPreferenceView from './SelectPreferenceView';

const CaseProgressDescription = ({
  step,
  showHubCards = false,
  attributes = {},
}) => {
  const hubCards = showHubCards ? (
    <div className="vads-u-clear--both">
      <HubCardList step={step} />
    </div>
  ) : null;

  switch (step) {
    case 1: {
      return (
        <>
          <p>
            We’ve received your application for VR&E benefits, and it’s being
            reviewed.
          </p>
          <p>
            The section below contains information on steps you can take while
            waiting to hear back from us.
          </p>
          {hubCards}
        </>
      );
    }
    case 2: {
      return (
        <>
          <p>
            We’re currently reviewing your application to confirm your VR&E
            Chapter 31 eligibility.
          </p>
          {hubCards}
        </>
      );
    }
    case 3: {
      return (
        <>
          <p>
            VR&E is processing your Chapter 31 application. Your next step is to
            complete the orientation video online or during your initial
            evaluation counselor meeting.
          </p>
          <p>
            After you make your selection we’ll send you a scheduling link via
            email or text. In the meantime, we’re assigning a counselor to your
            case.
          </p>
          <SelectPreferenceView />
          <va-card background class="vads-u-margin-top--2">
            <h3 className="va-nav-linkslist-heading vads-u-margin-top--0 vads-u-margin-bottom--0">
              Reading Material
            </h3>
            <ul className="va-nav-linkslist-list vads-u-margin-bottom--2">
              <li>
                <VaLink
                  active
                  href="https://www.va.gov/careers-employment/vocational-rehabilitation"
                  text="Learn about the VR&E program"
                  className=" vads-u-font-weight--bold"
                />

                <p className="va-nav-linkslist-description">
                  Read about how Veteran Readiness and Employment (Chapter 31)
                  can help you address education or training needs.
                </p>
              </li>
              <li>
                <VaLink
                  active
                  className="vads-u-font-weight--bold"
                  href="https://www.va.gov/careers-employment/vocational-rehabilitation/programs"
                  text="Explore VR&E support-and-services tracks"
                />

                <p className="va-nav-linkslist-description">
                  We offer 5 support-and-services tracks to help you get
                  education, training, career planning, and live independently.
                </p>
              </li>
            </ul>
          </va-card>
          {hubCards}
        </>
      );
    }

    case 4: {
      const appointmentDetails = attributes?.orientationAppointmentDetails;

      if (!appointmentDetails?.appointmentDateTime) {
        return (
          <p>
            We’ve received and processed your application for Chapter 31
            benefits. Check your email to schedule your meeting with your
            counselor. After scheduling, you’ll get a confirmation email and an
            appointment notification letter. To get ready for your initial
            evaluation counselor meeting, visit the "Career planning" page
            linked below.
          </p>
        );
      }

      return (
        <>
          <p>
            Your initial evaluation appointment has been scheduled. If you need
            to reschedule, use your appointment confirmation rescheduling link
            sent to you via email and text. If you need further assistance,
            contact your counselor.
          </p>
          <AppointmentScheduledAlert
            appointmentDateTime={appointmentDetails.appointmentDateTime}
            appointmentPlace={appointmentDetails.appointmentPlace}
          />
        </>
      );
    }

    case 5: {
      return (
        <>
          <p>
            Your counselor is completing the entitlement determination review.
            Visit the “Career planning” page for more information about career
            paths, support, and rehabilitation resources.
          </p>
          {hubCards}
        </>
      );
    }

    case 6: {
      return (
        <>
          <p>
            Your counselor is working with you to establish your Chapter 31
            rehabilitation plan or career track.
          </p>
          {hubCards}
        </>
      );
    }

    case 7: {
      return (
        <>
          <p>Your Chapter 31 benefits have been initiated.</p>
          {hubCards}
        </>
      );
    }

    default:
      return null;
  }
};

CaseProgressDescription.propTypes = {
  step: PropTypes.number.isRequired,
  showHubCards: PropTypes.bool,
  attributes: PropTypes.object,
};

export default CaseProgressDescription;
