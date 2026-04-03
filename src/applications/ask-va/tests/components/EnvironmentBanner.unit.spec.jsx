import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { expect } from 'chai';
import sinon from 'sinon';

import EnvironmentBanner from '../../components/EnvironmentBanner';
import * as api from '../../utils/api';
import * as environment from '../../utils/environment';

describe('EnvironmentBanner', () => {
  let sandbox;
  let isProductionStub;
  let getDiagnosticsStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    isProductionStub = sandbox.stub(environment, 'isProduction');
    getDiagnosticsStub = sandbox.stub(api, 'getDiagnostics');
  });

  afterEach(() => {
    sandbox.restore();
  });

  context('production environment', () => {
    it('does not render', async () => {
      isProductionStub.returns(true);

      const { container } = render(<EnvironmentBanner />);

      expect(getDiagnosticsStub.called).to.be.false;
      expect(container.querySelector('.environment-banner')).to.be.null;
    });
  });

  context('non-production environment', () => {
    beforeEach(() => {
      isProductionStub.returns(false);
    });

    it('renders CRM environment when diagnostics resolves', async () => {
      getDiagnosticsStub.resolves({ crmEnvironment: 'staging' });

      const { getByText } = render(<EnvironmentBanner />);

      await waitFor(() => {
        expect(getByText('STAGING')).to.exist;
      });
    });

    it('does not render when diagnostics call fails', async () => {
      getDiagnosticsStub.rejects(new Error('Network error'));

      const { container } = render(<EnvironmentBanner />);

      await waitFor(() => {
        expect(container.querySelector('.environment-banner')).to.be.null;
      });
    });

    it('hides the banner when dismiss button is clicked', async () => {
      getDiagnosticsStub.resolves({ crmEnvironment: 'staging' });

      const { getByLabelText, getByText, container } = render(
        <EnvironmentBanner />,
      );

      await waitFor(() => {
        expect(getByText('STAGING')).to.exist;
      });

      fireEvent.click(getByLabelText('Dismiss environment banner'));

      expect(container.querySelector('.environment-banner')).to.be.null;
    });
  });
});
