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
    expect(screen.getByTestId('history-inner-nav')).to.exist;
    expect(screen.getByTestId('in-progress-inner-nav')).to.exist;
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

    it('marks the history tab as active when on /history', () => {
      const screen = setup(Paths.HISTORY);
      const link = screen.getByTestId('history-inner-nav').querySelector('a');
      expect(link.getAttribute('aria-current')).to.equal('page');
    });

    it('marks the in-progress tab as active when on /in-progress', () => {
      const screen = setup(Paths.IN_PROGRESS);
      const link = screen
        .getByTestId('in-progress-inner-nav')
        .querySelector('a');
      expect(link.getAttribute('aria-current')).to.equal('page');
    });

    it('does not mark non-active tabs with aria-current', () => {
      const screen = setup('/');
      const historyLink = screen
        .getByTestId('history-inner-nav')
        .querySelector('a');
      const inProgressLink = screen
        .getByTestId('in-progress-inner-nav')
        .querySelector('a');
      expect(historyLink.getAttribute('aria-current')).to.be.null;
      expect(inProgressLink.getAttribute('aria-current')).to.be.null;
    });
  });
});
