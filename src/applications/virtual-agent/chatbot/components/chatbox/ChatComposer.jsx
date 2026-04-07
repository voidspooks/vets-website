import { VaTextInput } from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import PropTypes from 'prop-types';
import React, { useRef, useState } from 'react';

export const DEFAULT_CHARACTER_LIMIT = 400;

/**
 * @typedef {Object} ChatComposerProps
 * @property {function(string): void} onSubmit
 * @property {number} [characterLimit]
 * @property {boolean} [disabled]
 */

/**
 * Chat input composer for writing and submitting user messages.
 * @component
 * @param {ChatComposerProps} props
 * @returns {JSX.Element}
 */
export default function ChatComposer({
  onSubmit,
  characterLimit = DEFAULT_CHARACTER_LIMIT,
  disabled = false,
}) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef();

  const onInputHandler = event => {
    const value = event.target.value || '';
    setInputValue(value);

    if (error && value.trim().length > 0) {
      setError('');
    }
  };

  const handleSubmit = event => {
    event.preventDefault();

    const message = inputValue.trim();
    if (disabled) {
      return;
    }

    if (!message || message.length === 0) {
      setError('This field is required');
      return;
    }

    onSubmit(message);
    setInputValue('');

    inputRef.current.value = '';
    setError('');
  };

  const onKeyDownHandler = event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  return (
    <form
      className="vads-u-padding-x--0p5 vads-grid-row vads-u-margin-bottom--1 va-chatbot-composer"
      onSubmit={handleSubmit}
    >
      <div className="vads-grid-col-11">
        {error && (
          <p
            className="vads-u-margin-bottom--0 vads-u-font-weight--bold vads-u-color--secondary-dark vads-u-padding-left--0p5 vads-u-margin-top--0p5"
            data-testid="chat-composer-error"
          >
            {error}
          </p>
        )}
        <VaTextInput
          charcount
          data-testid="chat-composer-input"
          className="va-chatbot-composer__input"
          label="Type your message"
          maxlength={characterLimit.toString()}
          name="chat-composer-input"
          onInput={onInputHandler}
          onKeyDown={onKeyDownHandler}
          ref={inputRef}
          value={inputValue}
          type="text"
          disabled={disabled}
          error={error}
          show-input-error={false}
        />
      </div>

      <div className="vads-grid-col-1 vads-u-padding-left--0p5 vads-u-padding-top--0p5 vads-u-margin-top--0p25">
        {/* imposter component bc icon in va-button not supported, just text */}
        <button
          className="vads-u-margin-x--0 vads-u-padding-x--0p25 vads-u-margin-bottom--3 usa-button-secondary usa-button--outline va-chatbot-composer__submit vads-u-border--0"
          data-testid="chat-composer-submit"
          disabled={disabled}
          type="submit"
        >
          <va-icon
            icon="send"
            size={3}
            srtext="send your message to VA chatbot"
          />
        </button>
      </div>
    </form>
  );
}

ChatComposer.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  characterLimit: PropTypes.number,
  disabled: PropTypes.bool,
};
