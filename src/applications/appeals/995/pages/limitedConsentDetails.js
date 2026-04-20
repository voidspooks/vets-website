import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { textareaUI } from 'platform/forms-system/src/js/web-component-patterns';

export const detailsQuestion =
  'What do you want your information request to be limited to?';
export const detailsHint =
  'For example, you want your doctor to release only treatment dates or certain types of disabilities.';
export const detailsError = 'Tell us how to limit our request';

const LimitedConsentDetailsReviewField = props => {
  const formData = useSelector(state => state.form?.data);
  const showArrayBuilder = formData?.showArrayBuilder;
  const details = props?.children?.props?.formData;

  if (!showArrayBuilder) {
    return null;
  }

  return (
    <>
      <p className="negative-margin vads-u-margin-y--0">
        How should we limit our request for your medical information?
      </p>
      <p className="vads-u-margin-top--0">
        <strong>{details}</strong>
      </p>
    </>
  );
};

LimitedConsentDetailsReviewField.propTypes = {
  children: PropTypes.shape({
    props: PropTypes.shape({
      formData: PropTypes.shape(),
    }),
  }),
};

export default {
  uiSchema: {
    limitedConsent: {
      ...textareaUI({
        title: detailsQuestion,
        hint: detailsHint,
        labelHeaderLevel: 3,
        classNames: 'vads-u-margin-bottom--4',
        required: () => true,
        errorMessages: {
          required: detailsError,
        },
      }),
      'ui:reviewField': LimitedConsentDetailsReviewField,
    },
  },
  schema: {
    required: ['limitedConsent'],
    type: 'object',
    properties: {
      limitedConsent: {
        type: 'string',
      },
    },
  },
};
