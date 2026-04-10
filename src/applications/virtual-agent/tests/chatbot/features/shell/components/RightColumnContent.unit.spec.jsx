import { fireEvent, render } from '@testing-library/react';
import { expect } from 'chai';
import React from 'react';
import sinon from 'sinon';

import * as ReactReduxModule from 'react-redux';
import * as ChatConversationModule from '../../../../../chatbot/components/chatbox/ChatConversation';

import RightColumnContent from '../../../../../chatbot/features/shell/components/RightColumnContent';

describe('RightColumnContent', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(ReactReduxModule, 'useDispatch').returns(sinon.stub());
    sandbox
      .stub(ChatConversationModule, 'default')
      .returns(<div data-testid="chat-conversation" />);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('renders the disclaimer and calls onAccept when not accepted', () => {
    const onAccept = sandbox.stub();
    sandbox.stub(ReactReduxModule, 'useSelector').returns(false);

    const { getByTestId } = render(<RightColumnContent onAccept={onAccept} />);

    expect(getByTestId('chatbox-container')).to.exist;
    expect(getByTestId('disclaimer')).to.exist;

    fireEvent.click(getByTestId('btnAcceptDisclaimer'));
    expect(onAccept.calledOnce).to.be.true;
  });

  it('renders the chat conversation when accepted', () => {
    sandbox.stub(ReactReduxModule, 'useSelector').returns(true);

    const { getByTestId, queryByTestId } = render(<RightColumnContent />);

    expect(getByTestId('chat-conversation')).to.exist;
    expect(queryByTestId('disclaimer')).to.equal(null);
  });
});
