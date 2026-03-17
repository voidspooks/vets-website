import React, { useState } from 'react';
import {
  VaRadio,
  VaRadioOption,
  VaButton,
  VaCheckbox,
  VaLink,
} from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser } from '@department-of-veterans-affairs/platform-user/selectors';
import { submitCh31CaseMilestones } from '../actions/ch31-case-milestones';
import {
  CH31_CASE_MILESTONES_RESET_STATE,
  MILESTONE_COMPLETION_TYPES,
  YOUTUBE_ORIENTATION_VIDEO_URL,
} from '../constants';

const ORIENTATION_TYPE = {
  WATCH_VIDEO: 'Watch the VA orientation video online',
  COMPLETE_DURING_MEETING:
    'Watch the VA orientation video during the initial evaluation counselor meeting ',
};

const preferenceRadioGroupName = 'orientation_type_preference';

export default function SelectPreferenceView() {
  const [orientationTypeRadioValue, setOrientationTypeRadioValue] = useState();
  const [attestationChecked, setAttestationChecked] = useState(false);
  const [checkboxError, setCheckboxError] = useState(false);
  const user = useSelector(selectUser);

  const ch31CaseMilestonesState = useSelector(
    state => state?.ch31CaseMilestones,
  );
  const dispatch = useDispatch();

  const submitAttestation = () => {
    if (
      orientationTypeRadioValue === ORIENTATION_TYPE.WATCH_VIDEO &&
      !attestationChecked
    ) {
      setCheckboxError(true);
      return;
    }

    dispatch(
      submitCh31CaseMilestones({
        milestoneCompletionType: MILESTONE_COMPLETION_TYPES.STEP_3,
        postpone:
          orientationTypeRadioValue ===
          ORIENTATION_TYPE.COMPLETE_DURING_MEETING,
        user,
      }),
    );
  };

  const errorAlert = (
    <div aria-live="assertive" role="alert">
      <va-alert class="vads-u-margin-bottom--1" status="error" visible slim>
        <p className="vads-u-margin-y--0">
          We’re sorry. Something went wrong on our end while submitting your
          preference. Please try again later.
        </p>
      </va-alert>
    </div>
  );

  const submitBtn = (
    <VaButton
      loading={ch31CaseMilestonesState?.loading}
      onClick={submitAttestation}
      text="Submit"
    />
  );

  return (
    <>
      <VaRadio
        label="How would you like to complete the orientation?"
        labelHeaderLevel="3"
        required
        onVaValueChange={e => {
          setOrientationTypeRadioValue(e.detail.value);
          setCheckboxError(false);
          setAttestationChecked(false);
          dispatch({ type: CH31_CASE_MILESTONES_RESET_STATE });
        }}
      >
        <VaRadioOption
          label={ORIENTATION_TYPE.COMPLETE_DURING_MEETING}
          name={preferenceRadioGroupName}
          value={ORIENTATION_TYPE.COMPLETE_DURING_MEETING}
        />
        <VaRadioOption
          label={ORIENTATION_TYPE.WATCH_VIDEO}
          name={preferenceRadioGroupName}
          value={ORIENTATION_TYPE.WATCH_VIDEO}
        />
        {orientationTypeRadioValue === ORIENTATION_TYPE.WATCH_VIDEO && (
          <div className="vads-u-margin-left--4">
            <p>
              VR&E services can help Veterans with job training, employment
              assistance, resume development, and coaching. Please watch the
              full video and self-certify upon completion.
            </p>
            <p>
              <VaLink
                iconName="youtube"
                iconSize={3}
                href={YOUTUBE_ORIENTATION_VIDEO_URL}
                onClick={e => {
                  e.preventDefault();
                  window.open(
                    YOUTUBE_ORIENTATION_VIDEO_URL,
                    '_blank',
                    'noopener,noreferrer',
                  );
                }}
                text="Go to the video about Veteran Readiness and Employment (VR&E) 5 Tracks on YouTube (opens in a new tab)"
              />
            </p>
            <VaCheckbox
              checkboxDescription="Check the box above if you have watched the Video Tutorial provided and hit the &quot;Submit&quot; button."
              label="I acknowledge and attest that I have watched and understand the five Paths for Career Planning."
              checked={attestationChecked}
              required
              error={
                checkboxError
                  ? 'You must acknowledge and attest that you have watched the video.'
                  : undefined
              }
              onVaChange={e => {
                setAttestationChecked(e.target.checked);
                setCheckboxError(false);
                dispatch({ type: CH31_CASE_MILESTONES_RESET_STATE });
              }}
            />
          </div>
        )}
      </VaRadio>
      {ch31CaseMilestonesState?.error && errorAlert}
      {submitBtn}
    </>
  );
}
