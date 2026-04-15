import React from 'react';
import PropTypes from 'prop-types';
import { VaRadio } from '@department-of-veterans-affairs/component-library/dist/react-bindings';

export default function TypeOfCareRadioWidget({
  id,
  options,
  value,
  onChange,
}) {
  const { enumOptions } = options;

  return (
    <VaRadio
      onVaValueChange={event => {
        if (event.detail.value) {
          onChange(event.detail.value);
        }
      }}
      id="typeOfCareRadioWidget"
      data-testid="typeOfCareRadio"
      label-header-level=""
      class="vads-u-margin-top--neg2"
    >
      {enumOptions.map((option, i) => {
        const checked = option.value === value;
        const position = i + 1;

        return (
          <va-radio-option
            key={option.value}
            name={id}
            value={option.value}
            label={option.label}
            checked={checked}
            data-testid={`type-of-care-radio-${position}`}
            uswds
          />
        );
      })}
    </VaRadio>
  );
}

TypeOfCareRadioWidget.propTypes = {
  id: PropTypes.string,
  options: PropTypes.object,
  value: PropTypes.string,
  onChange: PropTypes.func,
};
