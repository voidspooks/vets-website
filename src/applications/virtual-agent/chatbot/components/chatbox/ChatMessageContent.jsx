/* eslint-disable react/no-danger */
import PropTypes from 'prop-types';
import React from 'react';

import { renderMarkdownToSafeHtml } from '../../utils/markdownRenderer';

/**
 * @typedef {Object} ChatMessageContentProps
 * @property {boolean} isUser
 * @property {string} text
 */

/**
 * Renders chat message text content. User messages render as plain text;
 * assistant messages render as sanitized markdown.
 * @component
 * @param {ChatMessageContentProps} props
 * @returns {JSX.Element}
 */
export default function ChatMessageContent({ isUser, text }) {
  if (isUser) {
    return <p className="vads-u-margin--0">{text}</p>;
  }

  return (
    <div
      className="vads-u-margin--0 va-chatbot-message-content-markdown"
      data-testid="chat-message-content-markdown"
      // sanitized before render
      dangerouslySetInnerHTML={{ __html: renderMarkdownToSafeHtml(text) }}
    />
  );
}

ChatMessageContent.propTypes = {
  isUser: PropTypes.bool.isRequired,
  text: PropTypes.string.isRequired,
};
