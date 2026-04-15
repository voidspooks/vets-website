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
    urlV1:
      'filter[[disp_status][eq]]=Active,Active: Refill in Process,Active: Non-VA,Active: On Hold,Active: Parked,Active: Submitted',
    urlV2: 'filter[[disp_status][eq]]=Active',
  },
  {
    key: 'RENEWAL',
    label: 'Renewal needed before refill',
    urlV1: 'filter[[is_renewable][eq]]=true',
    urlV2: 'filter[[is_renewable][eq]]=true',
  },
  {
    key: 'INACTIVE',
    label: 'Inactive medications',
    urlV1: 'filter[[disp_status][eq]]=Discontinued,Expired,Transferred,Unknown',
    urlV2: 'filter[[disp_status][eq]]=Inactive',
  },
  {
    key: 'ALL_MEDICATIONS',
    label: 'All medications',
    urlV1: '',
    urlV2: '',
  },
];

export const FILTER_OPTIONS_MAP = Object.fromEntries(
  FILTER_OPTIONS.map(opt => [opt.key, opt]),
);

/**
 * Returns the correct filter URL for the given key.
 * Always uses V1 (VistA/MHV) status URLs for filtering.
 * @param {string} key - Filter option key
 * @returns {string} The filter URL query parameter string
 */
export const getFilterUrl = (key, _isCernerPilot, _isV2StatusMapping) => {
  const option = FILTER_OPTIONS_MAP[key];
  if (!option) return '';
  return option.urlV1;
};

const DEFAULT_FILTER = 'ALL_MEDICATIONS';

const MedicationListFilter = ({ updateFilter, isLoading }) => {
  const dispatch = useDispatch();
  const filterOption = useSelector(selectFilterOption);
  const [selectedFilterOption, setSelectedFilterOption] = useState(
    filterOption || DEFAULT_FILTER,
  );

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

  return (
    <div className="medication-list-filter vads-u-margin-top--3">
      <VaRadio
        label="Select medications to show in list"
        label-header-level={2}
        data-testid="medication-list-filter"
        onVaValueChange={handleFilterOptionChange}
        className="vads-u-margin-top--0"
        uswds
      >
        {FILTER_OPTIONS.map(({ key, label }) => (
          <span
            key={`filter-option-${key}`}
            className={
              selectedFilterOption === key ? 'filter-option--selected' : ''
            }
          >
            <VaRadioOption
              label={label}
              name="medication-list-filter-group"
              value={key}
              checked={selectedFilterOption === key}
              data-testid={`medication-list-filter-option-${key}`}
            />
          </span>
        ))}
      </VaRadio>
      <VaButton
        className="vads-u-margin-top--2"
        onClick={handleFilterSubmit}
        text="Update list"
        data-testid="update-list-button"
        loading={isLoading}
      />
    </div>
  );
};

MedicationListFilter.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  updateFilter: PropTypes.func.isRequired,
};

export default MedicationListFilter;
