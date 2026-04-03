import React from 'react';
import { expect } from 'chai';
import { render, waitFor } from '@testing-library/react';
import { DefinitionTester } from 'platform/testing/unit/schemaform-utils';
import { $$ } from 'platform/forms-system/src/js/utilities/ui';
import formConfig from '../../config/form';

describe('22-0810 Exam information Step 3 - Page 1', () => {
  const {
    schema,
    uiSchema,
  } = formConfig.chapters.examInformationChapter.pages.examNameAndDateTaken;

  it('should render with a text input for the exam name', () => {
    const { container } = render(
      <DefinitionTester
        definitions={formConfig.defaultDefinitions}
        schema={schema}
        uiSchema={uiSchema}
      />,
    );
    const examNameTextInput = container.querySelector(
      'va-text-input[label="Name of exam"',
    );

    expect(examNameTextInput).to.exist;
    expect($$('va-text-input', container).length).to.equal(1);
  });

  it('should render with a memorable date for the exam date', () => {
    const { container } = render(
      <DefinitionTester
        definitions={formConfig.defaultDefinitions}
        schema={schema}
        uiSchema={uiSchema}
      />,
    );
    const examDateMemorableDate = container.querySelector(
      'va-memorable-date[label="Date exam was taken"',
    );

    expect(examDateMemorableDate).to.exist;
    expect($$('va-memorable-date', container).length).to.equal(1);
  });

  it('should render a note for additional information', () => {
    const { getByTestId } = render(
      <DefinitionTester
        definitions={formConfig.defaultDefinitions}
        schema={schema}
        uiSchema={uiSchema}
      />,
    );
    const examNote = getByTestId('exam-name-date-note');

    expect(examNote).to.exist;
  });

  it('should render error messages for missing fields', async () => {
    const { container, getByRole } = render(
      <DefinitionTester
        definitions={formConfig.defaultDefinitions}
        schema={schema}
        uiSchema={uiSchema}
      />,
    );

    expect($$('va-text-input', container).length).to.equal(1);
    expect($$('va-memorable-date', container).length).to.equal(1);

    getByRole('button', { name: /submit/i }).click();

    await waitFor(() => {
      expect($$('va-text-input[error]', container).length).to.equal(1);
      expect($$('va-memorable-date[error]', container).length).to.equal(1);
    });
  });
});
