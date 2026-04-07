import recordEvent from '@department-of-veterans-affairs/platform-monitoring/record-event';
import PropTypes from 'prop-types';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ACCEPTED } from '../../../../../webchat/reducers';
import { clearBotSessionStorage } from '../../../../../webchat/utils/sessionStorage';
import ChatboxContainer from '../../../../components/chatbox/ChatboxContainer';
import ChatConversation from '../../../../components/chatbox/ChatConversation';
import { selectChatbotHasAcceptedDisclaimer } from '../../../../store';
import AiDisclaimer from './AiDisclaimer';

/**
 * Handle click on the accept disclaimer button
 * @param {Function} dispatch Redux dispatch function
 * @param {Function} [onAccept] Optional callback function to call on accept, used to dispatch new chatbotActions.acceptDisclaimer action from Shell component
 * @returns void
 */
function onClick(dispatch, onAccept) {
  if (onAccept) {
    onAccept();
    return;
  }

  // everything below is the legacy behavior
  recordEvent({
    action: 'click',
    'button-type': 'default',
    event: 'cta-button-click',
    'button-click-label': 'Start Chat',
    'button-background-color': 'blue',
    time: new Date(),
  });
  clearBotSessionStorage(true);

  dispatch({ type: ACCEPTED });
}

/**
 * @typedef {Object} RightContentProps
 * @property {function(): void} onAccept - Click handler for accepting the disclaimer
 */

/**
 * Right column content component that houses the disclaimer and chatbot UI.
 * Used on the Shell component to house all the static page content for the right column, including the disclaimer and chatbot container.
 * @component
 * @param {RightContentProps} props Component props
 * @returns jsx.Element
 *
 */
export default function RightColumnContent({ onAccept }) {
  const dispatch = useDispatch();
  const hasAcceptedDisclaimer = useSelector(selectChatbotHasAcceptedDisclaimer);
  const chatboxBodyClassName = hasAcceptedDisclaimer
    ? 'va-chatbot-chatbox-container--conversation'
    : 'va-chatbot-chatbox-container--disclaimer';

  return (
    <ChatboxContainer bodyClassName={chatboxBodyClassName}>
      {!hasAcceptedDisclaimer ? (
        <div className="va-chatbot-disclaimer" data-testid="disclaimer">
          <div className="va-chatbot-disclaimer__content">
            <va-alert status="info">
              <h3 slot="headline">About this chatbot</h3>

              <div className="vads-u-width--full">
                <ul>
                  <li>
                    Our chatbot can’t help you if you’re experiencing a
                    personal, medical, or mental health emergency. Go to the
                    nearest emergency room, dial 988 and press 1 for mental
                    health support, or call 911 to get medical care right away.
                    <br />
                    <va-link
                      href="/health-care/health-needs-conditions/mental-health/"
                      text="Learn more about VA mental health services"
                      external
                    />
                  </li>
                  <li>
                    Please don’t type any personal information such as your
                    name, address, or anything else that can be used to identify
                    you.
                  </li>
                  <AiDisclaimer />
                </ul>
                <va-button
                  class="medium-screen:vads-u-margin-left--3"
                  id="btnAcceptDisclaimer"
                  data-testid="btnAcceptDisclaimer"
                  text="Start chat"
                  onClick={() => onClick(dispatch, onAccept)}
                />
              </div>
            </va-alert>
          </div>
        </div>
      ) : (
        <ChatConversation />
      )}
    </ChatboxContainer>
  );
}

RightColumnContent.propTypes = {
  onAccept: PropTypes.func,
};
