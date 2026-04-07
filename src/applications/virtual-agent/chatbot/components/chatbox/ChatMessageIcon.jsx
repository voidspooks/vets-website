import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

const baseIconStyle = {
  alignItems: 'center',
  borderRadius: '999px',
  display: 'inline-flex',
  flexShrink: 0,
  height: '2rem',
  justifyContent: 'center',
  width: '2rem',
};

/**
 * User icon for message list items.
 * @component
 * @param {object} props
 * @param {boolean} props.user - Indicates if the icon is for the user, otherwise it's for VA
 * @returns {JSX.Element}
 */
export default function ChatMessageIcon({ user }) {
  const spanClassNames = classNames('vads-u-font-size--sm', {
    'vads-u-background-color--primary-darker vads-u-color--white': user,
    'vads-u-color--primary vads-u-background-color--white': !user,
  });

  const iconTextOrLabel = user ? (
    'You'
  ) : (
    <va-icon icon="account_circle" size={4} />
  );
  const testId = user ? 'chat-icon-user' : 'chat-icon-va';

  return (
    <span
      aria-label={iconTextOrLabel}
      className={spanClassNames}
      data-testid={testId}
      role="img"
      style={baseIconStyle}
    >
      {iconTextOrLabel}
    </span>
  );
}

ChatMessageIcon.propTypes = {
  user: PropTypes.bool,
};
