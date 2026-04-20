import React from 'react';
import { render } from '@testing-library/react';
import { expect } from 'chai';
import {
  $,
  $$,
} from '@department-of-veterans-affairs/platform-forms-system/ui';

import { NeedHelp } from '../../components/NeedHelp';

describe('<NeedHelp>', () => {
  it('should render', () => {
    const { container } = render(<NeedHelp />);
    expect($('va-need-help', container)).to.exist;
    expect($$('va-telephone', container).length).to.equal(2);
  });

  it('should render CHAMPVA inline TTY and Ask VA link', () => {
    const claim = {
      attributes: {
        claimStatusMeta: {
          help: {
            phone: '8007338387',
            tty: '711',
            inlineTty: true,
            hours: 'Monday through Friday, 8:00 a.m. to 7:30 p.m. ET.',
            intro:
              'If you have questions about your CHAMPVA application, call us',
            askVa: {
              text: 'You can also use Ask VA to ask questions online.',
              linkText: 'Go to Ask VA',
              linkUrl: 'https://ask.va.gov/',
            },
          },
        },
      },
    };
    const { container } = render(<NeedHelp claim={claim} />);
    expect($('va-need-help', container)).to.exist;
    expect($$('va-telephone', container).length).to.equal(2);
    expect(container.textContent).to.include(
      'If you have questions about your CHAMPVA application, call us',
    );
    expect(container.textContent).to.include(
      'You can also use Ask VA to ask questions online.',
    );
    expect($('va-link', container)).to.exist;
  });
  it('should render updated UI', () => {
    const item = {
      closedDate: null,
      description: '21-4142 text',
      displayName: '21-4142/21-4142a',
      friendlyName: 'Authorization to Disclose Information',
      friendlyDescription: 'good description',
      canUploadFile: true,
      supportAliases: ['VA Form 21-4142'],
      id: 14268,
      overdue: true,
      receivedDate: null,
      requestedDate: '2024-03-07',
      status: 'NEEDED_FROM_YOU',
      suspenseDate: '2024-04-07',
      uploadsAllowed: true,
      documents: '[]',
      date: '2024-03-07',
    };
    const { container } = render(<NeedHelp item={item} />);
    expect($('va-need-help', container)).to.exist;
    expect($$('va-telephone', container).length).to.equal(2);
    const boldElements = $$('.vads-u-font-weight--bold', container);
    expect(boldElements[0].textContent).to.include(
      'authorization to Disclose Information',
    );
    expect(boldElements[1].textContent).to.include('VA Form 21-4142');
  });

  it('should render aliases with commas and "or" correctly', () => {
    const item = {
      supportAliases: ['Alias1', 'Alias2', 'Alias3', 'Alias4'],
      friendlyName: 'Friendly name',
    };

    const { container } = render(<NeedHelp item={item} />);

    expect(container.textContent).to.include(
      '“Alias1”, “Alias2”, “Alias3” or “Alias4.”',
    );
  });

  it('should preserve casing if friendlyName is a proper noun', () => {
    const item = {
      displayName: 'displayKey',
      supportAliases: ['Alias1'],
      friendlyName: 'Friendly Name',
      isProperNoun: true,
    };

    const { container } = render(<NeedHelp item={item} />);
    expect(container.textContent).to.include('Friendly Name');
  });

  it('should lowercase friendlyName if not a proper noun', () => {
    const item = {
      displayName: 'displayKey',
      supportAliases: ['Alias1'],
      friendlyName: 'Friendly Name',
      isProperNoun: false,
    };

    const { container } = render(<NeedHelp item={item} />);
    expect(container.textContent).to.include('friendly Name');
  });
});
