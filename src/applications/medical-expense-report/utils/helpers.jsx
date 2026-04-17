import { isAfter, isEqual } from 'date-fns';
import environment from '@department-of-veterans-affairs/platform-utilities/environment';
import {
  scrollToFirstError,
  focusElement,
  scrollTo,
} from 'platform/utilities/ui';
import { $ } from 'platform/forms-system/src/js/utilities/ui';

export const isSameOrAfter = (date1, date2) => {
  return isAfter(date1, date2) || isEqual(date1, date2);
};

export const isProductionEnv = () => {
  return (
    !environment.BASE_URL.includes('localhost') &&
    !window.DD_RUM?.getInitConfiguration() &&
    !window.Mocha
  );
};

// TODO: Replace with flippers as needed.
export const showMultiplePageResponse = () =>
  window.sessionStorage.getItem('showMultiplePageResponse') === 'true';

/**
 * Focuses the form-level error alert when a field error is present.
 *
 * @param {number} _index - Unused step index argument to maintain shared helper signature
 * @param {HTMLElement|Document} root - Root node to search for field-level errors
 * @returns {boolean} True when an error was found and focus/scroll behavior was triggered
 */
export const focusFirstError = (_index, root) => {
  const error = $('[error], .usa-input-error', root);
  if (error) {
    scrollToFirstError({ focusOnAlertRole: true });
    return true;
  }
  return false;
};

/**
 * Scrolls to the top of the page and focuses the main heading when no
 * field-level error is found.
 *
 * @param {number} index - Step index used by form-system helpers
 * @param {HTMLElement|Document} root - Root node to search for field-level errors
 */
export const focusH3 = (index, root) => {
  scrollTo('topContentElement');
  if (!focusFirstError(index, root)) {
    // Possibly use focusByOrder
    focusElement('#main h3');
  }
};

/**
 * Formats a numeric currency value for display.
 *
 * - Whole dollar amounts are displayed without cents (e.g. 1000 -> '$1,000')
 * - Amounts with cents are displayed with exactly 2 decimal places (e.g. 10.5 -> '$10.50')
 * - null or undefined values return a fallback string
 *
 * @param {number|null|undefined} amount - The numeric currency value to format
 * @returns {string|null} The formatted currency string (e.g. '$1,000' or '$10.50'),
 *   or null if amount is null or undefined. Use || to provide a fallback:
 *   `formatCurrency(item?.paymentAmount) || 'Amount not provided'`
 *
 * @example
 * formatCurrency(1000)      // '$1,000'
 * formatCurrency(10.5)      // '$10.50'
 * formatCurrency(1234567.89) // '$1,234,567.89'
 * formatCurrency(null)      // null
 * formatCurrency(undefined) // null
 */
export const formatCurrency = amount => {
  if (amount == null) return null;
  return `$${Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
};
