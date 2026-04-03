import React from 'react';
import { VaTelephoneInput } from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import vaTelephoneInputFieldMapping from 'platform/forms-system/src/js/web-component-fields/vaTelephoneInputFieldMapping';

/**
 * Wrapper around the default telephone input field so we can disable the
 * component's internal validation messages. This lets the form system decide
 * when to surface errors (e.g. only after an invalid entry).
 */
export default function TelephoneFieldNoInternalErrors(props) {
  const mappedProps = vaTelephoneInputFieldMapping(props);

  const onVaContact = (event, value) => {
    const payload = value || event?.detail || {};

    mappedProps.onVaContact(event, {
      ...payload,
      contactRaw: payload.contactRaw ?? payload.contact,
    });
  };

  return (
    <VaTelephoneInput
      {...mappedProps}
      onVaContact={onVaContact}
      showInternalErrors={false}
    />
  );
}
