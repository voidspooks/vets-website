import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { setData } from '@department-of-veterans-affairs/platform-forms-system/actions';
import { focusElement } from '@department-of-veterans-affairs/platform-utilities/ui';

import { validateAddress } from '../../utils/api';
import { formatAddress } from '../../utils/helpers';

const getAddressString = address => {
  return JSON.stringify({
    city: address.city,
    country: address.countryCodeIso3,
    postalCode: address.zipCode,
    state: address.stateCode,
    province: address.stateProvince?.code || '',
    street: address.addressLine1,
    street2: address.addressLine2 || '',
  });
};

const AddressValidationRadio = props => {
  const { formData, setFormData } = props;

  const [apiData, setApiData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedAddress, setSelectedAddress] = useState('');

  const handleValueChange = (address, id) => {
    setSelectedAddress(id);

    setFormData({
      ...formData,
      addressValidation: getAddressString(address),
    });
  };

  useEffect(() => {
    setLoading(true);
    validateAddress(formData.address)
      .then(res => {
        setApiData(res.addresses);
      })
      .catch(() => {
        handleValueChange(formData.address, 'userEntered');
      })
      .finally(() => {
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(
    () => {
      if (apiData.length > 0) {
        handleValueChange(apiData[0].address, '0');
        focusElement('h2');
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [apiData],
  );

  const renderAddressOption = (address, id = 'userEntered') => {
    const hasConfirmedSuggestions = apiData.length > 0;
    const { addressStreet, cityStateZip, addressCountry } = formatAddress(
      address,
    );

    return (
      <div key={id} className="vads-u-margin-bottom--1p5">
        {hasConfirmedSuggestions && (
          <input
            id={id}
            checked={selectedAddress === id}
            onChange={() => {
              handleValueChange(address, id);
            }}
            type="radio"
          />
        )}
        <label
          htmlFor={id}
          className="vads-u-margin-top--2 vads-u-display--flex vads-u-align-items--center"
        >
          <span
            className="dd-privacy-hidden"
            data-dd-action-name="street address"
          >
            {addressStreet}
          </span>
          <span
            className="dd-privacy-hidden vads-u-margin-left--0p5"
            data-dd-action-name="city, state and zip code"
          >
            {cityStateZip}
          </span>
          <span>{addressCountry}</span>
        </label>
      </div>
    );
  };

  // render loading indicator while we fetch
  if (loading) {
    return (
      <va-loading-indicator label="Loading" message="Loading..." set-focus />
    );
  }

  const deliveryPointValidation =
    apiData &&
    apiData.length > 0 &&
    apiData[0].addressMetaData.deliveryPointValidation;

  const shouldShowSuggestions =
    apiData && apiData.length > 0 && deliveryPointValidation === 'CONFIRMED';

  const noRecommendationsAvailable =
    apiData && apiData.length > 0 && deliveryPointValidation !== 'CONFIRMED';

  return (
    <>
      <va-alert
        className="vads-u-margin-y--2 vads-u-padding-bottom--1"
        status="warning"
        role="alert"
        visible={shouldShowSuggestions || noRecommendationsAvailable}
      >
        <h4
          id="address-validation-alert-heading"
          slot="headline"
          className="vads-u-font-size--h3"
        >
          {shouldShowSuggestions
            ? `We can’t confirm the address you entered with the U.S. Postal
            Service`
            : `Confirm your address`}
        </h4>
        <p className="vads-u-margin-y--0">
          {shouldShowSuggestions
            ? 'Tell us which address you’d like to use.'
            : "We can't confirm the address you entered with the U.S. Postal Service. Confirm that you want us to use this address as you entered it. Or go back and edit it."}
        </p>
      </va-alert>
      <div>
        <span className="vads-u-font-weight--bold">You entered</span>
        {renderAddressOption(formData.address)}
        {shouldShowSuggestions && (
          <span className="vads-u-font-weight--bold">
            Suggested {apiData.length > 1 ? 'addresses' : 'address'}
          </span>
        )}
        {shouldShowSuggestions &&
          apiData.map((item, index) =>
            renderAddressOption(item.address, String(index)),
          )}
      </div>
    </>
  );
};

AddressValidationRadio.propTypes = {
  formData: PropTypes.object,
  setFormData: PropTypes.func,
};

const mapStateToProps = state => ({
  formData: state.form?.data || {},
});

const mapDispatchToProps = {
  setFormData: setData,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(AddressValidationRadio);
