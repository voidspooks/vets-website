import { render, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { expect } from 'chai';
import React from 'react';
import createCommonStore from '@department-of-veterans-affairs/platform-startup/store';
import {
  DefinitionTester,
  getFormDOM,
} from 'platform/testing/unit/schemaform-utils';
import { $, $$ } from 'platform/forms-system/src/js/utilities/ui';
import formConfig from '../../../../config/form';

const defaultStore = createCommonStore();

const formData = {
  'view:selectable686Options': {
    addChild: true,
  },
  childrenToAdd: [{}],
};

const noSsnFormData = {
  'view:selectable686Options': {
    addChild: true,
  },
  childrenToAdd: [
    {
      noSsn: true,
      noSsnReason: 'NONRESIDENT_ALIEN',
    },
  ],
  vaDependentsNoSsn: true,
};

describe('686 add child information', () => {
  const {
    schema,
    uiSchema,
  } = formConfig.chapters.addChild.pages.addChildInformation;

  it('should render', () => {
    const form = render(
      <Provider store={defaultStore}>
        <DefinitionTester
          schema={schema}
          definitions={formConfig.defaultDefinitions}
          uiSchema={uiSchema}
          data={formData}
          arrayPath="childrenToAdd"
          pagePerItemIndex={0}
        />
      </Provider>,
    );

    const formDOM = getFormDOM(form);
    expect(formDOM.querySelectorAll('va-text-input').length).to.eq(4);
  });

  it('should required field error', async () => {
    const { container } = render(
      <Provider store={defaultStore}>
        <DefinitionTester
          schema={schema}
          definitions={formConfig.defaultDefinitions}
          uiSchema={uiSchema}
          data={formData}
          arrayPath="childrenToAdd"
          pagePerItemIndex={0}
        />
      </Provider>,
    );

    await fireEvent.click($('button[type="submit"]', container));

    const [
      firstNameInput, // middleNameInput not used
      ,
      lastNameInput,
      ssnInput,
    ] = $$('va-text-input', container);

    await waitFor(() => {
      expect(firstNameInput.getAttribute('error')).to.equal(
        'Enter a first or given name',
      );
      expect(lastNameInput.getAttribute('error')).to.equal(
        'Enter a last or family name',
      );
      expect($('va-memorable-date', container).getAttribute('error')).to.equal(
        'Provide a date of birth',
      );
      expect(ssnInput.getAttribute('error')).to.equal(
        'Enter a valid 9-digit Social Security number (dashes allowed)',
      );
    });
  });

  it('should display a pattern error', async () => {
    const data = {
      ...formData,
      childrenToAdd: [
        {
          fullName: {
            first: 'John1',
            middle: 'A1',
            last: 'Doe1',
          },
          ssn: 'abc',
          birthDate: '2222-01-01',
        },
      ],
    };
    const { container } = render(
      <Provider store={defaultStore}>
        <DefinitionTester
          schema={schema}
          definitions={formConfig.defaultDefinitions}
          uiSchema={uiSchema}
          data={data}
          arrayPath="childrenToAdd"
          pagePerItemIndex={0}
        />
      </Provider>,
    );

    await fireEvent.click($('button[type="submit"]', container));

    const [firstNameInput, middleNameInput, lastNameInput, ssnInput] = $$(
      'va-text-input',
      container,
    );

    await waitFor(() => {
      expect(firstNameInput.getAttribute('error')).to.equal(
        'Your name can only include letters, spaces, and hyphens.',
      );
      expect(middleNameInput.getAttribute('error')).to.equal(
        'Your name can only include letters, spaces, and hyphens.',
      );
      expect(lastNameInput.getAttribute('error')).to.equal(
        'Your name can only include letters, spaces, and hyphens.',
      );
      expect(
        $('va-memorable-date', container).getAttribute('error'),
      ).to.contain('Please enter a year between ');
      expect(ssnInput.getAttribute('error')).to.equal(
        'You entered 0 digits. SSN must be 9 digits.',
      );
    });
  });
});
describe('686 add child information with no SSN', () => {
  const {
    schema,
    uiSchema,
  } = formConfig.chapters.addChild.pages.addChildInformation;

  it('should render', () => {
    const form = render(
      <Provider store={defaultStore}>
        <DefinitionTester
          schema={schema}
          definitions={formConfig.defaultDefinitions}
          uiSchema={uiSchema}
          data={noSsnFormData}
          arrayPath="childrenToAdd"
          pagePerItemIndex={0}
        />
      </Provider>,
    );

    const formDOM = getFormDOM(form);
    expect(formDOM.querySelectorAll('va-text-input').length).to.eq(3);
    expect(formDOM.querySelectorAll('va-radio').length).to.eq(1);
    expect(formDOM.querySelectorAll('va-radio-option').length).to.eq(2);
  });
});
