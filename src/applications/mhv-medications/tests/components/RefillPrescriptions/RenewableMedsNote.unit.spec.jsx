import React from 'react';
import { renderWithStoreAndRouterV6 } from '@department-of-veterans-affairs/platform-testing/react-testing-library-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import RenewableMedsNote from '../../../components/RefillPrescriptions/RenewableMedsNote';

describe('RenewableMedsNote', () => {
  const setup = (props = {}) => {
    const defaultProps = {
      testId: 'test-renewable-meds-link',
      onLinkClick: sinon.spy(),
      className: '',
      ...props,
    };

    return {
      ...renderWithStoreAndRouterV6(<RenewableMedsNote {...defaultProps} />, {
        initialState: {},
        reducers: {},
        initialEntries: ['/refill'],
      }),
      props: defaultProps,
    };
  };

  it('renders without errors', () => {
    const { container } = setup();
    expect(container).to.exist;
  });

  it('displays the note text', () => {
    const { getByTestId } = setup();
    const note = getByTestId('test-renewable-meds-link-note');
    expect(note).to.contain.text('Note:');
    expect(note).to.contain.text('you may have already requested a refill');
  });

  it('renders the link to renewable medications', () => {
    const { getByTestId } = setup();
    const link = getByTestId('test-renewable-meds-link');
    expect(link).to.exist;
    expect(link).to.contain.text('Go to your list of renewable medications');
  });

  it('link navigates to /history', () => {
    const { getByTestId } = setup();
    const link = getByTestId('test-renewable-meds-link');
    expect(link.getAttribute('href')).to.equal('/history');
  });

  it('calls onLinkClick when the link is clicked', () => {
    const { getByTestId, props } = setup();
    const link = getByTestId('test-renewable-meds-link');
    link.click();
    expect(props.onLinkClick.calledOnce).to.be.true;
  });

  it('applies custom className when provided', () => {
    const { getByTestId } = setup({ className: 'custom-class' });
    const note = getByTestId('test-renewable-meds-link-note');
    expect(note.className).to.include('custom-class');
  });

  it('has the correct Datadog action name attribute', () => {
    const { getByTestId } = setup();
    const link = getByTestId('test-renewable-meds-link');
    expect(link.getAttribute('data-dd-action-name')).to.equal(
      'Go To Your Medications List Action Link - Refill Page - Renew Section',
    );
  });
});
