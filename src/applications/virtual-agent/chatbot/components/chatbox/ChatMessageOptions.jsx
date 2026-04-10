import {
  VaButton,
  VaButtonPair,
} from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * @typedef {Object} ChatMessageOptionsProps
 * @property {string} messageId
 * @property {string[]} options
 * @property {(value: string) => void} [onOptionSelect]
 */

/**
 * Renders assistant follow-up option buttons.
 * @component
 * @param {ChatMessageOptionsProps} props
 * @returns {JSX.Element | null}
 */
export default function ChatMessageOptions({
  messageId,
  onOptionSelect,
  options,
}) {
  if (!Array.isArray(options) || options.length === 0) {
    return null;
  }

  if (options.length === 2) {
    return (
      <div className="vads-u-margin-top--0p5">
        <VaButtonPair
          data-testid="chat-message-option-pair"
          leftButtonText={options[0]}
          onPrimaryClick={() => onOptionSelect?.(options[0])}
          onSecondaryClick={() => onOptionSelect?.(options[1])}
          rightButtonText={options[1]}
        />
      </div>
    );
  }

  return (
    <div className="vads-u-margin-top--0p5 vads-u-display--flex vads-u-flex-direction--column">
      {options.map((option, index) => (
        <VaButton
          className={index > 0 ? 'vads-u-margin-top--0p5' : ''}
          data-testid="chat-message-option"
          key={`${messageId}-option-${option}`}
          onClick={() => onOptionSelect?.(option)}
          text={option}
        />
      ))}
    </div>
  );
}

ChatMessageOptions.propTypes = {
  messageId: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  onOptionSelect: PropTypes.func,
};
