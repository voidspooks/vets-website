import PropTypes from 'prop-types';
import React from 'react';

/**
 * @typedef {Object} ChatTypingIndicatorProps
 * @property {boolean} isTyping
 * @property {string} [label]
 */

/**
 * Typing indicator shown while waiting for a simulated bot response.
 * @component
 * @param {ChatTypingIndicatorProps} props
 * @returns {JSX.Element|null}
 */
export default function ChatTypingIndicator({
  isTyping,
  label = 'VA chatbot is typing',
}) {
  if (!isTyping) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className="va-chatbot-typing-indicator"
      data-testid="chat-typing-indicator"
      role="status"
    >
      <span className="vads-u-margin-right--1 sr-only">{label}</span>
      <span aria-hidden="true" className="va-chatbot-typing-indicator__dots">
        <span className="va-chatbot-typing-indicator__dot" />
        <span className="va-chatbot-typing-indicator__dot" />
        <span className="va-chatbot-typing-indicator__dot" />
      </span>
    </div>
  );
}

ChatTypingIndicator.propTypes = {
  isTyping: PropTypes.bool.isRequired,
  label: PropTypes.string,
};
