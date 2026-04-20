import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { PreSubmitInfo2 } from '../../../components/PreSubmitInfo2';

describe('COE PreSubmitInfo2', () => {
  it('renders a va-statement-of-truth with the expected heading and input label', () => {
    const { container } = render(
      <PreSubmitInfo2
        formData={{}}
        showError={false}
        onSectionComplete={() => {}}
      />,
    );

    const sot = container.querySelector('va-statement-of-truth');
    expect(sot).to.exist;
    expect(sot.getAttribute('heading')).to.equal('Certification and Signature');
    expect(sot.getAttribute('input-label')).to.equal('Your full name');
  });

  it('renders the statement of truth body text', () => {
    const { container } = render(
      <PreSubmitInfo2
        formData={{}}
        showError={false}
        onSectionComplete={() => {}}
      />,
    );
    expect(container.textContent).to.include(
      'I confirm that the identifying information in this form is accurate',
    );
  });

  it('does not show input or checkbox errors on initial render', () => {
    const { container } = render(
      <PreSubmitInfo2
        formData={{}}
        showError={false}
        onSectionComplete={() => {}}
      />,
    );
    const sot = container.querySelector('va-statement-of-truth');
    expect(sot.getAttribute('input-error')).to.be.null;
    expect(sot.getAttribute('checkbox-error')).to.be.null;
  });

  it('calls onSectionComplete with the checkbox value when the checkbox changes', async () => {
    const onSectionComplete = sinon.spy();
    const { container } = render(
      <PreSubmitInfo2
        formData={{}}
        showError={false}
        onSectionComplete={onSectionComplete}
      />,
    );
    const sot = container.querySelector('va-statement-of-truth');

    fireEvent(
      sot,
      new CustomEvent('vaCheckboxChange', { detail: { checked: true } }),
    );

    await waitFor(() => {
      expect(onSectionComplete.calledOnce).to.be.true;
      expect(onSectionComplete.firstCall.args[0]).to.be.true;
    });
  });

  it('shows a checkbox error when showError is true and the box is unchecked', async () => {
    const { container } = render(
      <PreSubmitInfo2 formData={{}} showError onSectionComplete={() => {}} />,
    );
    await waitFor(() => {
      const sot = container.querySelector('va-statement-of-truth');
      expect(sot.getAttribute('checkbox-error')).to.equal(
        'You must certify by checking the box',
      );
    });
  });

  it('clears the checkbox error after the box is checked', async () => {
    const { container } = render(
      <PreSubmitInfo2 formData={{}} showError onSectionComplete={() => {}} />,
    );
    const sot = container.querySelector('va-statement-of-truth');
    fireEvent(
      sot,
      new CustomEvent('vaCheckboxChange', { detail: { checked: true } }),
    );
    await waitFor(() => {
      expect(sot.getAttribute('checkbox-error')).to.be.null;
    });
  });

  it('shows a signature mismatch error after blur when the signature does not match the expected name', async () => {
    const { container } = render(
      <PreSubmitInfo2
        formData={{ fullName: { first: 'John', last: 'Doe' } }}
        showError={false}
        onSectionComplete={() => {}}
      />,
    );
    const sot = container.querySelector('va-statement-of-truth');

    fireEvent(
      sot,
      new CustomEvent('vaInputChange', { detail: { value: 'Wrong Name' } }),
    );
    fireEvent(sot, new CustomEvent('vaInputBlur'));

    await waitFor(() => {
      const inputError = sot.getAttribute('input-error');
      expect(inputError).to.include('John Doe');
      expect(inputError).to.include(
        'Please enter your name exactly as it appears on your application',
      );
    });
  });

  it('does not show a mismatch error before blur even when the signature is wrong', async () => {
    const { container } = render(
      <PreSubmitInfo2
        formData={{}}
        showError={false}
        onSectionComplete={() => {}}
      />,
    );
    const sot = container.querySelector('va-statement-of-truth');
    fireEvent(
      sot,
      new CustomEvent('vaInputChange', { detail: { value: 'Wrong Name' } }),
    );

    await waitFor(() => {
      expect(sot.getAttribute('input-value')).to.equal('Wrong Name');
    });
    expect(sot.getAttribute('input-error')).to.be.null;
  });

  it('does not show a mismatch error when the signature matches the expected name (case/whitespace insensitive)', async () => {
    const { container } = render(
      <PreSubmitInfo2
        formData={{ fullName: { first: 'John', last: 'Doe' } }}
        showError
        onSectionComplete={() => {}}
      />,
    );
    const sot = container.querySelector('va-statement-of-truth');
    fireEvent(
      sot,
      new CustomEvent('vaInputChange', { detail: { value: 'john  doe' } }),
    );
    fireEvent(sot, new CustomEvent('vaInputBlur'));

    await waitFor(() => {
      expect(sot.getAttribute('input-value')).to.equal('john  doe');
    });
    expect(sot.getAttribute('input-error')).to.be.null;
  });

  it('shows a mismatch error when showError is true even if the input has not been blurred', async () => {
    const { container } = render(
      <PreSubmitInfo2
        formData={{ fullName: { first: 'John', last: 'Doe' } }}
        showError
        onSectionComplete={() => {}}
      />,
    );
    const sot = container.querySelector('va-statement-of-truth');
    await waitFor(() => {
      expect(sot.getAttribute('input-error')).to.include('John Doe');
    });
  });

  it('updates input-value as the user types', async () => {
    const { container } = render(
      <PreSubmitInfo2
        formData={{}}
        showError={false}
        onSectionComplete={() => {}}
      />,
    );
    const sot = container.querySelector('va-statement-of-truth');
    fireEvent(
      sot,
      new CustomEvent('vaInputChange', { detail: { value: 'John Doe' } }),
    );
    await waitFor(() => {
      expect(sot.getAttribute('input-value')).to.equal('John Doe');
    });
  });
});
