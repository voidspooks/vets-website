import React, { useEffect } from 'react';
import { querySelectorWithShadowRoot } from 'platform/utilities/ui/webComponents';

const certifyCheckboxText =
  'I certify that the information above is correct and true to the best of my knowledge and belief.';

const removeOldPrivacyPolicy = async () => {
  const privacyPolicyText = await querySelectorWithShadowRoot(
    'p.short-line',
    document.querySelector('va-statement-of-truth'),
  );
  privacyPolicyText?.setAttribute('style', 'display:none;');
};

const setCertifyCheckboxText = async () => {
  const checkbox = await querySelectorWithShadowRoot(
    'va-checkbox',
    document.querySelector('va-statement-of-truth'),
  );
  const label = await querySelectorWithShadowRoot(
    'span[part="label"]',
    checkbox,
  );
  if (label) {
    label.innerHTML = certifyCheckboxText;
  }
};

const PrivacyPolicy = () => {
  useEffect(() => {
    const initializeComponent = async () => {
      await removeOldPrivacyPolicy();
      await setCertifyCheckboxText();
    };

    initializeComponent();
  }, []);

  return (
    <div>
      <span className="vads-u-display--block vads-u-margin-bottom--2">
        I confirm that the identifying information in this form is accurate and
        has been represented correctly.
      </span>
      <span data-testid="privacy-policy-text">
        I have read and accept the{' '}
        <va-link
          text="privacy policy"
          aria-label="View the privacy policy"
          href="/education/disclose-information-to-third-party/authorize-disclosure-form-22-10278/privacy-act-statement"
          external
        />
        .
      </span>
    </div>
  );
};

export default PrivacyPolicy;
