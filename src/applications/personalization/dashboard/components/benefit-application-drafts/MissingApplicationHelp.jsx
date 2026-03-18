import React from 'react';
import { Toggler } from '~/platform/utilities/feature-toggles';

const MissingApplicationHelp = () => {
  const content = (
    <>
      <p>
        <strong>If you can’t find a draft, it may have expired.</strong> We only
        save drafts for a limited time to help protect your personal data. After
        a draft expires, you’ll need to start over.
      </p>
      <p>
        <strong>
          If an application or form you submitted isn’t listed here,
        </strong>{' '}
        that doesn’t mean that we didn’t receive it. We only list certain
        completed forms here.
      </p>
      <p>
        For help with applications or forms, call us at{' '}
        <va-telephone contact="8008271000" /> (
        <va-telephone contact="711" tty />
        ). We’re here Monday through Friday, 8:00 a.m. to 9:00 p.m. ET.
      </p>
    </>
  );

  return (
    <Toggler toggleName={Toggler.TOGGLE_NAMES.myVaAuthExpRedesignEnabled}>
      <Toggler.Enabled>
        <va-additional-info
          trigger="If you can’t find your application or form"
          data-testid="missing-application-help-additional-info"
        >
          {content}
        </va-additional-info>
      </Toggler.Enabled>
      <Toggler.Disabled>
        <va-accordion open-single="true" data-testid="missing-application-help">
          <va-accordion-item
            header="If you can't find your application or form"
            bordered="true"
          >
            {content}
          </va-accordion-item>
        </va-accordion>
      </Toggler.Disabled>
    </Toggler>
  );
};

export default MissingApplicationHelp;
