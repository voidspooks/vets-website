import { expect } from 'chai';
import sinon from 'sinon';
import React from 'react';
import { cleanup, fireEvent } from '@testing-library/react';
import { renderWithStoreAndRouterV6 } from '@department-of-veterans-affairs/platform-testing/react-testing-library-helpers';
import MedicationListFilter, {
  FILTER_OPTIONS,
} from '../../../components/MedicationList/MedicationListFilter';
import reducers from '../../../reducers';

describe('MedicationListFilter component', () => {
  let updateFilterSpy;

  const defaultInitialState = {
    rx: {
      preferences: {
        filterOption: 'ACTIVE',
        sortOption: 'alphabeticallyByStatus',
      },
    },
    featureToggles: {
      loading: false,
      // eslint-disable-next-line camelcase
      mhv_medications_cerner_pilot: false,
      // eslint-disable-next-line camelcase
      mhv_medications_v2_status_mapping: false,
    },
  };

  const mockFilterCount = {
    active: 10,
    renewal: 1,
    inactive: 24,
    allMedications: 38,
  };

  const setup = ({
    isLoading = false,
    initialState = defaultInitialState,
    filterCount = null,
  } = {}) => {
    updateFilterSpy = sinon.spy();

    return renderWithStoreAndRouterV6(
      <MedicationListFilter
        updateFilter={updateFilterSpy}
        isLoading={isLoading}
        filterCount={filterCount}
      />,
      {
        initialState,
        reducers,
      },
    );
  };

  afterEach(() => {
    cleanup();
  });

  it('renders without errors', () => {
    const screen = setup();
    expect(screen).to.exist;
  });

  it('renders the Filter heading', () => {
    const screen = setup();
    expect(screen.getByText('Filter')).to.exist;
  });

  it('renders the filter accordion toggle', () => {
    const screen = setup();
    const toggle = screen.getByTestId('filter-accordion-toggle');
    expect(toggle).to.exist;
  });

  it('renders the filter radio group with correct label', () => {
    const screen = setup();
    const radioGroup = screen.getByTestId('medication-list-filter');
    expect(radioGroup).to.exist;
    expect(radioGroup.getAttribute('label')).to.equal(
      'Select medications to show in list',
    );
  });

  it('renders all filter options', () => {
    const screen = setup();
    FILTER_OPTIONS.forEach(({ key }) => {
      expect(screen.getByTestId(`medication-list-filter-option-${key}`)).to
        .exist;
    });
  });

  it('renders filter option labels with counts when filterCount is provided', () => {
    const screen = setup({ filterCount: mockFilterCount });
    const activeOption = screen.getByTestId(
      'medication-list-filter-option-ACTIVE',
    );
    expect(activeOption.getAttribute('label')).to.equal(
      'Active medications (10)',
    );
    const allOption = screen.getByTestId(
      'medication-list-filter-option-ALL_MEDICATIONS',
    );
    expect(allOption.getAttribute('label')).to.equal('All medications (38)');
  });

  it('renders filter option labels without counts when filterCount is null', () => {
    const screen = setup();
    const activeOption = screen.getByTestId(
      'medication-list-filter-option-ACTIVE',
    );
    expect(activeOption.getAttribute('label')).to.equal('Active medications');
  });

  it('has ACTIVE checked by default', () => {
    const screen = setup();
    const activeOption = screen.getByTestId(
      'medication-list-filter-option-ACTIVE',
    );
    expect(activeOption.getAttribute('checked')).to.equal('true');
  });

  it('renders the Apply button', () => {
    const screen = setup();
    const button = screen.getByTestId('filter-apply-button');
    expect(button).to.exist;
    expect(button.getAttribute('text')).to.equal('Apply');
  });

  it('renders the Reset button', () => {
    const screen = setup();
    const button = screen.getByTestId('filter-reset-button');
    expect(button).to.exist;
    expect(button.getAttribute('text')).to.equal('Reset');
  });

  it('shows loading state on the Apply button when isLoading is true', () => {
    const screen = setup({ isLoading: true });
    const button = screen.getByTestId('filter-apply-button');
    expect(button.getAttribute('loading')).to.equal('true');
  });

  it('does not show loading state on the Apply button when isLoading is false', () => {
    const screen = setup({ isLoading: false });
    const button = screen.getByTestId('filter-apply-button');
    expect(button.getAttribute('loading')).to.not.equal('true');
  });

  it('calls updateFilter when Apply button is clicked', () => {
    const screen = setup();
    const button = screen.getByTestId('filter-apply-button');
    fireEvent.click(button);
    expect(updateFilterSpy.calledOnce).to.be.true;
  });

  it('passes the selected filter option to updateFilter on submit', () => {
    const screen = setup();
    const button = screen.getByTestId('filter-apply-button');
    fireEvent.click(button);
    expect(updateFilterSpy.calledWith('ACTIVE')).to.be.true;
  });

  it('resets filter to ACTIVE when Reset button is clicked', () => {
    const screen = setup();
    // Select a different filter
    const radioGroup = screen.getByTestId('medication-list-filter');
    radioGroup.__events.vaValueChange({
      detail: { value: 'ALL_MEDICATIONS' },
    });

    // Click Reset
    const resetButton = screen.getByTestId('filter-reset-button');
    fireEvent.click(resetButton);
    expect(updateFilterSpy.calledWith('ACTIVE')).to.be.true;
  });

  it('updates internal state when a radio option changes', () => {
    const screen = setup();
    // Simulate the web component's vaValueChange event on the parent radio group
    const radioGroup = screen.getByTestId('medication-list-filter');
    radioGroup.__events.vaValueChange({ detail: { value: 'INACTIVE' } });

    // Click Apply to verify the new value is passed
    const button = screen.getByTestId('filter-apply-button');
    fireEvent.click(button);
    expect(updateFilterSpy.calledWith('INACTIVE')).to.be.true;
  });

  it('renders exactly 4 filter options', () => {
    const screen = setup();
    expect(FILTER_OPTIONS).to.have.lengthOf(4);
    expect(screen.getByTestId('medication-list-filter-option-ACTIVE')).to.exist;
    expect(screen.getByTestId('medication-list-filter-option-RENEWAL')).to
      .exist;
    expect(screen.getByTestId('medication-list-filter-option-INACTIVE')).to
      .exist;
    expect(screen.getByTestId('medication-list-filter-option-ALL_MEDICATIONS'))
      .to.exist;
  });

  it('toggles the accordion content when toggle button is clicked', () => {
    const screen = setup();
    // Content should be visible initially
    expect(screen.getByTestId('filter-medications-content')).to.exist;

    // Click toggle to collapse
    const toggle = screen.getByTestId('filter-accordion-toggle');
    fireEvent.click(toggle);

    // Content should be hidden
    expect(screen.queryByTestId('filter-medications-content')).to.be.null;

    // Click toggle again to expand
    fireEvent.click(toggle);
    expect(screen.getByTestId('filter-medications-content')).to.exist;
  });
});
