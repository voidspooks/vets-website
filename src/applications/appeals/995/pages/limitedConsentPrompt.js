import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import {
  yesNoSchema,
  yesNoUI,
} from 'platform/forms-system/src/js/web-component-patterns';
import { HAS_PRIVATE_LIMITATION } from '../constants';

export const reviewTitle = 'Limitation of consent';
export const promptQuestion =
  'Do you want to limit consent for the information requested?';
export const requiredError = 'Select if you want to limit consent';
export const aboveRadioQuestion =
  'Do you want us to limit consent for the information requested?';

const LimitedConsentPromptReviewField = props => {
  const formData = useSelector(state => state.form?.data);
  const showArrayBuilder = formData?.showArrayBuilder;
  const limitedConsent = props.children?.props?.formData;

  if (!showArrayBuilder) {
    return null;
  }

  return (
    <>
      <h4>{reviewTitle}</h4>
      <p className="vads-u-border-top--1px vads-u-border-color--base-light vads-u-padding-top--2 vads-u-margin-bottom--0">
        Do you want us to limit consent?
      </p>
      <p className="vads-u-margin-top--0">
        <strong>{limitedConsent ? 'Yes' : 'No'}</strong>
      </p>
    </>
  );
};

LimitedConsentPromptReviewField.propTypes = {
  children: PropTypes.shape({
    props: PropTypes.shape({
      formData: PropTypes.shape(),
    }),
  }),
};

export default {
  uiSchema: {
    [HAS_PRIVATE_LIMITATION]: {
      ...yesNoUI({
        formHeading: promptQuestion,
        useFormsPattern: 'single',
        title: aboveRadioQuestion,
        labelHeaderLevel: undefined,
        formHeadingLevel: '3',
        formDescription: (
          <>
            <p>
              If you choose to limit consent, your private provider, VA Vet
              Center, or medical facility can't release certain types or amounts
              of information to us. For example, you want your doctor to release
              only information for certain treatment dates or health conditions.
            </p>
            <p>
              It may take us longer to get your medical records from a private
              provider or VA Vet Center if you limit consent.
            </p>
          </>
        ),
        enableAnalytics: true,
        labels: {
          Y: 'Yes',
          N: 'No',
        },
        descriptions: {
          Y: `You'll describe the specific sources and information you want to limit on the next page.`,
        },
        tile: true,
      }),
      'ui:reviewField': LimitedConsentPromptReviewField,
      'ui:required': formData => formData?.showArrayBuilder,
      'ui:errorMessages': {
        required: requiredError,
      },
    },
  },
  schema: {
    type: 'object',
    properties: {
      [HAS_PRIVATE_LIMITATION]: yesNoSchema,
      'view:evidenceLimitInfo': {
        type: 'object',
        properties: {},
      },
    },
  },
};
