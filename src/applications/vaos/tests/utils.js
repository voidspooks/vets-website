/**
 * Function to match text contained within a HTML span within a span.
 *
 * NOTE: RTL 'getByText' works for single span elements but sometimes not for
 * nested spans.
 * Example: <span>Clinic: <span>Clinic 1</span></span>
 *
 * @export
 * @param {Object} arguments
 * @param {String} [arguments.htmlElement='span'] - HTML element name to search for text.
 * @param {String} [arguments.text] - Text to search for.
 * @returns A function to be used with RTL 'getByText' function.
 */
export function textMatcher({ htmlElement = 'span', text } = {}) {
  const _textMatcher = (content, element) => {
    return (
      element.tagName.toLowerCase() === htmlElement &&
      element.textContent === text
    );
  };
  _textMatcher.toString = () => text;

  return _textMatcher;
}

/**
 * Helper to select a radio button option using VaRadio custom events
 * (shadow DOM compatible)
 * @param {String} testId - The data-testid of the radio button set
 * @param {Object} screen - RTL screen object
 * @param {string} value - The value of the item to test, such as the TypeOfCareId
 */
export async function selectRadioButton(testId, screen, value) {
  const radioButton = await screen.findByTestId(testId);
  radioButton.__events.vaValueChange({ detail: { value } });
}
