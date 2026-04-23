import React from 'react';
import { expect } from 'chai';
import { render } from '@testing-library/react';
import { DefinitionTester } from 'platform/testing/unit/schemaform-utils';
import page from '../../pages/acknowledgement4';

const renderPage = (formData = {}) =>
  render(
    <DefinitionTester
      schema={page.schema}
      uiSchema={page.uiSchema}
      data={formData}
      definitions={{}}
    />,
  );

describe('22-0976 acknowledgement 4 page', () => {
  it('renders page title', () => {
    const { container } = renderPage();
    expect(container.textContent).to.contain(
      'Institution Acknowledgements (4 of 5)',
    );
  });

  it('renders the input field', () => {
    const { container } = renderPage();

    expect(container.querySelector('va-radio')).to.exist;
  });
});
