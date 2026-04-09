import React from 'react';
import { expect } from 'chai';
import { renderWithStoreAndRouter } from '@department-of-veterans-affairs/platform-testing/react-testing-library-helpers';
import useAcceleratedData from '../../hooks/useAcceleratedData';

const Component = () => {
  const { isLoading } = useAcceleratedData();
  return <div data-testid="is-loading">{String(isLoading)}</div>;
};

const baseFeatureToggles = {
  loading: false,
};

describe('useAcceleratedData', () => {
  describe('isLoading', () => {
    it('returns true when feature toggles are still loading', () => {
      const { getByTestId } = renderWithStoreAndRouter(<Component />, {
        initialState: {
          featureToggles: { ...baseFeatureToggles, loading: true },
          drupalStaticData: {
            vamcEhrData: { loading: false, data: {} },
          },
        },
      });
      expect(getByTestId('is-loading').textContent).to.eq('true');
    });

    it('returns true when drupalStaticData.vamcEhrData is undefined', () => {
      const { getByTestId } = renderWithStoreAndRouter(<Component />, {
        initialState: {
          featureToggles: baseFeatureToggles,
          drupalStaticData: {},
        },
      });
      expect(getByTestId('is-loading').textContent).to.eq('true');
    });

    it('returns true when drupalStaticData is undefined', () => {
      const { getByTestId } = renderWithStoreAndRouter(<Component />, {
        initialState: {
          featureToggles: baseFeatureToggles,
        },
      });
      expect(getByTestId('is-loading').textContent).to.eq('true');
    });

    it('returns true when vamcEhrData is still loading', () => {
      const { getByTestId } = renderWithStoreAndRouter(<Component />, {
        initialState: {
          featureToggles: baseFeatureToggles,
          drupalStaticData: {
            vamcEhrData: { loading: true },
          },
        },
      });
      expect(getByTestId('is-loading').textContent).to.eq('true');
    });

    it('returns false when both feature toggles and vamcEhrData are loaded', () => {
      const { getByTestId } = renderWithStoreAndRouter(<Component />, {
        initialState: {
          featureToggles: baseFeatureToggles,
          drupalStaticData: {
            vamcEhrData: { loading: false, data: {} },
          },
        },
      });
      expect(getByTestId('is-loading').textContent).to.eq('false');
    });
  });
});
