import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect } from 'chai';
import sinon from 'sinon';
import Autosuggest from '../../../../components/search-form/autosuggest';
import { SR_ANNOUNCE_DELAY_MS } from '../../../../constants';

const mockOptions = [
  { id: '1', toDisplay: 'Portland, Oregon, United States' },
  { id: '2', toDisplay: 'Porter Ranch, California, United States' },
  { id: '3', toDisplay: 'Porterville, California, United States' },
];

function StatusAnnouncementWrapper({ optionsList = mockOptions }) {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);

  return (
    <Autosuggest
      inputId="status-test"
      inputValue={inputValue}
      onInputValueChange={e => {
        const val = e.inputValue || '';
        setInputValue(val);
        setOptions(val.length >= 3 ? optionsList : []);
      }}
      handleOnSelect={() => {}}
      label={<span>Search</span>}
      options={options}
      onClearClick={() => {
        setInputValue('');
        setOptions([]);
      }}
      keepDataOnBlur
      showOptionsRestriction
    />
  );
}

StatusAnnouncementWrapper.propTypes = {
  optionsList: PropTypes.array,
};

describe('Autosuggest SR status announcement', () => {
  let clock;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    clock.restore();
  });

  it('announces result count after delay when options appear', () => {
    const screen = render(<StatusAnnouncementWrapper />);
    const input = screen.getByRole('combobox');

    userEvent.type(input, 'Port');

    // Before delay, status should be empty
    const statusDiv = screen.getByRole('status');
    expect(statusDiv.textContent).to.equal('');

    // After the SR announce delay, status should show result count
    clock.tick(SR_ANNOUNCE_DELAY_MS);
    expect(statusDiv.textContent).to.equal('3 results for Port');
  });

  it('uses singular "result" for a single match', () => {
    const singleOption = [
      { id: '1', toDisplay: 'Portland, Oregon, United States' },
    ];
    const screen = render(
      <StatusAnnouncementWrapper optionsList={singleOption} />,
    );
    const input = screen.getByRole('combobox');

    userEvent.type(input, 'Port');
    clock.tick(SR_ANNOUNCE_DELAY_MS);

    const statusDiv = screen.getByRole('status');
    expect(statusDiv.textContent).to.equal('1 result for Port');
  });

  it('clears status message when input is cleared', () => {
    const screen = render(<StatusAnnouncementWrapper />);
    const input = screen.getByRole('combobox');

    userEvent.type(input, 'Port');
    clock.tick(SR_ANNOUNCE_DELAY_MS);

    const statusDiv = screen.getByRole('status');
    expect(statusDiv.textContent).to.equal('3 results for Port');

    // Clear the input
    userEvent.clear(input);
    expect(statusDiv.textContent).to.equal('');
  });

  it('does not announce when input is below minimum characters', () => {
    const screen = render(<StatusAnnouncementWrapper />);
    const input = screen.getByRole('combobox');

    userEvent.type(input, 'Po');
    clock.tick(SR_ANNOUNCE_DELAY_MS);

    const statusDiv = screen.getByRole('status');
    expect(statusDiv.textContent).to.equal('');
  });

  it('announces "No results available." when there are zero results', () => {
    const screen = render(<StatusAnnouncementWrapper optionsList={[]} />);
    const input = screen.getByRole('combobox');

    userEvent.type(input, 'Port');
    clock.tick(SR_ANNOUNCE_DELAY_MS);

    const statusDiv = screen.getByRole('status');
    expect(statusDiv.textContent).to.equal('No results available.');
  });

  it('debounces announcements when input changes rapidly', () => {
    const screen = render(<StatusAnnouncementWrapper />);
    const input = screen.getByRole('combobox');

    userEvent.type(input, 'Por');
    clock.tick(SR_ANNOUNCE_DELAY_MS / 2);

    // Type another character before delay finishes
    userEvent.type(input, 't');
    clock.tick(SR_ANNOUNCE_DELAY_MS);

    const statusDiv = screen.getByRole('status');
    // Should only announce the final input value
    expect(statusDiv.textContent).to.equal('3 results for Port');
  });
});
