import React from 'react';
import { render } from '@testing-library/react';
import { expect } from 'chai';

import { HealthInsuranceDescription } from '../../../../components/FormDescriptions/HealthInsuranceDescriptions';

describe('ezr <HealthInsuranceDescription>', () => {
  context('when the component renders', () => {
    it('should render content', () => {
      const { container } = render(<HealthInsuranceDescription />);
      expect(container).to.not.be.empty;
      const selector = container.querySelector('va-additional-info');
      expect(selector).to.exist;
    });
  });
});
