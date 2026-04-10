import { fireEvent, render } from '@testing-library/react';
import { expect } from 'chai';
import React from 'react';
import sinon from 'sinon';

import ChatMessageItem from '../../../chatbot/components/chatbox/ChatMessageItem';

describe('ChatMessageItem', () => {
  it('renders a VA message with the VA icon', () => {
    const message = {
      id: 'va-1',
      sender: 'va',
      text: 'Hello from **VA**. [Visit VA.gov](https://www.va.gov)',
    };

    const { container, getByTestId } = render(
      <ul>
        <ChatMessageItem message={message} />
      </ul>,
    );

    expect(container.textContent).to.contain('Hello from VA. Visit VA.gov');
    const link = container.querySelector('a[href="https://www.va.gov"]');
    expect(link).to.exist;
    expect(link.getAttribute('target')).to.equal('_blank');
    expect(link.getAttribute('rel')).to.equal('noopener noreferrer');
    expect(getByTestId('chat-icon-va')).to.exist;
  });

  it('renders a user message with the user icon', () => {
    const message = {
      id: 'user-1',
      sender: 'user',
      text: 'Hello from me',
    };

    const { getByText, getByTestId } = render(
      <ul>
        <ChatMessageItem message={message} />
      </ul>,
    );

    expect(getByText('Hello from me')).to.exist;
    expect(getByTestId('chat-icon-user')).to.exist;
  });

  it('renders assistant option pair and handles primary click', () => {
    const onOptionSelect = sinon.spy();
    const message = {
      id: 'va-2',
      options: ['Home Loan COE', 'Education COE'],
      sender: 'va',
      text: 'Select a topic:',
    };

    const { container, getByTestId } = render(
      <ul>
        <ChatMessageItem message={message} onOptionSelect={onOptionSelect} />
      </ul>,
    );

    expect(getByTestId('chat-message-option-pair')).to.exist;
    const buttonPair = container.querySelector('va-button-pair');
    expect(buttonPair).to.exist;
    buttonPair.__events.primaryClick();
    expect(onOptionSelect.calledOnce).to.equal(true);
    expect(onOptionSelect.firstCall.args[0]).to.equal('Home Loan COE');
  });

  it('renders fallback option buttons when more than two options are present', () => {
    const onOptionSelect = sinon.spy();
    const message = {
      id: 'va-3',
      options: ['One', 'Two', 'Three'],
      sender: 'va',
      text: 'Pick one:',
    };

    const { getAllByTestId, queryByTestId } = render(
      <ul>
        <ChatMessageItem message={message} onOptionSelect={onOptionSelect} />
      </ul>,
    );

    expect(queryByTestId('chat-message-option-pair')).to.be.null;
    const optionButtons = getAllByTestId('chat-message-option');
    expect(optionButtons).to.have.length(3);
    fireEvent.click(optionButtons[2]);
    expect(onOptionSelect.calledOnce).to.equal(true);
    expect(onOptionSelect.firstCall.args[0]).to.equal('Three');
  });
});
