import React from 'react';
import { findDOMNode } from 'react-dom';
import { expect } from 'chai';
import ReactTestUtils from 'react-dom/test-utils';

import { DefinitionTester } from 'platform/testing/unit/schemaform-utils.jsx';
import definitions from 'vets-json-schema/dist/definitions.json';
import uiSchema from '../../components/PreparerPhone';

describe('Preneed PreparerPhone', () => {
  it('should render phone with default title', () => {
    const phoneUiSchema = uiSchema();
    const form = ReactTestUtils.renderIntoDocument(
      <DefinitionTester schema={definitions.phone} uiSchema={phoneUiSchema} />,
    );

    const formDOM = findDOMNode(form);

    expect(formDOM.querySelector('label').textContent).to.equal('Phone');
  });

  it('should render phone with custom title', () => {
    const form = ReactTestUtils.renderIntoDocument(
      <DefinitionTester
        schema={definitions.phone}
        uiSchema={uiSchema('Contact phone')}
      />,
    );

    const formDOM = findDOMNode(form);

    expect(formDOM.querySelector('label').textContent).to.equal(
      'Contact phone',
    );
  });

  it('should have correct autocomplete attribute', () => {
    const phoneUiSchema = uiSchema();
    const form = ReactTestUtils.renderIntoDocument(
      <DefinitionTester schema={definitions.phone} uiSchema={phoneUiSchema} />,
    );

    const formDOM = findDOMNode(form);
    const input = formDOM.querySelector('input');

    expect(input.autocomplete).to.equal('tel');
  });

  it('should have correct error messages', () => {
    const phoneUiSchema = uiSchema();

    expect(phoneUiSchema['ui:errorMessages'].pattern).to.equal(
      'Phone number should be between 10-15 digits long',
    );
    expect(phoneUiSchema['ui:errorMessages'].minLength).to.equal(
      'Phone number should be between 10-15 digits long',
    );
    expect(phoneUiSchema['ui:errorMessages'].required).to.equal(
      'Please enter a phone number',
    );
  });

  it('should have phone widget class', () => {
    const phoneUiSchema = uiSchema();

    expect(phoneUiSchema['ui:options'].widgetClassNames).to.equal('phone');
  });
});
