import React from 'react';
import { Provider } from 'react-redux';
import { expect } from 'chai';
import { render, fireEvent } from '@testing-library/react';
import sinon from 'sinon-v20';
import { DefinitionTester } from 'platform/testing/unit/schemaform-utils';
import { $ } from 'platform/forms-system/src/js/utilities/ui';
import formConfig from '../../config/form';
import { HAS_PRIVATE_LIMITATION } from '../../constants';
import { reviewTitle } from '../../pages/limitedConsentPrompt';

describe('Supplemental Claims Limited Consent Prompt Page', () => {
  const {
    schema,
    uiSchema,
  } = formConfig.chapters.evidence.pages.limitedConsentPrompt;

  let onSubmit;

  beforeEach(() => {
    onSubmit = sinon.spy();
  });

  afterEach(() => {
    sinon.restore();
  });

  const renderContainer = (data = {}, formData = {}) => {
    return render(
      <DefinitionTester
        definitions={{}}
        schema={schema}
        uiSchema={uiSchema}
        data={data}
        formData={formData}
        onSubmit={onSubmit}
      />,
    );
  };

  describe('initial render', () => {
    it('should render with correct structure and attributes', () => {
      const { container } = renderContainer();

      const radio = $('va-radio', container);
      expect(radio).to.exist;
      expect(radio.getAttribute('required')).to.eq('false');
      expect($('va-radio-option[value="Y"]', container)).to.exist;
      expect($('va-radio-option[value="N"]', container)).to.exist;
      expect($('button[type="submit"]', container)).to.exist;
    });
  });

  describe('ui:required', () => {
    it('should not be required when showArrayBuilder is false', () => {
      const requiredFn = uiSchema[HAS_PRIVATE_LIMITATION]['ui:required'];
      expect(requiredFn({})).to.not.be.ok;
    });

    it('should be required when showArrayBuilder is true', () => {
      const requiredFn = uiSchema[HAS_PRIVATE_LIMITATION]['ui:required'];
      expect(requiredFn({ showArrayBuilder: true })).to.be.true;
    });
  });

  describe('submission', () => {
    it('should allow submission when not required and no selection made', () => {
      const { container } = renderContainer();

      fireEvent.click($('button[type="submit"]', container));

      expect(onSubmit.called).to.be.true;
    });

    it('should submit with Yes selection', () => {
      const { container } = renderContainer({
        [HAS_PRIVATE_LIMITATION]: true,
      });

      fireEvent.click($('button[type="submit"]', container));

      expect(onSubmit.called).to.be.true;
    });

    it('should submit with No selection', () => {
      const { container } = renderContainer({
        [HAS_PRIVATE_LIMITATION]: false,
      });

      fireEvent.click($('button[type="submit"]', container));

      expect(onSubmit.called).to.be.true;
    });
  });

  describe('LimitedConsentPromptReviewField', () => {
    const ReviewField = uiSchema[HAS_PRIVATE_LIMITATION]['ui:reviewField'];
    const createStore = (data = {}) => ({
      getState: () => ({ form: { data } }),
      subscribe: () => {},
      dispatch: () => {},
    });

    it('should return null when showArrayBuilder is false', () => {
      const store = createStore();
      const { container } = render(
        <Provider store={store}>
          <ReviewField>
            {React.createElement('div', { formData: true })}
          </ReviewField>
        </Provider>,
      );

      expect(container.innerHTML).to.eq('');
    });

    it('should render "Yes" when limitedConsent is truthy', () => {
      const store = createStore({ showArrayBuilder: true });
      const { container } = render(
        <Provider store={store}>
          <ReviewField>
            {React.createElement('div', { formData: true })}
          </ReviewField>
        </Provider>,
      );

      expect($('h4', container).textContent).to.eq(reviewTitle);
      expect($('strong', container).textContent).to.eq('Yes');
    });

    it('should render "No" when limitedConsent is falsy', () => {
      const store = createStore({ showArrayBuilder: true });
      const { container } = render(
        <Provider store={store}>
          <ReviewField>
            {React.createElement('div', { formData: false })}
          </ReviewField>
        </Provider>,
      );

      expect($('h4', container).textContent).to.eq(reviewTitle);
      expect($('strong', container).textContent).to.eq('No');
    });
  });
});
