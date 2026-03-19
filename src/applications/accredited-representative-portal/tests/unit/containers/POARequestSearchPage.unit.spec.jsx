import React from 'react';
import { render } from '@testing-library/react';
import { expect } from 'chai';
import sinon from 'sinon';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import * as uiModule from 'platform/utilities/ui';

import POARequestSearchPage from '../../../containers/POARequestSearchPage';

describe('POARequestSearchPage', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(uiModule, 'focusElement');
  });

  afterEach(() => {
    sandbox.restore();
  });

  const renderPage = ({
    loaderData = {
      data: [],
      meta: {
        page: {
          total: 0,
          number: 1,
          totalPages: 1,
        },
      },
      showPOA403Alert: false,
    },
    initialEntries = [
      '/?status=pending&sort=newest&perPage=20&page=1&show=false',
    ],
  } = {}) => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          loader: async () => loaderData,
          element: (
            <POARequestSearchPage
              title={{ title: 'Representation requests' }}
            />
          ),
        },
      ],
      { initialEntries },
    );

    return render(<RouterProvider router={router} />);
  };

  it('renders representation requests copy', async () => {
    const { findByText, container } = renderPage();

    await findByText('Representation requests');

    const text = container.textContent;

    expect(text).to.include('Representation requests');
    expect(text).to.include(
      'This list shows representation requests that have been received in the portal over the last 60 days.',
    );
    expect(text).to.include('Here’s how to receive requests in the portal:');

    const additionalInfo = container.querySelector(
      '[data-testid="representation-requests-additional-info"]',
    );

    expect(additionalInfo).to.exist;
    expect(additionalInfo.getAttribute('trigger')).to.equal(
      'Receiving and reviewing requests in the portal',
    );
  });

  it('renders 403 alert copy when alert is shown', async () => {
    const { findByText, container } = renderPage({
      loaderData: {
        data: [],
        meta: {
          page: {
            total: 0,
            number: 1,
            totalPages: 1,
          },
        },
        showPOA403Alert: true,
      },
    });

    await findByText('Representation requests');

    const text = container.textContent;

    expect(text).to.include('This feature hasn’t been activated');
    expect(text).to.include(
      'Veterans Service Organizations (VSOs) have to activate the Representation Requests feature for their organization if they want to receive requests in the portal.',
    );
    expect(text).to.include(
      'This feature is currently not available to claims agents or attorneys.',
    );
  });

  it('renders pending empty state text', async () => {
    const { findByText, container } = renderPage({
      initialEntries: [
        '/?status=pending&sort=newest&perPage=20&page=1&show=false',
      ],
    });

    await findByText('Pending representation requests');

    expect(container.textContent).to.include(
      'No pending representation requests.',
    );
  });

  it('renders processed empty state text', async () => {
    const { findByText, container } = renderPage({
      initialEntries: [
        '/?status=processed&sort=newest&perPage=20&page=1&show=false',
      ],
    });

    await findByText('Processed representation requests');

    expect(container.textContent).to.include(
      'No processed representation requests.',
    );
  });
});
