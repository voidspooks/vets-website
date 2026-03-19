import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { render, fireEvent } from '@testing-library/react';

import AddToCalendarButton from './AddToCalendarButton';
import { createAppointmentData } from '../utils/appointments';

describe('VASS Component: AddToCalendarButton', () => {
  const mockAppointment = createAppointmentData();

  it('should render all content', () => {
    const { getByTestId } = render(
      <AddToCalendarButton appointment={mockAppointment} />,
    );

    expect(getByTestId('add-to-calendar-link')).to.exist;
    expect(getByTestId('add-to-calendar-button')).to.exist;
  });

  it('should click the hidden calendar link when the button is clicked', () => {
    const { getByTestId } = render(
      <AddToCalendarButton appointment={mockAppointment} />,
    );

    const hiddenLink = getByTestId('add-to-calendar-link');
    const clickSpy = sinon.spy(hiddenLink, 'click');

    const button = getByTestId('add-to-calendar-button');
    fireEvent.click(button);

    expect(clickSpy.calledOnce).to.be.true;
    clickSpy.restore();
  });
});
