import React from 'react';
import { render } from '@testing-library/react';
import { expect } from 'chai';
import sinon from 'sinon';
import { MemoryRouter } from 'react-router-dom';
import * as uiModule from 'platform/utilities/ui';

import HelpPage from '../../../containers/HelpPage';

describe('HelpPage', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(uiModule, 'focusElement');
  });

  afterEach(() => {
    sandbox.restore();
  });

  const renderPage = ({ initialEntries = ['/'] } = {}) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <HelpPage title="Get help with the Accredited Representative Portal" />
      </MemoryRouter>,
    );
  };

  it('renders the page heading', () => {
    const { getByTestId } = renderPage();

    expect(getByTestId('get-help-page-heading').textContent).to.equal(
      'Get help with the Accredited Representative Portal',
    );
  });

  it('renders establishing representation copy', () => {
    const { container } = renderPage();

    const text = container.textContent;

    expect(text).to.include(
      'You can quickly establish representation (power of attorney) using the Representation Requests feature in the portal.',
    );
    expect(text).to.include(
      'Veterans Service Organizations (VSOs) have to activate the Representation Requests feature for their organization if they want to receive requests in the portal.',
    );
    expect(text).to.include('Here’s how to receive requests in the portal:');
    expect(text).to.include(
      'The portal shows a list of requests for your Veterans Service Organization (VSO) that have been received in the portal over the last 60 days.',
    );
  });
});
