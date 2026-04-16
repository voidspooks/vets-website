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
describe('686 add child child address part two', () => {
  const {
    schema,
    uiSchema,
  } = formConfig.chapters.addChild.pages.addChildChildAddressPartTwo;

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
    expect(formDOM.querySelectorAll('va-text-input').length).to.eq(3);
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
    ] = $$('va-text-input', container);

    await waitFor(() => {
      expect(firstNameInput.getAttribute('error')).to.equal(
        'Enter a first or given name',
      );
      expect(lastNameInput.getAttribute('error')).to.equal(
        'Enter a last or family name',
      );
    });
  });

  it('should display a pattern error', async () => {
    const data = {
      ...formData,
      childrenToAdd: [
        {
          livingWith: {
            first: 'John1',
            middle: 'A1',
            last: 'Doe1',
          },
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

    const [firstNameInput, middleNameInput, lastNameInput] = $$(
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
    });
  });
});
