import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { shallowEqual, useSelector } from 'react-redux';
import {
  VaButton,
  VaRadio,
  VaSelect,
} from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import { selectFacilitiesRadioWidget } from '../../redux/selectors';
import { stateNames } from '../../../components/State';
import InfoAlert from '../../../components/InfoAlert';
import { FACILITY_SORT_METHODS, FETCH_STATUS } from '../../../utils/constants';
import { scrollAndFocus } from '../../../utils/scrollAndFocus';
import NoAddressNote from '../NoAddressNote';

const INITIAL_FACILITY_DISPLAY_COUNT = 5;

export default function FacilitiesRadioWidget({
  id,
  options,
  value,
  onChange,
  formContext,
}) {
  const { requestLocationStatus, sortMethod, loadingEligibility } = useSelector(
    state => selectFacilitiesRadioWidget(state),
    shallowEqual,
  );

  const { hasUserAddress, sortOptions, updateFacilitySortMethod } = formContext;
  const { enumOptions } = options;
  const selectedIndex = enumOptions.findIndex(o => o.value === value);
  const sortedByText = sortMethod
    ? sortOptions.find(type => type.value === sortMethod).label
    : sortOptions[0].label;
  const requestingLocationFailed =
    sortMethod === 'distanceFromCurrentLocation' &&
    requestLocationStatus === FETCH_STATUS.failed;

  // If user has already selected a value, and the index of that value is > 4,
  // show this view already expanded
  const [displayAll, setDisplayAll] = useState(
    selectedIndex >= INITIAL_FACILITY_DISPLAY_COUNT,
  );

  // currently shown facility list
  const displayedOptions = displayAll
    ? enumOptions
    : enumOptions.slice(0, INITIAL_FACILITY_DISPLAY_COUNT);
  // remaining facilities count
  const hiddenCount =
    enumOptions.length > INITIAL_FACILITY_DISPLAY_COUNT
      ? enumOptions.length - INITIAL_FACILITY_DISPLAY_COUNT
      : 0;

  // format options for new component
  const selectOptions = sortOptions.map((s, i) => {
    return (
      <option key={i} value={s.value}>
        {s.label}
      </option>
    );
  });

  useEffect(
    () => {
      if (displayedOptions.length > INITIAL_FACILITY_DISPLAY_COUNT) {
        scrollAndFocus(
          `[data-testid="facility-radio-${INITIAL_FACILITY_DISPLAY_COUNT +
            1}"]`,
        );
      }
    },
    [displayedOptions.length, displayAll],
  );

  /**
   * Format the description text for a facility radio option.
   * "City, ST" with optional "X miles" on next line.
   */
  const formatFacilityDescription = (address, distance) => {
    const city = address?.city || '';
    const state = address?.state || '';
    const location = city && state ? `${city}, ${state}` : city || state;

    if (location && distance) {
      return `${location}\n${distance} miles`;
    }
    if (distance) {
      return `${distance} miles`;
    }
    return location;
  };

  /**
   * Format the aria-label for a facility radio option.
   * Uses full state name for screen reader accessibility (matching State component behavior).
   */
  const formatFacilityAriaLabel = (facilityName, address, distance) => {
    const city = address?.city || '';
    const stateAbbrev = address?.state || '';
    const fullStateName = stateNames[stateAbbrev] || stateAbbrev;
    const location =
      city && fullStateName
        ? `${city}, ${fullStateName}`
        : city || fullStateName;
    const distanceText = distance ? `${distance} miles` : '';

    const parts = [facilityName, location, distanceText].filter(Boolean);
    return parts.join('. ');
  };

  return (
    <div className="vads-u-margin-top--3">
      <div aria-live="assertive" className="sr-only">
        Showing VA facilities sorted {sortedByText}
      </div>
      <>
        <div className="vads-u-margin-bottom--3">
          <VaSelect
            label="Sort facilities"
            name="sort"
            onVaSelect={type => {
              updateFacilitySortMethod(type.detail.value);
            }}
            value={sortMethod}
            data-testid="facilitiesSelect"
            uswds
          >
            {hasUserAddress ? selectOptions : selectOptions.slice(1)}
          </VaSelect>
        </div>
        {!hasUserAddress && <NoAddressNote optionType="facilities" />}
        {requestingLocationFailed && (
          <div className="vads-u-padding-top--1">
            <InfoAlert
              status="warning"
              headline="Your browser is blocked from finding your current location."
              className="vads-u-background-color--gold-lightest"
              level="3"
            >
              <p>Make sure your browser’s location feature is turned on.</p>
              <VaButton
                text="Retry searching based on current location"
                onClick={() =>
                  updateFacilitySortMethod(
                    FACILITY_SORT_METHODS.distanceFromCurrentLocation,
                  )
                }
                uswds
              />
            </InfoAlert>
          </div>
        )}
      </>

      {!requestingLocationFailed && (
        <VaRadio
          label={options.label}
          hint={options.hint}
          onVaValueChange={event => {
            if (event.detail.value) {
              onChange(event.detail.value);
            }
          }}
          id="facilitiesRadioWidget"
          data-testid="facilitiesRadio"
        >
          {displayedOptions.map((option, i) => {
            const { name, address, legacyVAR } = option?.label;
            const checked = option.value === value;
            let distance;

            if (sortMethod === FACILITY_SORT_METHODS.distanceFromResidential) {
              distance = legacyVAR?.distanceFromResidentialAddress;
            } else if (
              sortMethod === FACILITY_SORT_METHODS.distanceFromCurrentLocation
            ) {
              distance = legacyVAR?.distanceFromCurrentLocation;
            } else {
              distance = legacyVAR?.distanceFromResidentialAddress;
            }
            const facilityPosition = i + 1;

            return (
              <va-radio-option
                key={option.value}
                name={id}
                value={option.value}
                label={name}
                description={formatFacilityDescription(address, distance)}
                aria-label={formatFacilityAriaLabel(name, address, distance)}
                checked={checked}
                disabled={loadingEligibility}
                tile
                data-testid={`facility-radio-${facilityPosition}`}
                style={{ whiteSpace: 'pre-line' }} // this allows for City, State Distance to display on two lines
                uswds
              />
            );
          })}
        </VaRadio>
      )}
      {!displayAll &&
        !requestingLocationFailed &&
        hiddenCount > 0 && (
          <va-button
            secondary
            text={`Show ${hiddenCount} more location${
              hiddenCount === 1 ? '' : 's'
            }`}
            className="additional-info-button usa-button-secondary vads-u-display--block"
            onClick={() => {
              setDisplayAll(!displayAll);
            }}
            data-testid="show-more-locations"
          />
        )}
    </div>
  );
}
FacilitiesRadioWidget.propTypes = {
  formContext: PropTypes.object,
  id: PropTypes.string,
  options: PropTypes.object,
  value: PropTypes.string,
  onChange: PropTypes.func,
};
