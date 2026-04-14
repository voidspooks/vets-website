import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Downshift from 'downshift';
import classNames from 'classnames';
import { get } from 'lodash';
import MessagePromptDiv from './MessagePromptDiv';
import { MIN_SEARCH_CHARS, SR_ANNOUNCE_DELAY_MS } from '../../../constants';

/**
 * CC Providers' Service Types Typeahead
 */
class CCServiceTypeAhead extends Component {
  constructor(props) {
    super(props);
    this.state = {
      services: [],
      isFocused: false,
      statusMessage: '',
    };
    this.statusTimer = null;
  }

  componentDidMount() {
    this.getServices();
  }

  componentWillUnmount() {
    if (this.statusTimer) {
      clearTimeout(this.statusTimer);
    }
  }

  componentDidUpdate(prevProps) {
    if (
      !this.props.useProgressiveDisclosure &&
      !prevProps.currentQuery?.specialties &&
      this.state.services.length === 0
    ) {
      this.getServices();
    }
  }

  getServices = async () => {
    const {
      currentQuery,
      getProviderSpecialties,
      initialSelectedServiceType,
      useProgressiveDisclosure,
    } = this.props;
    if (!useProgressiveDisclosure) {
      // Remove all of this if after progressive disclosure flipper is removed
      const values = await getProviderSpecialties();
      this.setState({
        services: typeof values?.[0] === 'string' ? [] : values,
        defaultSelectedItem:
          initialSelectedServiceType &&
          currentQuery?.fetchSvcsRawData?.find(
            ({ specialtyCode }) => specialtyCode === initialSelectedServiceType,
          ),
      });
      return;
    }
    this.setState({
      services: currentQuery?.fetchSvcsRawData || [],
      defaultSelectedItem:
        initialSelectedServiceType &&
        currentQuery?.fetchSvcsRawData?.find(
          ({ specialtyCode }) => specialtyCode === initialSelectedServiceType,
        ),
    });
  };

  handleOnSelect = selectedItem => {
    if (this.statusTimer) {
      clearTimeout(this.statusTimer);
    }
    this.setState({ statusMessage: '' });

    const value = selectedItem ? selectedItem.specialtyCode.trim() : null;
    this.props.handleServiceTypeChange({
      target: { value },
      selectedItem,
    });
  };

  optionClasses = selected => classNames('dropdown-option ', { selected });

  getSpecialtyName = specialty => {
    if (!specialty) return '';

    return specialty.name;
  };

  shouldShow = (input, specialty) => {
    if (!specialty) {
      return false;
    }
    const specialtyName = this.getSpecialtyName(specialty);
    if (input.length >= MIN_SEARCH_CHARS && specialtyName) {
      return specialtyName
        .trim()
        .toLowerCase()
        .includes(input.toLowerCase());
    }
    return false;
  };

  matchingServices = inputValue => {
    if (inputValue && this.state.services?.length) {
      return this.state.services.filter(specialty =>
        this.shouldShow(inputValue, specialty),
      );
    }
    return [];
  };

  updateStatusMessage = (matches, inputValue, isExpanded) => {
    if (this.statusTimer) {
      clearTimeout(this.statusTimer);
    }

    if (!isExpanded || !inputValue) {
      this.setState({ statusMessage: '' });
      return;
    }

    if (matches && matches.length > 0) {
      this.statusTimer = setTimeout(() => {
        this.setState({
          statusMessage: `${matches.length} result${
            matches.length === 1 ? '' : 's'
          } for ${inputValue}`,
        });
      }, SR_ANNOUNCE_DELAY_MS);
    } else {
      this.setState({ statusMessage: 'No results available.' });
    }
  };

  renderSearchForAvailableServicePrompt = inputValue => {
    const { isFocused } = this.state;
    const { showError } = this.props;
    if (
      ((isFocused && inputValue === '' && !showError) ||
        (inputValue && inputValue.length < MIN_SEARCH_CHARS)) &&
      !this.props.useProgressiveDisclosure
    ) {
      return (
        <MessagePromptDiv
          message="Search for an available service"
          id="search-available-service-prompt"
        />
      );
    }
    return null;
  };

  renderServiceTypeDropdownOptions = (
    getItemProps,
    highlightedIndex,
    matches,
    selectedServiceCode,
  ) => {
    return (
      <ul
        id="service-typeahead-listbox"
        className={`dropdown${
          this.props.useProgressiveDisclosure && this.props.isSmallDesktop
            ? ' drowpdown-fl-sm-desktop'
            : ''
        }`}
        role="listbox"
      >
        {matches.map((specialty, index) => (
          <li
            key={`${this.getSpecialtyName(specialty)}-${index}`}
            {...getItemProps({
              item: specialty,
              className: this.optionClasses(index === highlightedIndex),
              role: 'option',
              'aria-selected': specialty.specialtyCode === selectedServiceCode,
            })}
          >
            {this.getSpecialtyName(specialty)}
          </li>
        ))}
      </ul>
    );
  };

  renderTryAnotherServicePrompt = (inputValue, matches) => {
    if (
      inputValue &&
      inputValue.length >= MIN_SEARCH_CHARS &&
      matches &&
      matches.length === 0
    ) {
      return (
        <MessagePromptDiv
          message="We couldn't find that, please try another service"
          id="could-not-find-service-prompt"
          waitBeforeShow={2000}
        />
      );
    }
    return null;
  };

  render() {
    const { defaultSelectedItem, services } = this.state;
    if (!services) {
      return null;
    }
    const { showError, currentQuery, handleServiceTypeChange } = this.props;
    return (
      <Downshift
        onChange={this.handleOnSelect}
        selectedItem={!window.Cypress ? defaultSelectedItem : undefined}
        defaultSelectedItem={window.Cypress ? defaultSelectedItem : undefined}
        defaultInputValue=""
        itemToString={this.getSpecialtyName}
        onInputValueChange={inputValue => {
          const isExpanded =
            inputValue && inputValue.length >= MIN_SEARCH_CHARS;
          const matches = this.matchingServices(inputValue);
          this.updateStatusMessage(matches, inputValue, isExpanded);

          if (
            currentQuery.serviceType &&
            currentQuery.specialties &&
            inputValue !== currentQuery.specialties[currentQuery.serviceType]
          ) {
            handleServiceTypeChange({
              target: { value: '' },
              selectedItem: null,
            });
          }
        }}
      >
        {({
          getInputProps,
          getItemProps,
          getLabelProps,
          openMenu,
          isOpen,
          inputValue,
          highlightedIndex,
        }) => {
          const selectedServiceCode = get(
            this.props,
            'initialSelectedServiceType',
            null,
          );
          const showExpanded =
            isOpen && inputValue && MIN_SEARCH_CHARS <= inputValue.length;
          const matches = this.matchingServices(inputValue);
          return (
            <div
              id="service-error"
              className={classNames('vads-u-margin--0', {
                'usa-input-error': showError,
              })}
            >
              <label {...getLabelProps()} htmlFor="service-type-ahead-input">
                Select a provider type{' '}
                <span className="form-required-span">(*Required)</span>
              </label>
              {this.props.useProgressiveDisclosure && (
                <p className="service-hint-text">
                  Start typing to search for a service, like Chiropractor or
                  Optometrist.
                </p>
              )}
              {showError && (
                <span className="usa-input-error-message" role="alert">
                  <span id="error-message">
                    <span className="sr-only">Error</span>
                    Start typing and select a service type
                  </span>
                </span>
              )}
              <span id="service-typeahead">
                <input
                  role="combobox"
                  {...getInputProps({
                    placeholder: this.props.useProgressiveDisclosure
                      ? undefined
                      : 'like Chiropractor or Optometrist',

                    onFocus: () => {
                      this.setState({ isFocused: true });
                      if (inputValue && inputValue.length >= MIN_SEARCH_CHARS) {
                        openMenu();
                      }
                    },
                    disabled: currentQuery?.fetchSvcsInProgress,
                  })}
                  onBlur={() => {
                    this.setState({ isFocused: false });
                  }}
                  id="service-type-ahead-input"
                  aria-describedby="could-not-find-service-prompt error-message"
                  aria-expanded={showExpanded ? 'true' : 'false'}
                  aria-controls="service-typeahead-listbox"
                />

                {this.renderSearchForAvailableServicePrompt(inputValue)}
                {showExpanded &&
                  this.renderServiceTypeDropdownOptions(
                    getItemProps,
                    highlightedIndex,
                    matches,
                    selectedServiceCode,
                  )}
                {this.renderTryAnotherServicePrompt(inputValue, matches)}
              </span>
              <div className="usa-combo-box__status usa-sr-only" role="status">
                {this.state.statusMessage}
              </div>
            </div>
          );
        }}
      </Downshift>
    );
  }
}

CCServiceTypeAhead.propTypes = {
  getProviderSpecialties: PropTypes.func.isRequired,
  handleServiceTypeChange: PropTypes.func.isRequired,
  currentQuery: PropTypes.object,
  initialSelectedServiceType: PropTypes.string,
  isSmallDesktop: PropTypes.bool,
  showError: PropTypes.bool,
  useProgressiveDisclosure: PropTypes.bool,
  onBlur: PropTypes.func,
};

const mapDispatch = {};

const mapStateToProps = state => {
  return {
    currentQuery: state.searchQuery,
  };
};

export default connect(
  mapStateToProps,
  mapDispatch,
)(CCServiceTypeAhead);
