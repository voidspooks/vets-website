import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { cleanup, fireEvent, render } from '@testing-library/react';

const loadSelectorWithStubs = ({ enabled = false, isLoading = false } = {}) => {
  const componentPath = require.resolve(
    '../../../../components/PreSubmitInfo2',
  );
  const toggleHookPath = require.resolve(
    '~/platform/utilities/feature-toggles/useFeatureToggle',
  );
  const selectorPath = require.resolve(
    '../../../../containers/selectors/PreSubmitInfoSelector',
  );

  delete require.cache[componentPath];
  delete require.cache[toggleHookPath];
  delete require.cache[selectorPath];

  require.cache[componentPath] = {
    id: componentPath,
    filename: componentPath,
    loaded: true,
    exports: {
      __esModule: true,
      PreSubmitInfo2: props => (
        <div
          data-testid="new-presubmit"
          data-show-error={String(!!props.showError)}
        />
      ),
    },
  };

  require.cache[toggleHookPath] = {
    id: toggleHookPath,
    filename: toggleHookPath,
    loaded: true,
    exports: {
      __esModule: true,
      useFeatureToggle: () => ({
        TOGGLE_NAMES: {
          coeFormRebuildCveteam: 'coe_form_rebuild_cveteam',
        },
        useToggleValue: () => enabled,
        useToggleLoadingValue: () => isLoading,
      }),
    },
  };

  return require('../../../../containers/selectors/PreSubmitInfoSelector')
    .PreSubmitInfoSelector;
};

describe('COE PreSubmitInfoSelector', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders a loading indicator while the feature toggle is loading', () => {
    const PreSubmitInfoSelector = loadSelectorWithStubs({ isLoading: true });
    const { container, queryByTestId } = render(
      <PreSubmitInfoSelector
        formData={{}}
        preSubmitInfo={{ required: true, field: 'privacy', notice: null }}
        showError={false}
        onSectionComplete={() => {}}
      />,
    );
    const loader = container.querySelector('va-loading-indicator');
    expect(loader).to.exist;
    expect(loader.getAttribute('message')).to.equal(
      'Loading your application...',
    );
    expect(queryByTestId('new-presubmit')).to.not.exist;
  });

  it('renders the new PreSubmitInfo2 component when the toggle is enabled', () => {
    const PreSubmitInfoSelector = loadSelectorWithStubs({ enabled: true });
    const { queryByTestId } = render(
      <PreSubmitInfoSelector
        formData={{}}
        preSubmitInfo={{ required: true, field: 'privacy', notice: null }}
        showError
        onSectionComplete={() => {}}
      />,
    );
    expect(queryByTestId('new-presubmit')).to.exist;
    // props are forwarded
    expect(
      queryByTestId('new-presubmit').getAttribute('data-show-error'),
    ).to.equal('true');
  });

  describe('when the toggle is disabled (legacy branch)', () => {
    it('renders the preSubmitInfo.notice content', () => {
      const PreSubmitInfoSelector = loadSelectorWithStubs({ enabled: false });
      const { getByText } = render(
        <PreSubmitInfoSelector
          formData={{}}
          preSubmitInfo={{
            required: true,
            field: 'privacy',
            notice: <p>Legacy privacy notice</p>,
          }}
          showError={false}
          onSectionComplete={() => {}}
        />,
      );
      expect(getByText('Legacy privacy notice')).to.exist;
    });

    it('renders a va-privacy-agreement when preSubmitInfo.required is true', () => {
      const PreSubmitInfoSelector = loadSelectorWithStubs({ enabled: false });
      const { container } = render(
        <PreSubmitInfoSelector
          formData={{ privacy: true }}
          preSubmitInfo={{ required: true, field: 'privacy', notice: null }}
          showError={false}
          onSectionComplete={() => {}}
        />,
      );
      const agreement = container.querySelector('va-privacy-agreement');
      expect(agreement).to.exist;
      expect(agreement.getAttribute('name')).to.equal('privacy');
      expect(agreement.getAttribute('checked')).to.equal('true');
    });

    it('does not render a va-privacy-agreement when preSubmitInfo.required is false', () => {
      const PreSubmitInfoSelector = loadSelectorWithStubs({ enabled: false });
      const { container } = render(
        <PreSubmitInfoSelector
          formData={{}}
          preSubmitInfo={{ required: false, field: 'privacy', notice: null }}
          showError={false}
          onSectionComplete={() => {}}
        />,
      );
      expect(container.querySelector('va-privacy-agreement')).to.not.exist;
    });

    it('calls onSectionComplete with the new checked value when the agreement changes', () => {
      const PreSubmitInfoSelector = loadSelectorWithStubs({ enabled: false });
      const onSectionComplete = sinon.spy();
      const { container } = render(
        <PreSubmitInfoSelector
          formData={{}}
          preSubmitInfo={{ required: true, field: 'privacy', notice: null }}
          showError={false}
          onSectionComplete={onSectionComplete}
        />,
      );
      const agreement = container.querySelector('va-privacy-agreement');
      // The component handler reads event.target.checked; set the property on
      // the element itself so the dispatched event's target exposes it.
      agreement.checked = true;
      fireEvent(agreement, new CustomEvent('vaChange'));
      expect(onSectionComplete.calledOnce).to.be.true;
      expect(onSectionComplete.firstCall.args[0]).to.equal(true);
    });

    it('surfaces the preSubmitInfo.error message when showError is true and the box is unchecked', () => {
      const PreSubmitInfoSelector = loadSelectorWithStubs({ enabled: false });
      const { container } = render(
        <PreSubmitInfoSelector
          formData={{}}
          preSubmitInfo={{
            required: true,
            field: 'privacy',
            notice: null,
            error: 'You must accept',
          }}
          showError
          onSectionComplete={() => {}}
        />,
      );
      const agreement = container.querySelector('va-privacy-agreement');
      expect(agreement.getAttribute('show-error')).to.equal('You must accept');
    });

    it('falls back to the default error copy when preSubmitInfo.error is missing', () => {
      const PreSubmitInfoSelector = loadSelectorWithStubs({ enabled: false });
      const { container } = render(
        <PreSubmitInfoSelector
          formData={{}}
          preSubmitInfo={{ required: true, field: 'privacy', notice: null }}
          showError
          onSectionComplete={() => {}}
        />,
      );
      const agreement = container.querySelector('va-privacy-agreement');
      expect(agreement.getAttribute('show-error')).to.equal('Please accept');
    });

    it('does not surface an error when the box is already checked', () => {
      const PreSubmitInfoSelector = loadSelectorWithStubs({ enabled: false });
      const { container } = render(
        <PreSubmitInfoSelector
          formData={{ privacy: true }}
          preSubmitInfo={{
            required: true,
            field: 'privacy',
            notice: null,
            error: 'You must accept',
          }}
          showError
          onSectionComplete={() => {}}
        />,
      );
      const agreement = container.querySelector('va-privacy-agreement');
      expect(agreement.getAttribute('show-error')).to.be.null;
    });
  });
});
