import React from 'react';
import { expect } from 'chai';
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import * as redux from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import sinon from 'sinon';

import ProfileSubNav from '../../components/ProfileSubNav';

const defaultRoutes = [
  { path: '/profile/personal-information', name: 'Personal Info' },
  {
    path: '/profile/contact-information',
    name: 'Contact Info',
    requiresLOA3: true,
  },
  {
    path: '/profile/financial-information',
    name: 'Financial information',
    hasSubnav: true,
  },
  {
    path: '/profile/financial-information/direct-deposit',
    name: 'Direct Deposit',
    requiresMVI: true,
    subnavParent: 'Financial information',
  },
];

function renderSubNav(ui, { store }) {
  return render(
    <Provider store={store}>
      <MemoryRouter>{ui}</MemoryRouter>
    </Provider>,
  );
}

describe('ProfileSubNav', () => {
  let sandbox;
  let store;
  let mockState;

  const baseState = {
    directDeposit: { controlInformation: null },
    featureToggles: {},
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    mockState = JSON.parse(JSON.stringify(baseState));
    sandbox
      .stub(redux, 'useSelector')
      .callsFake(selector => selector(mockState));
    store = {
      getState: () => ({}),
      subscribe: () => {},
      dispatch: () => {},
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('renders all routes when requirements are met', () => {
    const { container } = renderSubNav(
      <ProfileSubNav routes={defaultRoutes} isLOA3 isInMVI />,
      {
        store,
      },
    );
    expect(container.querySelector('va-sidenav-item[label="Personal Info"]')).to
      .exist;
    expect(container.querySelector('va-sidenav-item[label="Contact Info"]')).to
      .exist;
    expect(container.querySelector('va-sidenav-item[label="Direct Deposit"]'))
      .to.exist;
  });

  it('filters out LOA3 routes if not LOA3', () => {
    const { container } = renderSubNav(
      <ProfileSubNav routes={defaultRoutes} isLOA3={false} isInMVI />,
      {
        store,
      },
    );
    expect(container.querySelector('va-sidenav-item[label="Personal Info"]')).to
      .exist;
    expect(container.querySelector('va-sidenav-item[label="Contact Info"]')).to
      .not.exist;
    expect(container.querySelector('va-sidenav-item[label="Direct Deposit"]'))
      .to.exist;
  });

  it('filters out LOA3 routes if user is blocked', () => {
    mockState.directDeposit.controlInformation = { isCompetent: false };
    const { container } = renderSubNav(
      <ProfileSubNav routes={defaultRoutes} isLOA3 isInMVI />,
      {
        store,
      },
    );
    expect(container.querySelector('va-sidenav-item[label="Personal Info"]')).to
      .exist;
    expect(container.querySelector('va-sidenav-item[label="Contact Info"]')).to
      .not.exist;
    expect(container.querySelector('va-sidenav-item[label="Direct Deposit"]'))
      .to.exist;
  });

  it('filters out MVI routes if not in MVI', () => {
    const { container } = renderSubNav(
      <ProfileSubNav routes={defaultRoutes} isLOA3 isInMVI={false} />,
      {
        store,
      },
    );
    expect(container.querySelector('va-sidenav-item[label="Personal Info"]')).to
      .exist;
    expect(container.querySelector('va-sidenav-item[label="Contact Info"]')).to
      .exist;
    expect(container.querySelector('va-sidenav-item[label="Direct Deposit"]'))
      .to.not.exist;
  });

  it('calls clickHandler and records event on click', () => {
    const clickHandler = sinon.spy();
    const { container } = renderSubNav(
      <ProfileSubNav
        routes={defaultRoutes}
        isLOA3
        isInMVI
        clickHandler={clickHandler}
      />,
      {
        store,
      },
    );
    const link = container.querySelector(
      'va-sidenav-item[label="Personal Info"]',
    );
    fireEvent(
      link,
      new CustomEvent('vaRouteChange', {
        bubbles: true,
        detail: { href: '/profile/personal-information' },
      }),
    );
    expect(clickHandler.calledOnce).to.be.true;
  });

  describe('VADS side nav implemented', () => {
    beforeEach(() => {
      mockState.featureToggles = {};
    });

    it('renders all routes when requirements are met', () => {
      const { container } = renderSubNav(
        <ProfileSubNav routes={defaultRoutes} isLOA3 isInMVI />,
        {
          store,
        },
      );

      expect(container.querySelector('va-sidenav-item[label="Personal Info"]'))
        .to.exist;
      expect(container.querySelector('va-sidenav-item[label="Contact Info"]'))
        .to.exist;
      expect(container.querySelector('va-sidenav-item[label="Direct Deposit"]'))
        .to.exist;
    });

    it('filters out LOA3 routes if not LOA3', () => {
      const { container } = renderSubNav(
        <ProfileSubNav routes={defaultRoutes} isLOA3={false} isInMVI />,
        {
          store,
        },
      );
      expect(container.querySelector('va-sidenav-item[label="Personal Info"]'))
        .to.exist;
      expect(container.querySelector('va-sidenav-item[label="Contact Info"]'))
        .to.not.exist;
      expect(container.querySelector('va-sidenav-item[label="Direct Deposit"]'))
        .to.exist;
    });

    it('filters out LOA3 routes if user is blocked', () => {
      mockState.directDeposit.controlInformation = { isCompetent: false };
      const { container } = renderSubNav(
        <ProfileSubNav routes={defaultRoutes} isLOA3 isInMVI />,
        {
          store,
        },
      );
      expect(container.querySelector('va-sidenav-item[label="Personal Info"]'))
        .to.exist;
      expect(container.querySelector('va-sidenav-item[label="Contact Info"]'))
        .to.not.exist;
      expect(container.querySelector('va-sidenav-item[label="Direct Deposit"]'))
        .to.exist;
    });

    it('filters out MVI routes if not in MVI', () => {
      const { container } = renderSubNav(
        <ProfileSubNav routes={defaultRoutes} isLOA3 isInMVI={false} />,
        {
          store,
        },
      );
      expect(container.querySelector('va-sidenav-item[label="Personal Info"]'))
        .to.exist;
      expect(container.querySelector('va-sidenav-item[label="Contact Info"]'))
        .to.exist;
      expect(container.querySelector('va-sidenav-item[label="Direct Deposit"]'))
        .to.not.exist;
    });

    it('subnav items are nested under parent', () => {
      const { container } = renderSubNav(
        <ProfileSubNav routes={defaultRoutes} isLOA3 isInMVI />,
        {
          store,
        },
      );

      const parentItem = container.querySelector(
        'va-sidenav-submenu[label="Financial information"]',
      );
      expect(parentItem).to.exist;

      const subnavItem = parentItem.querySelector(
        'va-sidenav-item[label="Direct Deposit"]',
      );
      expect(subnavItem).to.exist;
    });
  });
});
