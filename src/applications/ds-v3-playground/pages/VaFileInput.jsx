/* eslint-disable no-console */
import React, { useState, useMemo, useCallback } from 'react';
import { VaFileInput } from '@department-of-veterans-affairs/web-components/react-bindings';
import { debounce } from 'lodash';
import {
  DEBOUNCE_WAIT,
  shouldSimulateError,
  simulateUploadProgress,
  createUploadResponse,
  checkIfEncrypted,
  createPendingPasswordFile,
  createErrorFile,
} from './VaFileInputUtilities';

export default function VaFileInputPage() {
  const [file, setFile] = useState(null);
  const [percentUploaded, setPercentUploaded] = useState(null);
  const [encrypted, setEncrypted] = useState(false);
  const [fileError, setFileError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  // Mock file upload with error scenarios
  const mockFileUpload = async (uploadFile, password = null) => {
    setFileError(null);

    const errorScenario = shouldSimulateError(uploadFile, password);

    if (errorScenario) {
      await new Promise(resolve => setTimeout(resolve, 500));

      setFileError(errorScenario.message);

      if (errorScenario.type === 'password') {
        setPasswordError(errorScenario.message);
      }

      console.error(
        `Mock upload error (${errorScenario.type}):`,
        errorScenario.message,
      );

      return null;
    }

    // Simulate upload progress
    setPercentUploaded(0);
    await simulateUploadProgress(setPercentUploaded);

    // Clear progress after completion
    setPercentUploaded(null);

    // eslint-disable-next-line consistent-return
    return createUploadResponse(uploadFile);
  };

  // Handle file processing
  const handleFileAdded = async uploadFile => {
    if (!uploadFile || !uploadFile.name) {
      return;
    }

    try {
      // Check if file is encrypted
      const isEncrypted = await checkIfEncrypted(uploadFile);

      setEncrypted(isEncrypted);
      setPasswordError(null);

      if (isEncrypted) {
        // For encrypted files, don't upload immediately - wait for password
        setFile(createPendingPasswordFile(uploadFile));
      } else {
        // Non-encrypted files - upload immediately
        const processedFile = await mockFileUpload(uploadFile);

        setFile(processedFile || createErrorFile(uploadFile, false));
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  // Handle encrypted file upload with password
  const handleEncryptedFileUpload = useCallback(
    async (uploadFile, password) => {
      try {
        const processedFile = await mockFileUpload(uploadFile, password);

        setFile(processedFile || createErrorFile(uploadFile, true));
      } catch (error) {
        setPasswordError(error.message);
      }
    },
    [],
  );

  // Debounced password processing
  const debouncePassword = useMemo(
    () =>
      debounce((uploadFile, password) => {
        if (password && password.length > 0) {
          setPasswordError(null);
          setFileError(null);

          handleEncryptedFileUpload(uploadFile, password);

          // Hide password field after successful entry
          setEncrypted(false);
        } else {
          console.warn('Empty password provided');
        }
      }, DEBOUNCE_WAIT),
    [handleEncryptedFileUpload],
  );

  // Handle file change events
  const handleChange = event => {
    const { detail } = event;
    const { files } = detail;

    if (!files || files.length === 0) {
      // File was removed or upload was cancelled
      setFile(null);
      setPercentUploaded(null);
      setEncrypted(false);
      setFileError(null);
      setPasswordError(null);
      return;
    }

    const uploadFile = files[0];
    handleFileAdded(uploadFile);
  };

  // Handle password change events
  const handlePasswordChange = event => {
    const { detail } = event;
    const { password } = detail;

    if (file && file._originalFile) {
      debouncePassword(file._originalFile, password);
    }
  };

  // Handle component-level errors
  const handleComponentError = event => {
    const { detail } = event;
    const { error } = detail;
    console.error('Component error:', error);
  };

  return (
    <div className="vads-grid-container">
      <div className="vads-grid-row">
        <div className="vads-grid-col-12 desktop:vads-grid-col-6">
          <VaFileInput
            accept=".pdf,.jpeg,.png"
            percentUploaded={percentUploaded}
            encrypted={encrypted}
            error={fileError}
            passwordError={passwordError}
            onVaChange={handleChange}
            onVaPasswordChange={handlePasswordChange}
            onVaFileInputError={handleComponentError}
            hint="Upload a PDF, JPEG, or PNG file. Encrypted PDFs will require a password."
            label="Select a file to upload"
            enableAnalytics
          />
        </div>
        <div className="vads-grid-col-12 desktop:vads-grid-col-6 vads-u-padding-left--3">
          <div>
            <h3>File State Preview</h3>
            <pre
              className="vads-u-background-color--gray-lightest vads-u-padding--1p5 vads-u-border-radius--md vads-u-font-family--mono"
              style={{
                overflow: 'auto',
                maxHeight: '1000px',
                fontSize: '12px',
              }}
            >
              {file && JSON.stringify(file, null, 2)}
            </pre>
          </div>
        </div>
      </div>
      <div className="vads-grid-row vads-u-margin-top--2">
        <va-additional-info trigger="Mock error scenarios">
          <div className="vads-u-margin-top--2 vads-u-padding--1p5 vads-u-background-color--primary-alt-lightest vads-u-border-radius--md vads-u-font-size--sm">
            <h3>Error Testing:</h3>
            <ul className="vads-u-margin-y--1 vads-u-padding-left--2p5">
              <li>
                <strong>Network Error:</strong> Upload file with 'error' in
                filename
                <br />
                <em>→ Watch progress bar reset when error occurs</em>
              </li>
              <li>
                <strong>Server Error:</strong> Upload file with 'server' in
                filename
                <br />
                <em>→ Visual state clears on error for clean retry</em>
              </li>
              <li>
                <strong>Rate Limit:</strong> Upload file with 'limit' in
                filename
                <br />
                <em>→ Component resets to initial appearance</em>
              </li>
              <li>
                <strong>File Size:</strong> Upload file larger than 1MB
                <br />
                <em>→ Error message displayed</em>
              </li>
              <li>
                <strong>Password Error:</strong> Use password shorter than 8
                characters
                <br />
                <em>→ Password field shows validation error</em>
              </li>
            </ul>
          </div>
        </va-additional-info>
      </div>
    </div>
  );
}
