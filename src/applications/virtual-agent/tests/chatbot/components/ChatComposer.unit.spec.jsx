import { fireEvent, render } from '@testing-library/react';
import { expect } from 'chai';
import React from 'react';
import sinon from 'sinon';

import ChatComposer, {
  DEFAULT_CHARACTER_LIMIT,
} from '../../../chatbot/components/chatbox/ChatComposer';

describe('ChatComposer', () => {
  it('uses the default character limit', () => {
    const onSubmit = sinon.stub();
    const { getByTestId } = render(<ChatComposer onSubmit={onSubmit} />);

    expect(getByTestId('chat-composer-input').getAttribute('maxlength')).to.eq(
      DEFAULT_CHARACTER_LIMIT.toString(),
    );
  });

  it('submits a trimmed message', () => {
    const onSubmit = sinon.stub();
    const { getByTestId } = render(
      <ChatComposer characterLimit={10} onSubmit={onSubmit} />,
    );

    const input = getByTestId('chat-composer-input');
    input.value = '  hello ';
    fireEvent.input(input);
    expect(input.getAttribute('maxlength')).to.equal('10');

    fireEvent.submit(input.closest('form'));

    expect(onSubmit.calledOnce).to.be.true;
    expect(onSubmit.firstCall.args[0]).to.equal('hello');
    expect(input.value).to.equal('');
  });

  it('does not submit empty or whitespace-only values', () => {
    const onSubmit = sinon.stub();
    const { getByTestId, getByText } = render(
      <ChatComposer onSubmit={onSubmit} />,
    );

    const input = getByTestId('chat-composer-input');
    input.value = '   ';
    fireEvent.input(input);
    fireEvent.submit(input.closest('form'));

    expect(onSubmit.called).to.be.false;
    expect(getByText('This field is required')).to.exist;
  });

  it('disables input and submit button when disabled', () => {
    const onSubmit = sinon.stub();
    const { getByTestId } = render(
      <ChatComposer disabled onSubmit={onSubmit} />,
    );

    expect(getByTestId('chat-composer-input').hasAttribute('disabled')).to.be
      .true;
    expect(getByTestId('chat-composer-submit').disabled).to.be.true;
  });
});
