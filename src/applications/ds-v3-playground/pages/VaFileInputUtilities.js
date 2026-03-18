/* eslint-disable no-console */
import { standardFileChecks } from 'platform/forms-system/src/js/utilities/file';

export const DEBOUNCE_WAIT = 1000;

/**
 * Simulates error scenarios based on filename patterns
 * @param {File} file - The file to check
 * @param {string|null} password - Optional password for encrypted files
 * @returns {Object|null} Error object with type and message, or null if no error
 */
export const shouldSimulateError = (file, password = null) => {
  const fileName = file.name.toLowerCase();

  if (fileName.includes('error')) {
    return {
      type: 'network',
      message: 'Network error occurred during upload. Please try again.',
    };
  }

  if (fileName.includes('server')) {
    return {
      type: 'server',
      message: 'Server error: Unable to process file at this time.',
    };
  }

  if (fileName.includes('limit')) {
    return {
      type: 'rate_limit',
      message: 'Rate limit exceeded. Please wait before uploading again.',
    };
  }

  if (file.size > 1024 * 1024) {
    return {
      type: 'file_size',
      message: 'File size exceeds 1MB limit.',
    };
  }

  if (password && password.length < 8) {
    return {
      type: 'password',
      message: 'Password must be at least 8 characters long.',
    };
  }

  return null;
};

/**
 * Simulates upload progress with incremental updates
 * @param {Function} setProgress - State setter function for progress
 * @param {number|null} index - Optional index for array-based state
 * @returns {Promise} Resolves when progress reaches 100%
 */
export const simulateUploadProgress = (setProgress, index = null) => {
  return new Promise(resolve => {
    let currentProgress = 0;

    const incrementProgress = () => {
      if (index !== null) {
        setProgress(prev => {
          const newPercents = [...prev];
          newPercents[index] = currentProgress;
          return newPercents;
        });
      } else {
        setProgress(currentProgress);
      }

      currentProgress += 20;

      if (currentProgress <= 100) {
        setTimeout(incrementProgress, 100);
      } else {
        resolve();
      }
    };

    incrementProgress();
  });
};

/**
 * Creates a successful upload response object
 * @param {File} file - The uploaded file
 * @returns {Object} Upload response with metadata
 */
export const createUploadResponse = file => {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    status: 'uploaded',
    encrypted: false,
    confirmationCode: `CONF-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)}`,
    uploadDate: new Date().toISOString(),
    _originalFile: file,
  };
};

/**
 * Checks if a file is an encrypted PDF
 * @param {File} file - The file to check
 * @returns {Promise<boolean>} True if file is encrypted PDF
 */
export const checkIfEncrypted = async file => {
  try {
    const fileChecks = await standardFileChecks(file);
    return fileChecks.checkIsEncryptedPdf;
  } catch (error) {
    console.error('Error checking file encryption:', error);
    return false;
  }
};

/**
 * Creates a pending password file object
 * @param {File} file - The file awaiting password
 * @returns {Object} File object with pending_password status
 */
export const createPendingPasswordFile = file => {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    status: 'pending_password',
    encrypted: true,
    _originalFile: file,
  };
};

/**
 * Creates an error file object
 * @param {File} file - The file that failed
 * @param {boolean} encrypted - Whether the file is encrypted
 * @returns {Object} File object with error status
 */
export const createErrorFile = (file, encrypted = false) => {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    status: 'error',
    encrypted,
    _originalFile: file,
  };
};
