import React from 'react';

export const GetFormHelp = () => (
  <div className="help-footer-box">
    <h2 className="help-heading">Need help?</h2>
    <p>
      Call the GI Bill Hotline at{' '}
      <va-telephone contact="8884424551" /> (TTY: <va-telephone contact="711" />
      ). We&apos;re here Monday through Friday, 8:00 a.m. to 7:00 p.m. ET.
    </p>
    <p>
      You can also{' '}
      <a href="https://www.va.gov/contact-us/">contact us online</a>.
    </p>
  </div>
);

export default GetFormHelp;