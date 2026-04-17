import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom-v5-compat';
import InnerNavigation from '../../../components/shared/InnerNavigation';
import { Paths } from '../../../util/constants';

describe('InnerNavigation component', () => {
  let matchMediaStub;
  let listeners;

  const stubMatchMedia = matches => {
    listeners = [];
    matchMediaStub = sinon.stub(window, 'matchMedia').returns({
      matches,
      addEventListener: (_, handler) => listeners.push(handler),
      removeEventListener: sinon.stub(),
    });
  };

  afterEach(() => {
    matchMediaStub?.restore();
  });

  const setup = (path = '/', isMobile = false) => {
    stubMatchMedia(isMobile);
    return render(
      <MemoryRouter initialEntries={[path]}>
        <InnerNavigation />
      </MemoryRouter>,
    );
  };

  it('renders all three tabs', () => {
    const screen = setup();
    expect(screen.getByTestId('landing-inner-nav')).to.exist;
    expect(screen.getByTestId('list-inner-nav')).to.exist;
    expect(screen.getByTestId('refill-status-inner-nav')).to.exist;
  });

  describe('desktop labels', () => {
    it('displays full labels on desktop', () => {
      const screen = setup('/', false);
      expect(screen.getByText('Medication Refills')).to.exist;
      expect(screen.getByText('Medications List')).to.exist;
      expect(screen.getByText('Refill Status')).to.exist;
    });
  });

  describe('mobile labels', () => {
    it('displays correct labels on mobile', () => {
      const screen = setup('/', true);
      expect(screen.getByText('Med refills')).to.exist;
      expect(screen.getByText('Meds list')).to.exist;
      expect(screen.getByText('Refill Status')).to.exist;
    });
  });

  describe('active link styling', () => {
    it('marks the landing (refill) tab as active when on /', () => {
      const screen = setup('/');
      const link = screen.getByTestId('landing-inner-nav').querySelector('a');
      expect(link.getAttribute('aria-current')).to.equal('page');
    });

    it('marks the list tab as active when on /list', () => {
      const screen = setup(Paths.LIST);
      const link = screen.getByTestId('list-inner-nav').querySelector('a');
      expect(link.getAttribute('aria-current')).to.equal('page');
    });

    it('marks the refill status tab as active when on /refill-status', () => {
      const screen = setup(Paths.REFILL_STATUS);
      const link = screen
        .getByTestId('refill-status-inner-nav')
        .querySelector('a');
      expect(link.getAttribute('aria-current')).to.equal('page');
    });

    it('does not mark non-active tabs with aria-current', () => {
      const screen = setup('/');
      const historyLink = screen
        .getByTestId('list-inner-nav')
        .querySelector('a');
      const refillStatusLink = screen
        .getByTestId('refill-status-inner-nav')
        .querySelector('a');
      expect(historyLink.getAttribute('aria-current')).to.be.null;
      expect(refillStatusLink.getAttribute('aria-current')).to.be.null;
    });
  });
});
