import React from 'react';
import PropTypes from 'prop-types';
import { VaLink } from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import { useNavigate } from 'react-router-dom-v5-compat';
import HubCardList from './HubCardList';
import SelectPreferenceView from './SelectPreferenceView';

const CaseProgressDescription = ({
  step,
  showHubCards = false,
  attributes = {},
}) => {
  const navigate = useNavigate();
  const hubCards = showHubCards ? (
    <div className="vads-u-clear--both">
      <HubCardList step={step} />
    </div>
  ) : null;

  const handleCareerPlanningClick = event => {
    event.preventDefault();
    navigate('/career-planning');
  };

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
            We’re processing your VR&E application. We’re also assigning a
            counselor to you.
          </p>
          <p>
            Before we schedule your initial evaluation counselor meeting, we
            need to know how you’d like to complete the orientation video. You
            can review this video during your counselor meeting or online on
            your own time.
          </p>
          <p>
            Next, we’ll send you a link to schedule your counselor meeting to
            your email or by text message.
          </p>
          <SelectPreferenceView />
          {hubCards}
        </>
      );
    }

    case 4: {
      const appointmentDetails = attributes?.orientationAppointmentDetails;

      if (!appointmentDetails?.appointmentDateTime) {
        return (
          <>
            <p>
              We’ve processed your application for Chapter 31 benefits. Check
              your email to schedule your meeting with your counselor. After
              scheduling, you’ll get a confirmation email and an appointment
              notification letter.
            </p>
            <p>
              Use the career planning tools and resources link below to prepare
              for your initial evaluation counselor meeting.
            </p>
          </>
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
        </>
      );
    }

    case 5: {
      return (
        <>
          <p>
            Your counselor is completing your entitlement determination review.
            While you wait, you can continue reviewing our career planning tools
            and resources.
          </p>
          <div className="vads-u-margin-top--1">
            <VaLink
              href="/career-planning"
              text="Explore career planning tools and resources"
              onClick={handleCareerPlanningClick}
            />
          </div>
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
