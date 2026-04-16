import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import {
  VaRadio,
  VaRadioOption,
  VaButton,
} from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import { waitForRenderThenFocus } from '@department-of-veterans-affairs/platform-utilities/ui';
import { selectFilterOption } from '../../selectors/selectPreferences';
import { setFilterOption } from '../../redux/preferencesSlice';

export const FILTER_OPTIONS = [
  {
    key: 'ACTIVE',
    label: 'Active medications',
    countKey: 'active',
    urlV1:
      'filter[[disp_status][eq]]=Active,Active: Refill in Process,Active: Non-VA,Active: On Hold,Active: Parked,Active: Submitted',
    urlV2: 'filter[[disp_status][eq]]=Active',
  },
  {
    key: 'RENEWAL',
    label: 'Renewal needed before refill',
    countKey: 'renewal',
    urlV1: 'filter[[is_renewable][eq]]=true',
    urlV2: 'filter[[is_renewable][eq]]=true',
  },
  {
    key: 'INACTIVE',
    label: 'Inactive medications',
    countKey: 'nonActive',
    urlV1: 'filter[[disp_status][eq]]=Discontinued,Expired,Transferred,Unknown',
    urlV2: 'filter[[disp_status][eq]]=Inactive',
  },
  {
    key: 'ALL_MEDICATIONS',
    label: 'All medications',
    countKey: 'allMedications',
    urlV1: '',
    urlV2: '',
  },
];

export const FILTER_OPTIONS_MAP = Object.fromEntries(
  FILTER_OPTIONS.map(opt => [opt.key, opt]),
);

/**
 * Returns the V1 (VistA/MHV) filter URL for the given key.
 * Always uses V1 status URLs for filtering on the Medication History page,
 * regardless of Cerner pilot or V2 status mapping feature flags.
 * @param {string} key - Filter option key
 * @returns {string} The filter URL query parameter string
 */
export const getFilterUrl = key => {
  const option = FILTER_OPTIONS_MAP[key];
  if (!option) return '';
  return option.urlV1;
};

const DEFAULT_FILTER = 'ACTIVE';

const MedicationListFilter = ({ updateFilter, isLoading, filterCount }) => {
  const dispatch = useDispatch();
  const filterOption = useSelector(selectFilterOption);
  const [selectedFilterOption, setSelectedFilterOption] = useState(
    filterOption || DEFAULT_FILTER,
  );
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);

  // Sync local state when Redux filter changes (e.g., default override)
  useEffect(
    () => {
      if (filterOption) {
        setSelectedFilterOption(filterOption);
      }
    },
    [filterOption],
  );

  const handleFilterOptionChange = ({ detail }) => {
    setSelectedFilterOption(detail.value);
  };

  const handleFilterSubmit = () => {
    dispatch(setFilterOption(selectedFilterOption));
    updateFilter(selectedFilterOption);
    waitForRenderThenFocus('#showingRx', document, 500);
  };

  const handleFilterReset = () => {
    const defaultFilter = DEFAULT_FILTER;
    setSelectedFilterOption(defaultFilter);
    dispatch(setFilterOption(defaultFilter));
    updateFilter(defaultFilter);
    waitForRenderThenFocus('#showingRx', document, 500);
  };

  const getFilterLabel = (label, countKey) => {
    if (filterCount && filterCount[countKey] != null) {
      return `${label} (${filterCount[countKey]})`;
    }
    return label;
  };

  return (
    <div className="medication-list-filter-panel">
      <h2 className="vads-u-margin-top--0 filter-panel-heading">Filter</h2>
      <div className="filter-accordion-container">
        {/* eslint-disable-next-line @department-of-veterans-affairs/prefer-button-component */}
        <button
          type="button"
          className="filter-accordion-toggle"
          aria-expanded={isAccordionOpen}
          aria-controls="filter-medications-content"
          onClick={() => setIsAccordionOpen(!isAccordionOpen)}
          data-testid="filter-accordion-toggle"
        >
          <va-icon
            icon="filter_list"
            size={3}
            aria-hidden="true"
            class="vads-u-margin-right--1"
          />
          <span className="filter-accordion-header-text">
            Filter medications
          </span>
          <va-icon
            icon={isAccordionOpen ? 'remove' : 'add'}
            size={3}
            aria-hidden="true"
            class="vads-u-margin-left--auto"
          />
        </button>
        {isAccordionOpen && (
          <div
            id="filter-medications-content"
            className="filter-accordion-content"
            data-testid="filter-medications-content"
          >
            <VaRadio
              label="Select medications to show in list"
              data-testid="medication-list-filter"
              onVaValueChange={handleFilterOptionChange}
              className="vads-u-margin-top--0"
              uswds
            >
              {FILTER_OPTIONS.map(({ key, label, countKey }) => (
                <VaRadioOption
                  key={`filter-option-${key}`}
                  label={getFilterLabel(label, countKey)}
                  name="medication-list-filter-group"
                  value={key}
                  checked={selectedFilterOption === key}
                  data-testid={`medication-list-filter-option-${key}`}
                />
              ))}
            </VaRadio>
            <div className="filter-buttons vads-u-margin-top--2">
              <VaButton
                onClick={handleFilterSubmit}
                text="Apply"
                data-testid="filter-apply-button"
                loading={isLoading}
              />
              <VaButton
                secondary
                onClick={handleFilterReset}
                text="Reset"
                data-testid="filter-reset-button"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

MedicationListFilter.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  updateFilter: PropTypes.func.isRequired,
  filterCount: PropTypes.object,
};

export default MedicationListFilter;
