import React from 'react';
import { expect } from 'chai';
import { render, waitFor } from '@testing-library/react';
import sinon from 'sinon';

import * as uiHelpers from 'platform/utilities/ui/webComponents';
import PrivacyPolicy from '../../components/PrivacyPolicy';

describe('22-10278 <PrivacyPolicy>', () => {
  it('renders privacy policy text', () => {
    const { getByTestId } = render(<PrivacyPolicy />);
    expect(getByTestId('privacy-policy-text')).to.exist;
  });

  it('renders a va-link that navigates to the privacy act statement page', () => {
    const { container } = render(<PrivacyPolicy />);
    const vaLink = container.querySelector('va-link');
    expect(vaLink).to.exist;
    expect(vaLink.getAttribute('href')).to.equal(
      '/education/disclose-information-to-third-party/authorize-disclosure-form-22-10278/privacy-act-statement',
    );
    expect(vaLink.getAttribute('text')).to.equal('privacy policy');
  });

  it('sets certify checkbox label when shadow DOM label exists', async () => {
    const fakeLabel = document.createElement('span');
    fakeLabel.setAttribute('part', 'label');
    const fakeCheckbox = document.createElement('va-checkbox');
    fakeCheckbox.appendChild(fakeLabel);

    if (uiHelpers.querySelectorWithShadowRoot.restore) {
      uiHelpers.querySelectorWithShadowRoot.restore();
    }
    const qsStub = sinon.stub(uiHelpers, 'querySelectorWithShadowRoot');
    qsStub.onCall(0).resolves(null);
    qsStub.onCall(1).resolves(fakeCheckbox);
    qsStub.onCall(2).resolves(fakeLabel);

    render(<PrivacyPolicy />);

    await waitFor(() =>
      expect(fakeLabel.innerHTML).to.equal(
        'I certify that the information above is correct and true to the best of my knowledge and belief.',
      ),
    );

    qsStub.restore();
  });
});
