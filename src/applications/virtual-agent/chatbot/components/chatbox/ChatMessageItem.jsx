import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import ChatMessageContent from './ChatMessageContent';
import ChatMessageIcon from './ChatMessageIcon';
import ChatMessageOptions from './ChatMessageOptions';

const SENDER_TYPES = {
  USER: 'user',
  VA: 'va',
};

/**
 * @typedef {Object} ChatMessage
 * @property {string} id
 * @property {string} sender
 * @property {string} text
 * @property {string[]} [options]
 */

/**
 * @typedef {Object} ChatMessageItemProps
 * @property {ChatMessage} message
 * @property {(value: string) => void} [onOptionSelect]
 */

const buildBubbleClassNames = isUser => {
  return classNames('vads-u-padding-y--1 vads-u-padding-x--1p5', {
    'vads-u-background-color--primary-alt-lightest vads-u-border-color--primary': !isUser,
    'vads-u-background-color--gray-lightest vads-u-margin-left--auto': isUser,
  });
};

/**
 * Chat message entry item.
 * @component
 * @param {ChatMessageItemProps} props
 * @returns {JSX.Element}
 */
export default function ChatMessageItem({ message, onOptionSelect }) {
  const isUser = message.sender === SENDER_TYPES.USER;
  const messageOptions = Array.isArray(message.options) ? message.options : [];

  return (
    <li
      className="vads-u-display--flex vads-u-align-items--flex-start vads-u-margin-bottom--1p5"
      data-testid="chat-message-item"
    >
      {!isUser && (
        <div className="vads-u-margin-right--1">
          <ChatMessageIcon user={isUser} />
        </div>
      )}

      <div className={buildBubbleClassNames(isUser)}>
        <ChatMessageContent isUser={isUser} text={message.text} />
        {!isUser ? (
          <ChatMessageOptions
            messageId={message.id}
            onOptionSelect={onOptionSelect}
            options={messageOptions}
          />
        ) : null}
      </div>

      {isUser && (
        <div className="vads-u-margin-left--1">
          <ChatMessageIcon user={isUser} />
        </div>
      )}
    </li>
  );
}

ChatMessageItem.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.string.isRequired,
    sender: PropTypes.oneOf([SENDER_TYPES.USER, SENDER_TYPES.VA]).isRequired,
    text: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  onOptionSelect: PropTypes.func,
};
