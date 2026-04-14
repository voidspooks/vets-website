import React from 'react';
import { Provider } from 'react-redux';
import { fireEvent, render } from '@testing-library/react';
import { expect } from 'chai';
import sinon from 'sinon-v20';
import ConfirmationPage, {
  TITLE_BY_SUBMISSION_TYPE,
} from '../../../containers/ConfirmationPage';

const MOCK_FORM_DATA = {
  applicantName: { first: 'Jack', middle: 'W', last: 'Smith' },
  signature: 'Jack W Smith',
};

const MOCK_SUBMISSION = {
  timestamp: Date.UTC(2010, 0, 1, 12, 0, 0),
  id: '3702390024',
};

describe('10-10d ConfirmationPage', () => {
  let printSpy;

  const buildFormData = submissionType => ({
    ...MOCK_FORM_DATA,
    'view:form1010dEnhancedFlowEnabled': true,
    submissionType,
  });

  const expectTextInAllNodes = (nodes, expectedText) => {
    expect(nodes.length).to.be.greaterThan(0);
    [...nodes].forEach(node => expect(node).to.contain.text(expectedText));
  };

  const subject = ({
    submission = MOCK_SUBMISSION,
    formData = MOCK_FORM_DATA,
  } = {}) => {
    const mockStore = {
      getState: () => ({ form: { submission, data: formData } }),
      subscribe: () => {},
      dispatch: () => {},
    };
    const { container } = render(
      <Provider store={mockStore}>
        <ConfirmationPage />
      </Provider>,
    );
    const selectors = () => ({
      alertHeadline: container.querySelectorAll(
        '[data-testid="1010d-confirmation-headline"]',
      ),
      newFormType: container.querySelectorAll(
        '[data-testid="1010d-confirmation-new-form"]',
      ),
      printBtn: container.querySelector('va-button'),
      submissionDate: container.querySelector('.submission-date'),
    });
    return { selectors };
  };

  beforeEach(() => {
    printSpy = sinon.spy();
    Object.defineProperty(window, 'print', {
      value: printSpy,
      configurable: true,
    });
  });

  afterEach(() => {
    printSpy.resetHistory();
  });

  it('should not render submission date container when there is no response data', () => {
    const { selectors } = subject({ submission: { timestamp: false } });
    expect(selectors().submissionDate).to.not.exist;
  });

  it('should render application date container when there is response data', () => {
    const { selectors } = subject();
    const expectedResult = 'January 1, 2010';
    expect(selectors().submissionDate).to.contain.text(expectedResult);
  });

  it('should fire the correct event when the print button is clicked', () => {
    const { selectors } = subject();
    fireEvent.click(selectors().printBtn);
    sinon.assert.calledOnce(printSpy);
  });

  it('should render the additional submitted form name for new submissions', () => {
    const { selectors } = subject({ formData: buildFormData('new') });
    expect(selectors().newFormType).to.have.length(2);
  });

  it('should not render the additional submitted form name for non-new submissions', () => {
    ['existing', 'enrollment'].forEach(submissionType => {
      const { selectors } = subject({
        formData: buildFormData(submissionType),
      });
      expect(selectors().newFormType).to.have.length(0);
    });
  });

  Object.entries(TITLE_BY_SUBMISSION_TYPE).forEach(
    ([submissionType, expectedTitle]) => {
      it(`should render the ${submissionType} confirmation headline in screen and print views`, () => {
        const { selectors } = subject({
          formData: buildFormData(submissionType),
        });
        expectTextInAllNodes(selectors().alertHeadline, expectedTitle);
      });
    },
  );
});
