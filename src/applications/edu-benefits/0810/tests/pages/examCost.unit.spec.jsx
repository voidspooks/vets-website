import React from 'react';
import { expect } from 'chai';
import { render, waitFor } from '@testing-library/react';
import { DefinitionTester } from 'platform/testing/unit/schemaform-utils';
import { $$ } from 'platform/forms-system/src/js/utilities/ui';
import formConfig from '../../config/form';

describe('22-0810 Exam information Step 3 - Page 3', () => {
  const {
    schema,
    uiSchema,
  } = formConfig.chapters.examInformationChapter.pages.examCost;

  it('should render with a text input for the exam cost', () => {
    const { container } = render(
      <DefinitionTester
        definitions={formConfig.defaultDefinitions}
        schema={schema}
        uiSchema={uiSchema}
      />,
    );

    expect($$('va-text-input', container).length).to.equal(1);
  });

  it('should render a note for additional information', () => {
    const { getByTestId } = render(
      <DefinitionTester
        definitions={formConfig.defaultDefinitions}
        schema={schema}
        uiSchema={uiSchema}
      />,
    );
    const examNote = getByTestId('exam-cost-note');

    expect(examNote).to.exist;
  });

  it('should render error messages if no cost is given', async () => {
    const { container, getByRole } = render(
      <DefinitionTester
        definitions={formConfig.defaultDefinitions}
        schema={schema}
        uiSchema={uiSchema}
      />,
    );

    expect($$('va-text-input[error]', container).length).to.equal(0);
    getByRole('button', { name: /submit/i }).click();
    await waitFor(() => {
      expect($$('va-text-input[error]', container).length).to.equal(1);
    });
  });
});
