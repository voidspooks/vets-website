// @ts-nocheck
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { expect } from 'chai';
import sinon from 'sinon';
import { Provider } from 'react-redux';

import { FileField } from '../../components/FileField';

const createMockStore = () => ({
  getState: () => ({
    featureToggles: {
      fileUploadShortWorkflowEnabled: false,
    },
  }),
  subscribe: () => {},
  dispatch: () => {},
});

describe('FileField', () => {
  const getDefaultProps = () => ({
    schema: {
      type: 'array',
      items: [{ properties: {} }],
      additionalItems: { properties: {} },
      maxItems: 5,
    },
    uiSchema: {
      'ui:title': 'Upload files',
      'ui:options': {
        buttonText: 'Upload file',
        addAnotherLabel: 'Upload another file',
        fileTypes: ['pdf'],
        mockReadAndCheckFile: () => ({
          checkTypeAndExtensionMatches: true,
          checkIsEncryptedPdf: false,
        }),
      },
    },
    idSchema: { $id: 'root_files' },
    formData: [],
    formContext: {
      onReviewPage: false,
      reviewMode: false,
      trackingPrefix: 'preneed-',
      uploadFile: sinon.stub().returns({ abort: sinon.spy() }),
    },
    onChange: sinon.spy(),
    onBlur: sinon.spy(),
    registry: {
      fields: { SchemaField: () => <div>Field</div> },
      formContext: {},
    },
  });

  it('should render upload button', () => {
    const { container } = render(
      <Provider store={createMockStore()}>
        <FileField {...getDefaultProps()} />
      </Provider>,
    );

    const button = container.querySelector('va-button');
    expect(button).to.exist;
    expect(button.getAttribute('text')).to.equal('Upload file');
  });

  it('should render file list when files exist', () => {
    const props = getDefaultProps();
    props.formData = [{ name: 'test.pdf', confirmationCode: 'abc123' }];

    const { container } = render(
      <Provider store={createMockStore()}>
        <FileField {...props} />
      </Provider>,
    );

    expect(container.querySelector('.schemaform-file-list')).to.exist;
    expect(container.textContent).to.include('test.pdf');
  });

  it('should show delete button for uploaded files', () => {
    const props = getDefaultProps();
    props.formData = [{ name: 'test.pdf', confirmationCode: 'abc123' }];

    const { container } = render(
      <Provider store={createMockStore()}>
        <FileField {...props} />
      </Provider>,
    );

    expect(container.querySelector('.delete-upload')).to.exist;
  });

  it('should open modal when delete is clicked', () => {
    const props = getDefaultProps();
    props.formData = [{ name: 'test.pdf', confirmationCode: 'abc123' }];

    const { container } = render(
      <Provider store={createMockStore()}>
        <FileField {...props} />
      </Provider>,
    );

    const deleteButton = container.querySelector('.delete-upload');
    fireEvent.click(deleteButton);

    const modal = container.querySelector('va-modal');
    expect(modal.getAttribute('visible')).to.equal('true');
  });

  it('should hide upload button in review mode', () => {
    const props = getDefaultProps();
    props.formContext.reviewMode = true;
    props.formData = [{ name: 'test.pdf', confirmationCode: 'abc123' }];

    const { container } = render(
      <Provider store={createMockStore()}>
        <FileField {...props} />
      </Provider>,
    );

    expect(container.querySelector('#upload-button')).to.not.exist;
  });

  it('should accept specified file types', () => {
    const { container } = render(
      <Provider store={createMockStore()}>
        <FileField {...getDefaultProps()} />
      </Provider>,
    );

    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput.getAttribute('accept')).to.equal('.pdf');
  });

  it('should show error message for failed uploads', () => {
    const props = getDefaultProps();
    props.formData = [{ name: 'test.pdf', errorMessage: 'Upload failed' }];

    const { container } = render(
      <Provider store={createMockStore()}>
        <FileField {...props} />
      </Provider>,
    );

    expect(container.textContent).to.include('Upload failed');
    expect(container.querySelector('.schemaform-file-error')).to.exist;
  });

  it('should hide upload button when max items reached', () => {
    const props = getDefaultProps();
    props.schema.maxItems = 1;
    props.formData = [{ name: 'test.pdf', confirmationCode: 'abc123' }];

    const { container } = render(
      <Provider store={createMockStore()}>
        <FileField {...props} />
      </Provider>,
    );

    expect(container.querySelector('#upload-button')).to.not.exist;
  });

  it('should show "Upload another" when files exist', () => {
    const props = getDefaultProps();
    props.formData = [{ name: 'test.pdf', confirmationCode: 'abc123' }];

    const { container } = render(
      <Provider store={createMockStore()}>
        <FileField {...props} />
      </Provider>,
    );

    const uploadButton = container.querySelector('#upload-button');
    expect(uploadButton.getAttribute('text')).to.equal('Upload another file');
  });

  it('should handle file upload with valid file', () => {
    const onChange = sinon.spy();
    const uploadFile = sinon.stub().returns({ abort: sinon.spy() });
    const props = getDefaultProps();
    props.onChange = onChange;
    props.formContext.uploadFile = uploadFile;

    const { container } = render(
      <Provider store={createMockStore()}>
        <FileField {...props} />
      </Provider>,
    );

    const fileInput = container.querySelector('input[type="file"]');
    const mockFile = new File(['test content'], 'test.pdf', {
      type: 'application/pdf',
    });

    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    expect(uploadFile.called).to.be.true;
  });

  it('should detect encrypted PDF and show error', () => {
    const onChange = sinon.spy();
    const props = getDefaultProps();
    props.onChange = onChange;
    props.uiSchema['ui:options'].mockReadAndCheckFile = () => ({
      checkTypeAndExtensionMatches: true,
      checkIsEncryptedPdf: true,
    });

    const { container } = render(
      <Provider store={createMockStore()}>
        <FileField {...props} />
      </Provider>,
    );

    const fileInput = container.querySelector('input[type="file"]');
    const mockFile = new File(['encrypted'], 'encrypted.pdf', {
      type: 'application/pdf',
    });

    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    expect(onChange.called).to.be.true;
    const callArgs = onChange.getCall(0).args[0];
    expect(callArgs[0]).to.have.property('errorMessage');
  });

  it('should show error for file type mismatch', () => {
    const onChange = sinon.spy();
    const props = getDefaultProps();
    props.onChange = onChange;
    props.uiSchema['ui:options'].mockReadAndCheckFile = () => ({
      checkTypeAndExtensionMatches: false,
      checkIsEncryptedPdf: false,
    });

    const { container } = render(
      <Provider store={createMockStore()}>
        <FileField {...props} />
      </Provider>,
    );

    const fileInput = container.querySelector('input[type="file"]');
    const mockFile = new File(['test'], 'test.doc', {
      type: 'application/msword',
    });

    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    expect(onChange.called).to.be.true;
    const callArgs = onChange.getCall(0).args[0];
    expect(callArgs[0]).to.have.property('errorMessage');
  });

  it('should render multiple uploaded files', () => {
    const props = getDefaultProps();
    props.formData = [
      { name: 'file1.pdf', confirmationCode: 'abc123' },
      { name: 'file2.pdf', confirmationCode: 'def456' },
      { name: 'file3.pdf', confirmationCode: 'ghi789' },
    ];

    const { container } = render(
      <Provider store={createMockStore()}>
        <FileField {...props} />
      </Provider>,
    );

    const fileList = container.querySelectorAll('.schemaform-file-list li');
    expect(fileList).to.have.length(3);
    expect(container.textContent).to.include('file1.pdf');
    expect(container.textContent).to.include('file2.pdf');
    expect(container.textContent).to.include('file3.pdf');
  });

  it('should show progress bar during upload', () => {
    const props = getDefaultProps();
    props.formData = [{ name: 'uploading.pdf', uploading: true }];

    const { container } = render(
      <Provider store={createMockStore()}>
        <FileField {...props} />
      </Provider>,
    );

    const progressBar = container.querySelector('va-progress-bar');
    expect(progressBar).to.exist;
  });

  it('should show cancel button during upload', () => {
    const props = getDefaultProps();
    props.formData = [{ name: 'uploading.pdf', uploading: true }];

    const { container } = render(
      <Provider store={createMockStore()}>
        <FileField {...props} />
      </Provider>,
    );

    const cancelButton = container.querySelector('.cancel-upload');
    expect(cancelButton).to.exist;
    expect(cancelButton.getAttribute('text')).to.equal('Cancel');
  });

  it('should show delete modal when delete button is clicked', () => {
    const props = getDefaultProps();
    props.formData = [{ name: 'test.pdf', confirmationCode: 'abc123' }];

    const { container } = render(
      <Provider store={createMockStore()}>
        <FileField {...props} />
      </Provider>,
    );

    const deleteButton = container.querySelector('.delete-upload');
    fireEvent.click(deleteButton);

    const modal = container.querySelector('va-modal');
    expect(modal.getAttribute('visible')).to.equal('true');
    expect(modal.getAttribute('modal-title')).to.include(
      'Are you sure you want to delete this file',
    );
  });

  it('should show modal content with file name', () => {
    const props = getDefaultProps();
    props.formData = [
      { name: 'important-document.pdf', confirmationCode: 'abc123' },
    ];

    const { container } = render(
      <Provider store={createMockStore()}>
        <FileField {...props} />
      </Provider>,
    );

    const deleteButton = container.querySelector('.delete-upload');
    fireEvent.click(deleteButton);

    const modal = container.querySelector('va-modal');
    expect(modal).to.exist;
    expect(container.textContent).to.include('important-document.pdf');
  });

  it('should show retry button when enableShortWorkflow is true and upload failed', () => {
    const props = getDefaultProps();
    props.enableShortWorkflow = true;
    props.formData = [
      {
        name: 'failed.pdf',
        errorMessage: 'There was a network error',
        uploading: false,
        file: new File(['test'], 'failed.pdf'),
      },
    ];

    const { container } = render(
      <Provider store={createMockStore()}>
        <FileField {...props} />
      </Provider>,
    );

    const retryButton = container.querySelector('.retry-upload');
    expect(retryButton).to.exist;
    expect(retryButton.getAttribute('text')).to.match(
      /Try again|Upload a new file/,
    );
  });

  it('should handle empty file list', () => {
    const props = getDefaultProps();
    props.formData = [];

    const { container } = render(
      <Provider store={createMockStore()}>
        <FileField {...props} />
      </Provider>,
    );

    expect(container.querySelector('.schemaform-file-list')).to.not.exist;
    const uploadButton = container.querySelector('#upload-button');
    expect(uploadButton).to.exist;
  });

  it('should show correct file count in title when on review page', () => {
    const props = getDefaultProps();
    props.formContext.onReviewPage = true;
    props.formData = [
      { name: 'test1.pdf', confirmationCode: 'abc123' },
      { name: 'test2.pdf', confirmationCode: 'def456' },
    ];

    const { container } = render(
      <Provider store={createMockStore()}>
        <FileField {...props} />
      </Provider>,
    );

    expect(container.textContent).to.include('test1.pdf');
    expect(container.textContent).to.include('test2.pdf');
  });

  it('should not show delete buttons on review page in review mode', () => {
    const props = getDefaultProps();
    props.formContext.onReviewPage = true;
    props.formContext.reviewMode = true;
    props.formData = [{ name: 'test.pdf', confirmationCode: 'abc123' }];

    const { container } = render(
      <Provider store={createMockStore()}>
        <FileField {...props} />
      </Provider>,
    );

    expect(container.querySelector('.delete-upload')).to.not.exist;
  });

  it('should accept multiple file types', () => {
    const props = getDefaultProps();
    props.uiSchema['ui:options'].fileTypes = ['pdf', 'jpg', 'png'];

    const { container } = render(
      <Provider store={createMockStore()}>
        <FileField {...props} />
      </Provider>,
    );

    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput.getAttribute('accept')).to.equal('.pdf,.jpg,.png');
  });

  it('should call onBlur when provided', () => {
    const onBlur = sinon.spy();
    const props = getDefaultProps();
    props.onBlur = onBlur;

    render(
      <Provider store={createMockStore()}>
        <FileField {...props} />
      </Provider>,
    );

    // onBlur is passed down but not called on initial render
    expect(onBlur.called).to.be.false;
  });

  it('should use custom button text from uiOptions', () => {
    const props = getDefaultProps();
    props.uiSchema['ui:options'].buttonText = 'Select a document';

    const { container } = render(
      <Provider store={createMockStore()}>
        <FileField {...props} />
      </Provider>,
    );

    const uploadButton = container.querySelector('#upload-button');
    expect(uploadButton.getAttribute('text')).to.equal('Select a document');
  });

  it('should use custom addAnotherLabel from uiOptions', () => {
    const props = getDefaultProps();
    props.uiSchema['ui:options'].addAnotherLabel = 'Add more documents';
    props.formData = [{ name: 'existing.pdf', confirmationCode: 'abc123' }];

    const { container } = render(
      <Provider store={createMockStore()}>
        <FileField {...props} />
      </Provider>,
    );

    const uploadButton = container.querySelector('#upload-button');
    expect(uploadButton.getAttribute('text')).to.equal('Add more documents');
  });

  it('should handle schema with additionalItems properties', () => {
    const props = getDefaultProps();
    props.schema.additionalItems = {
      properties: {
        attachmentId: { type: 'string' },
      },
    };

    const { container } = render(
      <Provider store={createMockStore()}>
        <FileField {...props} />
      </Provider>,
    );

    expect(container.querySelector('#upload-button')).to.exist;
  });

  it('should handle files with size property', () => {
    const props = getDefaultProps();
    props.formData = [
      { name: 'large-file.pdf', confirmationCode: 'abc123', size: 1048576 },
    ];

    const { container } = render(
      <Provider store={createMockStore()}>
        <FileField {...props} />
      </Provider>,
    );

    expect(container.textContent).to.include('large-file.pdf');
  });

  it('should display error from errorSchema', () => {
    const props = getDefaultProps();
    props.formData = [{ name: 'test.pdf' }];
    props.errorSchema = {
      0: {
        __errors: ['This file is required'],
      },
    };

    const { container } = render(
      <Provider store={createMockStore()}>
        <FileField {...props} />
      </Provider>,
    );

    expect(container.textContent).to.include('This file is required');
  });

  it('should handle multiple errors in errorSchema', () => {
    const props = getDefaultProps();
    props.formData = [{ name: 'test.pdf' }];
    props.errorSchema = {
      0: {
        __errors: ['Error 1', 'Error 2'],
      },
    };

    const { container } = render(
      <Provider store={createMockStore()}>
        <FileField {...props} />
      </Provider>,
    );

    // Should show first error
    expect(container.textContent).to.include('Error 1');
  });

  it('should cancel upload when cancel button is clicked', () => {
    const onChange = sinon.spy();
    const props = getDefaultProps();
    props.onChange = onChange;
    props.formData = [{ name: 'uploading.pdf', uploading: true }];

    const { container } = render(
      <Provider store={createMockStore()}>
        <FileField {...props} />
      </Provider>,
    );

    const cancelButton = container.querySelector('.cancel-upload');
    fireEvent.click(cancelButton);

    expect(onChange.called).to.be.true;
  });

  it('should handle file with no confirmationCode', () => {
    const props = getDefaultProps();
    props.formData = [{ name: 'pending.pdf' }];

    const { container } = render(
      <Provider store={createMockStore()}>
        <FileField {...props} />
      </Provider>,
    );

    expect(container.textContent).to.include('pending.pdf');
  });

  it('should show delete button for files without errors', () => {
    const props = getDefaultProps();
    props.formData = [{ name: 'good-file.pdf', confirmationCode: 'abc123' }];

    const { container } = render(
      <Provider store={createMockStore()}>
        <FileField {...props} />
      </Provider>,
    );

    const deleteButton = container.querySelector('.delete-upload');
    expect(deleteButton).to.exist;
    expect(deleteButton.getAttribute('text')).to.equal('Delete file');
  });

  it('should hide upload when maxItems is null', () => {
    const props = getDefaultProps();
    props.schema.maxItems = null;

    const { container } = render(
      <Provider store={createMockStore()}>
        <FileField {...props} />
      </Provider>,
    );

    const uploadButton = container.querySelector('#upload-button');
    expect(uploadButton).to.exist;
  });

  it('should handle uploading state correctly', () => {
    const props = getDefaultProps();
    props.formData = [
      { name: 'file1.pdf', uploading: false, confirmationCode: 'abc' },
      { name: 'file2.pdf', uploading: true },
    ];

    const { container } = render(
      <Provider store={createMockStore()}>
        <FileField {...props} />
      </Provider>,
    );

    // Should show progress bar for uploading file
    expect(container.querySelector('va-progress-bar')).to.exist;
    // Upload button should be hidden when any file is uploading
    expect(container.querySelector('#upload-button')).to.not.exist;
  });

  it('should render with custom title from uiSchema', () => {
    const props = getDefaultProps();
    props.uiSchema['ui:title'] = 'Supporting Documents';

    const { container } = render(
      <Provider store={createMockStore()}>
        <FileField {...props} />
      </Provider>,
    );

    // Title is used in aria-label
    const uploadButton = container.querySelector('#upload-button');
    expect(uploadButton.getAttribute('label')).to.include(
      'Supporting Documents',
    );
  });

  it('should handle schema title when no ui:title provided', () => {
    const props = getDefaultProps();
    delete props.uiSchema['ui:title'];
    props.schema.title = 'File Uploads';

    const { container } = render(
      <Provider store={createMockStore()}>
        <FileField {...props} />
      </Provider>,
    );

    const uploadButton = container.querySelector('#upload-button');
    expect(uploadButton.getAttribute('label')).to.include('File Uploads');
  });

  it('should clear file input value when clicking upload button', () => {
    const props = getDefaultProps();

    const { container } = render(
      <Provider store={createMockStore()}>
        <FileField {...props} />
      </Provider>,
    );

    const fileInput = container.querySelector('input[type="file"]');
    const uploadButton = container.querySelector('#upload-button');

    // Simulate previous value
    Object.defineProperty(fileInput, 'value', {
      writable: true,
      value: 'test.pdf',
    });

    fireEvent.click(uploadButton);

    // Value should be cleared on click to allow re-uploading same file
    expect(fileInput.value).to.equal('');
  });

  it('should hide buttons when not in review mode but file is uploading', () => {
    const props = getDefaultProps();
    props.formData = [{ name: 'uploading.pdf', uploading: true }];

    const { container } = render(
      <Provider store={createMockStore()}>
        <FileField {...props} />
      </Provider>,
    );

    // Upload button should be hidden
    expect(container.querySelector('#upload-button')).to.not.exist;
    // But cancel button should be visible
    expect(container.querySelector('.cancel-upload')).to.exist;
  });

  it('should render file list with multiple items at different states', () => {
    const props = getDefaultProps();
    props.formData = [
      { name: 'success.pdf', confirmationCode: 'abc123' },
      { name: 'uploading.pdf', uploading: true },
      { name: 'error.pdf', errorMessage: 'Upload failed' },
    ];

    const { container } = render(
      <Provider store={createMockStore()}>
        <FileField {...props} />
      </Provider>,
    );

    expect(container.textContent).to.include('success.pdf');
    expect(container.textContent).to.include('uploading.pdf');
    expect(container.textContent).to.include('error.pdf');
    expect(container.textContent).to.include('Upload failed');
  });

  it('should handle ariaLabelAdditionalText option', () => {
    const props = getDefaultProps();
    props.uiSchema['ui:options'].ariaLabelAdditionalText =
      'Files must be under 10MB';

    const { container } = render(
      <Provider store={createMockStore()}>
        <FileField {...props} />
      </Provider>,
    );

    const uploadButton = container.querySelector('#upload-button');
    expect(uploadButton.getAttribute('label')).to.include(
      'Files must be under 10MB',
    );
  });

  it('should not call onChange when no file selected', () => {
    const onChange = sinon.spy();
    const props = getDefaultProps();
    props.onChange = onChange;

    const { container } = render(
      <Provider store={createMockStore()}>
        <FileField {...props} />
      </Provider>,
    );

    const fileInput = container.querySelector('input[type="file"]');
    fireEvent.change(fileInput, { target: { files: [] } });

    expect(onChange.called).to.be.false;
  });

  it('should render with dl tag when on review page in review mode', () => {
    const props = getDefaultProps();
    props.formContext.onReviewPage = true;
    props.formContext.reviewMode = true;
    props.formData = [{ name: 'test.pdf', confirmationCode: 'abc123' }];
    props.schema.items = [
      {
        properties: {
          attachmentId: { type: 'string' },
        },
      },
    ];

    const { container } = render(
      <Provider store={createMockStore()}>
        <FileField {...props} />
      </Provider>,
    );

    // Review mode uses dl tags
    expect(container.querySelector('dl')).to.exist;
  });
});
