import React from 'react';
import { Provider } from 'react-redux';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { expect } from 'chai';
import sinon from 'sinon';
import { FileField } from '../../../components/FileField';

const mockStore = {
  getState: () => ({
    featureToggles: {
      fileUploadShortWorkflowEnabled: false,
    },
  }),
  subscribe: () => {},
  dispatch: () => {},
};

describe('FileField', () => {
  let defaultProps;

  beforeEach(() => {
    defaultProps = {
      schema: {
        additionalItems: {
          required: [],
        },
        items: [{}],
      },
      uiSchema: {
        'ui:title': 'Upload files',
        'ui:options': {
          buttonText: 'Upload',
          fileTypes: ['pdf', 'jpg', 'png'],
          mockReadAndCheckFile: () => ({
            checkTypeAndExtensionMatches: true,
            checkIsEncryptedPdf: false,
          }),
        },
      },
      idSchema: {
        $id: 'test_file_field',
      },
      formContext: {
        onReviewPage: false,
        reviewMode: false,
        uploadFile: sinon.stub(),
        trackingPrefix: 'test-prefix',
      },
      registry: {
        fields: {
          SchemaField: () => <div>Schema Field</div>,
        },
        formContext: {},
      },
      formData: [],
      onChange: sinon.spy(),
      onBlur: sinon.spy(),
    };
  });

  it('renders without crashing', () => {
    const { container } = render(
      <Provider store={mockStore}>
        <FileField {...defaultProps} />
      </Provider>,
    );
    expect(container).to.exist;
  });

  it('renders upload button with default text', () => {
    const { container } = render(
      <Provider store={mockStore}>
        <FileField {...defaultProps} />
      </Provider>,
    );
    const uploadButton = container.querySelector('va-button[text="Upload"]');
    expect(uploadButton).to.exist;
  });

  it('renders upload button with custom button text', () => {
    const props = {
      ...defaultProps,
      uiSchema: {
        ...defaultProps.uiSchema,
        'ui:options': {
          ...defaultProps.uiSchema['ui:options'],
          buttonText: 'Choose File',
        },
      },
    };
    const { container } = render(
      <Provider store={mockStore}>
        <FileField {...props} />
      </Provider>,
    );
    const uploadButton = container.querySelector(
      'va-button[text="Choose File"]',
    );
    expect(uploadButton).to.exist;
  });

  it('renders "Upload another" text when files exist', () => {
    const props = {
      ...defaultProps,
      formData: [{ name: 'test.pdf', confirmationCode: 'abc123' }],
    };
    const { container } = render(
      <Provider store={mockStore}>
        <FileField {...props} />
      </Provider>,
    );
    const uploadButton = container.querySelector(
      'va-button[text="Upload another"]',
    );
    expect(uploadButton).to.exist;
  });

  it('renders file list when files are uploaded', () => {
    const props = {
      ...defaultProps,
      formData: [
        { name: 'test1.pdf', confirmationCode: 'abc123', size: 1000 },
        { name: 'test2.jpg', confirmationCode: 'def456', size: 2000 },
      ],
    };
    const { getByText } = render(
      <Provider store={mockStore}>
        <FileField {...props} />
      </Provider>,
    );
    expect(getByText('test1.pdf')).to.exist;
    expect(getByText('test2.jpg')).to.exist;
  });

  it('hides upload button in review mode', () => {
    const props = {
      ...defaultProps,
      formContext: {
        ...defaultProps.formContext,
        reviewMode: true,
      },
      formData: [{ name: 'test.pdf', confirmationCode: 'abc123' }],
    };
    const { container } = render(
      <Provider store={mockStore}>
        <FileField {...props} />
      </Provider>,
    );
    const uploadButton = container.querySelector('va-button[text="Upload"]');
    const uploadAnotherButton = container.querySelector(
      'va-button[text="Upload another"]',
    );
    expect(uploadButton).to.not.exist;
    expect(uploadAnotherButton).to.not.exist;
  });

  it('handles file selection and upload', async () => {
    const uploadFile = sinon.stub().callsFake((file, options, progress, cb) => {
      // Simulate successful upload
      cb({ name: file.name, uploading: false, confirmationCode: 'abc123' });
      return { abort: () => {} };
    });

    const props = {
      ...defaultProps,
      formContext: {
        ...defaultProps.formContext,
        uploadFile,
      },
    };

    const { container } = render(
      <Provider store={mockStore}>
        <FileField {...props} />
      </Provider>,
    );

    const fileInput = container.querySelector('input[type="file"]');
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(uploadFile.called).to.be.true;
      expect(props.onChange.called).to.be.true;
    });
  });

  it('shows error for file size exceeding 20MB', async () => {
    const props = {
      ...defaultProps,
    };

    const { container } = render(
      <Provider store={mockStore}>
        <FileField {...props} />
      </Provider>,
    );

    const fileInput = container.querySelector('input[type="file"]');
    const largeFile = new File(['x'.repeat(21 * 1024 * 1024)], 'large.pdf', {
      type: 'application/pdf',
    });

    // Override size property
    Object.defineProperty(largeFile, 'size', {
      value: 21 * 1024 * 1024,
    });

    fireEvent.change(fileInput, { target: { files: [largeFile] } });

    await waitFor(() => {
      expect(props.onChange.called).to.be.true;
      const callArg = props.onChange.getCall(0).args[0];
      expect(callArg[0].errorMessage).to.equal(
        'File size must not be greater than 20.0 MB.',
      );
    });
  });

  it('shows error for encrypted PDF', async () => {
    const props = {
      ...defaultProps,
      uiSchema: {
        ...defaultProps.uiSchema,
        'ui:options': {
          ...defaultProps.uiSchema['ui:options'],
          mockReadAndCheckFile: () => ({
            checkTypeAndExtensionMatches: true,
            checkIsEncryptedPdf: true,
          }),
        },
      },
    };

    const { container } = render(
      <Provider store={mockStore}>
        <FileField {...props} />
      </Provider>,
    );

    const fileInput = container.querySelector('input[type="file"]');
    const file = new File(['content'], 'encrypted.pdf', {
      type: 'application/pdf',
    });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(props.onChange.called).to.be.true;
      const callArg = props.onChange.getCall(0).args[0];
      expect(callArg[0].errorMessage).to.include('not encrypted');
    });
  });

  it('shows error for file type mismatch', async () => {
    const props = {
      ...defaultProps,
      uiSchema: {
        ...defaultProps.uiSchema,
        'ui:options': {
          ...defaultProps.uiSchema['ui:options'],
          mockReadAndCheckFile: () => ({
            checkTypeAndExtensionMatches: false,
            checkIsEncryptedPdf: false,
          }),
        },
      },
    };

    const { container } = render(
      <Provider store={mockStore}>
        <FileField {...props} />
      </Provider>,
    );

    const fileInput = container.querySelector('input[type="file"]');
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(props.onChange.called).to.be.true;
      const callArg = props.onChange.getCall(0).args[0];
      expect(callArg[0].errorMessage).to.exist;
    });
  });

  it('displays progress bar during upload', () => {
    const props = {
      ...defaultProps,
      formData: [{ name: 'test.pdf', uploading: true }],
    };

    const { container } = render(
      <Provider store={mockStore}>
        <FileField {...props} />
      </Provider>,
    );

    expect(container.querySelector('va-progress-bar')).to.exist;
  });

  it('shows cancel button during upload', () => {
    const props = {
      ...defaultProps,
      formData: [{ name: 'test.pdf', uploading: true }],
    };

    const { container } = render(
      <Provider store={mockStore}>
        <FileField {...props} />
      </Provider>,
    );

    const cancelButton = container.querySelector(
      'va-button[text="Cancel"].cancel-upload',
    );
    expect(cancelButton).to.exist;
  });

  it('handles cancel upload', async () => {
    const abortStub = sinon.stub();
    const uploadFile = sinon.stub().returns({ abort: abortStub });

    const props = {
      ...defaultProps,
      formContext: {
        ...defaultProps.formContext,
        uploadFile,
      },
      formData: [{ name: 'test.pdf', uploading: true }],
    };

    const { container } = render(
      <Provider store={mockStore}>
        <FileField {...props} />
      </Provider>,
    );

    const cancelButton = container.querySelector(
      'va-button[text="Cancel"].cancel-upload',
    );
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(props.onChange.called).to.be.true;
    });
  });

  it('shows delete button for uploaded files', () => {
    const props = {
      ...defaultProps,
      formData: [{ name: 'test.pdf', confirmationCode: 'abc123' }],
    };

    const { container } = render(
      <Provider store={mockStore}>
        <FileField {...props} />
      </Provider>,
    );

    const deleteButton = container.querySelector(
      'va-button[text="Delete file"].delete-upload',
    );
    expect(deleteButton).to.exist;
  });

  it('opens remove modal when delete button is clicked', async () => {
    const props = {
      ...defaultProps,
      formData: [{ name: 'test.pdf', confirmationCode: 'abc123' }],
    };

    const { container } = render(
      <Provider store={mockStore}>
        <FileField {...props} />
      </Provider>,
    );

    const deleteButton = container.querySelector(
      'va-button[text="Delete file"].delete-upload',
    );
    fireEvent.click(deleteButton);

    await waitFor(() => {
      const modal = container.querySelector('va-modal');
      expect(modal).to.exist;
      expect(modal.getAttribute('visible')).to.equal('true');
    });
  });

  it('closes modal when "No, keep this" is clicked', async () => {
    const props = {
      ...defaultProps,
      formData: [{ name: 'test.pdf', confirmationCode: 'abc123' }],
    };

    const { container } = render(
      <Provider store={mockStore}>
        <FileField {...props} />
      </Provider>,
    );

    const deleteButton = container.querySelector(
      'va-button[text="Delete file"].delete-upload',
    );
    fireEvent.click(deleteButton);

    await waitFor(() => {
      const modal = container.querySelector('va-modal');
      expect(modal.getAttribute('visible')).to.equal('true');
    });

    const modal = container.querySelector('va-modal');
    const event = new CustomEvent('secondaryButtonClick');
    modal.dispatchEvent(event);

    await waitFor(() => {
      expect(props.onChange.called).to.be.false;
    });
  });

  it('removes file when modal confirms deletion', async () => {
    const props = {
      ...defaultProps,
      formData: [{ name: 'test.pdf', confirmationCode: 'abc123' }],
    };

    const { container } = render(
      <Provider store={mockStore}>
        <FileField {...props} />
      </Provider>,
    );

    const deleteButton = container.querySelector(
      'va-button[text="Delete file"].delete-upload',
    );
    fireEvent.click(deleteButton);

    await waitFor(() => {
      const modal = container.querySelector('va-modal');
      expect(modal.getAttribute('visible')).to.equal('true');
    });

    const modal = container.querySelector('va-modal');
    const event = new CustomEvent('primaryButtonClick');
    modal.dispatchEvent(event);

    await waitFor(() => {
      expect(props.onChange.called).to.be.true;
    });
  });

  it('respects maxItems limit', () => {
    const props = {
      ...defaultProps,
      schema: {
        ...defaultProps.schema,
        maxItems: 2,
      },
      formData: [
        { name: 'test1.pdf', confirmationCode: 'abc123' },
        { name: 'test2.pdf', confirmationCode: 'def456' },
      ],
    };

    const { container } = render(
      <Provider store={mockStore}>
        <FileField {...props} />
      </Provider>,
    );

    // Upload button should not be visible when maxItems is reached
    const uploadButton = container.querySelector(
      'va-button[text="Upload another"]',
    );
    expect(uploadButton).to.not.exist;
  });

  it('displays file size when provided', () => {
    const props = {
      ...defaultProps,
      formData: [{ name: 'test.pdf', confirmationCode: 'abc123', size: 1024 }],
    };

    const { container } = render(
      <Provider store={mockStore}>
        <FileField {...props} />
      </Provider>,
    );

    expect(container.textContent).to.include('KB');
  });

  it('filters out empty file objects on mount', () => {
    const props = {
      ...defaultProps,
      formData: [
        { name: 'test.pdf', confirmationCode: 'abc123' },
        { file: {} }, // Empty file object
      ],
    };

    render(
      <Provider store={mockStore}>
        <FileField {...props} />
      </Provider>,
    );

    // Should call onChange to remove empty file
    expect(props.onChange.called).to.be.true;
  });

  it('shows error message in list item when file has error', () => {
    const props = {
      ...defaultProps,
      formData: [
        {
          name: 'test.pdf',
          errorMessage: 'Upload failed',
        },
      ],
    };

    const { getByText } = render(
      <Provider store={mockStore}>
        <FileField {...props} />
      </Provider>,
    );

    expect(getByText('Upload failed')).to.exist;
  });

  it('shows retry button when upload fails', () => {
    const props = {
      ...defaultProps,
      formData: [
        {
          name: 'test.pdf',
          errorMessage: 'Upload failed',
          file: new File(['content'], 'test.pdf', { type: 'application/pdf' }),
        },
      ],
    };

    const { container } = render(
      <Provider store={mockStore}>
        <FileField {...props} />
      </Provider>,
    );

    const retryButton = container.querySelector(
      'va-button[text="Upload a new file"].retry-upload',
    );
    expect(retryButton).to.exist;
  });

  it('handles attachment ID change', () => {
    const props = {
      ...defaultProps,
      schema: {
        ...defaultProps.schema,
        items: [
          {
            properties: {
              attachmentId: { type: 'string' },
            },
          },
        ],
        additionalItems: {
          required: ['attachmentId'],
        },
      },
      formData: [{ name: 'test.pdf', confirmationCode: 'abc123' }],
    };

    render(
      <Provider store={mockStore}>
        <FileField {...props} />
      </Provider>,
    );

    // Component should render without errors when attachmentId is in schema
    expect(props.onChange.called).to.be.false;
  });

  it('accepts file types from uiOptions', () => {
    const props = {
      ...defaultProps,
      uiSchema: {
        ...defaultProps.uiSchema,
        'ui:options': {
          ...defaultProps.uiSchema['ui:options'],
          fileTypes: ['pdf', 'doc', 'docx'],
        },
      },
    };

    const { container } = render(
      <Provider store={mockStore}>
        <FileField {...props} />
      </Provider>,
    );

    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput.getAttribute('accept')).to.equal('.pdf,.doc,.docx');
  });

  it('renders with custom modal content', () => {
    const customModalContent = fileName => (
      <div>Custom content for {fileName}</div>
    );

    const props = {
      ...defaultProps,
      uiSchema: {
        ...defaultProps.uiSchema,
        'ui:options': {
          ...defaultProps.uiSchema['ui:options'],
          modalContent: customModalContent,
        },
      },
      formData: [{ name: 'test.pdf', confirmationCode: 'abc123' }],
    };

    const { container, getByText } = render(
      <Provider store={mockStore}>
        <FileField {...props} />
      </Provider>,
    );

    const deleteButton = container.querySelector(
      'va-button[text="Delete file"].delete-upload',
    );
    fireEvent.click(deleteButton);

    expect(getByText(/Custom content for/)).to.exist;
  });

  it('does not show delete button during upload', () => {
    const props = {
      ...defaultProps,
      formData: [{ name: 'test.pdf', uploading: true }],
    };

    const { container } = render(
      <Provider store={mockStore}>
        <FileField {...props} />
      </Provider>,
    );

    const deleteButton = container.querySelector(
      'va-button[text="Delete file"].delete-upload',
    );
    expect(deleteButton).to.not.exist;
  });

  it('handles Cypress testing file type', async () => {
    const uploadFile = sinon.stub().callsFake((file, options, progress, cb) => {
      cb({ name: file.name, uploading: false, confirmationCode: 'abc123' });
      return { abort: () => {} };
    });

    const props = {
      ...defaultProps,
      formContext: {
        ...defaultProps.formContext,
        uploadFile,
      },
    };

    const { container } = render(
      <Provider store={mockStore}>
        <FileField {...props} />
      </Provider>,
    );

    const fileInput = container.querySelector('input[type="file"]');
    const file = new File(['content'], 'test.pdf', { type: 'testing' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(uploadFile.called).to.be.true;
    });
  });

  it('clears file input value on click', () => {
    const { container } = render(
      <Provider store={mockStore}>
        <FileField {...defaultProps} />
      </Provider>,
    );

    const fileInput = container.querySelector('input[type="file"]');

    // Verify the click handler is called by checking that the value is empty
    fireEvent.click(fileInput);

    // The file input value should be empty string after click
    expect(fileInput.value).to.equal('');
  });

  it('renders with string title from uiSchema', () => {
    const props = {
      ...defaultProps,
      uiSchema: {
        ...defaultProps.uiSchema,
        'ui:title': 'Custom Title',
      },
    };

    const { container } = render(
      <Provider store={mockStore}>
        <FileField {...props} />
      </Provider>,
    );

    expect(container).to.exist;
  });

  it('renders with title from schema when uiSchema title is not string', () => {
    const props = {
      ...defaultProps,
      schema: {
        ...defaultProps.schema,
        title: 'Schema Title',
      },
      uiSchema: {
        ...defaultProps.uiSchema,
        'ui:title': () => 'Function Title',
      },
    };

    const { container } = render(
      <Provider store={mockStore}>
        <FileField {...props} />
      </Provider>,
    );

    expect(container).to.exist;
  });

  it('handles enableShortWorkflow mode', () => {
    const props = {
      ...defaultProps,
      enableShortWorkflow: true,
    };

    const { container } = render(
      <Provider store={mockStore}>
        <FileField {...props} />
      </Provider>,
    );

    expect(container).to.exist;
  });

  it('hides upload button in short workflow when errors exist', () => {
    const props = {
      ...defaultProps,
      enableShortWorkflow: true,
      formData: [
        {
          name: 'test.pdf',
          errorMessage: 'Upload failed',
        },
      ],
    };

    const { container } = render(
      <Provider store={mockStore}>
        <FileField {...props} />
      </Provider>,
    );

    const uploadButton = container.querySelector('va-button[text="Upload"]');
    expect(uploadButton).to.not.exist;
  });
});
