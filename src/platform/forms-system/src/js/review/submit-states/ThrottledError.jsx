import React, { useEffect } from 'react';

import PropTypes from 'prop-types';
import { Column, Row } from 'platform/forms/components/common/grid';
import ErrorMessage from 'platform/forms/components/common/alerts/ErrorMessage';
import PreSubmitSection from 'platform/forms/components/review/PreSubmitSection';
import { waitForRenderThenFocus } from 'platform/utilities/ui/focus';
import { scrollTo } from 'platform/utilities/scroll';

import ProgressButton from '../../components/ProgressButton';
import Back from './Back';
import { timeFromNow } from '../../../../../utilities/date';

export default function ThrottledError(props) {
  const { buttonText, when, formConfig, onBack, onSubmit, testId } = props;

  const {
    ariaDescribedBySubmit,
    throttledError: CustomThrottledError,
    formOptions,
    useTopBackLink,
  } = formConfig || {};

  useEffect(
    () => {
      // ErrorMessage & ErrorLinks components do their own focus management
      if (CustomThrottledError) {
        // Initial focus is on the progress stepper
        setTimeout(() => {
          waitForRenderThenFocus('#submission-error-wrapper');
          scrollTo('#submission-error-wrapper');
        });
      }
    },
    [CustomThrottledError],
  );

  let ariaDescribedBy = null;
  // If no ariaDescribedBy is passed down from form.js,
  // a null value will properly not render the aria label.
  if (formConfig?.ariaDescribedBySubmit !== null) {
    ariaDescribedBy = ariaDescribedBySubmit;
  } else {
    ariaDescribedBy = null;
  }
  const hideBackButton = useTopBackLink || false;
  const useWebComponents = formOptions?.useWebComponentForNavigation;

  return (
    <>
      <Row>
        <Column id="submission-error-wrapper" role="alert" testId={testId}>
          {CustomThrottledError ? (
            <div id="submission-error-wrapper">
              <CustomThrottledError {...props} />
            </div>
          ) : (
            <ErrorMessage
              active
              title="We’ve run into a problem"
              message={`We’re sorry. Your submission didn’t go through because we received
              too many requests from you. Please wait
              ${timeFromNow(new Date(when * 1000))} and submit your request
              again.`}
            />
          )}
        </Column>
      </Row>
      <PreSubmitSection formConfig={formConfig} />
      <Row classNames="form-progress-buttons vads-u-margin-y--2">
        {hideBackButton ? (
          <>
            <Column classNames="small-6 medium-5">
              <ProgressButton
                ariaDescribedBy={ariaDescribedBy}
                onButtonClick={onSubmit}
                buttonText={buttonText}
                buttonClass="usa-button-primary"
                useWebComponents={useWebComponents}
              />
            </Column>
          </>
        ) : (
          <>
            <Column classNames="small-6 medium-5">
              <Back
                onButtonClick={onBack}
                useWebComponents={useWebComponents}
              />
            </Column>
            <Column classNames="small-6 medium-5">
              <ProgressButton
                ariaDescribedBy={ariaDescribedBy}
                onButtonClick={onSubmit}
                buttonText={buttonText}
                buttonClass="usa-button-primary"
                useWebComponents={useWebComponents}
              />
            </Column>
            <Column classNames="small-1 medium-1 end">
              <div className="hidden">&nbsp;</div>
            </Column>
          </>
        )}
      </Row>
    </>
  );
}

ThrottledError.propTypes = {
  buttonText: PropTypes.string,
  formConfig: PropTypes.shape({
    throttledError: PropTypes.func,
    showReviewErrors: PropTypes.bool,
    ariaDescribedBySubmit: PropTypes.string,
    useTopBackLink: PropTypes.bool,
    formOptions: PropTypes.shape({
      useWebComponentForNavigation: PropTypes.bool,
    }),
  }),
  submission: PropTypes.shape({
    errorMessage: PropTypes.string,
    errorReceived: PropTypes.oneOfType([
      PropTypes.instanceOf(Error),
      PropTypes.shape({
        message: PropTypes.string,
      }),
      PropTypes.shape({
        errors: PropTypes.arrayOf(
          PropTypes.shape({
            code: PropTypes.string,
            detail: PropTypes.string,
            source: PropTypes.shape({
              pointer: PropTypes.string,
            }),
            status: PropTypes.string,
            title: PropTypes.string,
          }),
        ),
      }),
    ]),
    hasAttemptedSubmit: PropTypes.bool,
    id: PropTypes.any,
    status: PropTypes.string,
    timestamp: PropTypes.number,
    onBack: PropTypes.func,
    onSubmit: PropTypes.func,
  }),
  testId: PropTypes.string,
  when: PropTypes.number,
  onBack: PropTypes.func,
  onSubmit: PropTypes.func,
};
