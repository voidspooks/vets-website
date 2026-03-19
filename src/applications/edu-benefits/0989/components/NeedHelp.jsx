import React from 'react';

export default function NeedHelp() {
  return (
    <div className="usa-width-two-thirds medium-8 columns print-full-width">
      <va-need-help>
        <div slot="content">
          <p>
            <strong>If you have trouble using this online form,</strong> call us
            at <va-telephone contact="8006982411" /> (
            <va-telephone contact="711" tty />
            ). We’re here 24/7.
          </p>
          <p>
            <strong>
              If you need help gathering your information or filling out your
              form,
            </strong>{' '}
            contact a local Veterans Service Organization (VSO).
          </p>
          <p>
            <a
              href="https://www.va.gov/get-help-from-accredited-representative/find-rep/"
              target="_blank"
              rel="noreferrer"
            >
              Find a local Veterans Service Organization
            </a>
          </p>
        </div>
      </va-need-help>
    </div>
  );
}
