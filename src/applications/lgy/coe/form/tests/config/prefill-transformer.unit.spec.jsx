import { expect } from 'chai';
import { TOGGLE_NAMES } from 'platform/utilities/feature-toggles';
import { prefillTransformer } from '../../config/prefill-transformer';
import { TOGGLE_KEY } from '../../constants';

describe('COE prefill transformer', () => {
  const pages = { testPage: 'Page 1' };
  const metadata = { version: 0, prefill: true };
  const toggleSnakeKey = TOGGLE_NAMES[TOGGLE_KEY];
  const stateWithToggleOn = {
    featureToggles: { [toggleSnakeKey]: true },
  };
  const stateWithToggleOff = {
    featureToggles: { [toggleSnakeKey]: false },
  };

  it('returns pages and metadata unchanged', () => {
    const result = prefillTransformer(pages, {}, metadata, stateWithToggleOn);

    expect(result.pages).to.equal(pages);
    expect(result.metadata).to.equal(metadata);
  });

  it('leaves formData untouched when the toggle is off', () => {
    const formData = {
      nonPrefill: { veteranSsnLastFour: '6789' },
    };

    const { formData: transformed } = prefillTransformer(
      pages,
      formData,
      metadata,
      stateWithToggleOff,
    );

    expect(transformed).to.equal(formData);
    expect(transformed.veteranSsnLastFour).to.be.undefined;
  });

  it('extracts veteranSsnLastFour from nonPrefill when the toggle is on', () => {
    const formData = {
      nonPrefill: { veteranSsnLastFour: '6789' },
    };

    const { formData: transformed } = prefillTransformer(
      pages,
      formData,
      metadata,
      stateWithToggleOn,
    );

    expect(transformed.veteranSsnLastFour).to.equal('6789');
  });

  it('defaults veteranSsnLastFour to an empty string when nonPrefill is missing', () => {
    const { formData: transformed } = prefillTransformer(
      pages,
      {},
      metadata,
      stateWithToggleOn,
    );

    expect(transformed.veteranSsnLastFour).to.equal('');
  });

  it('defaults veteranSsnLastFour to an empty string when not present in nonPrefill', () => {
    const formData = { nonPrefill: {} };

    const { formData: transformed } = prefillTransformer(
      pages,
      formData,
      metadata,
      stateWithToggleOn,
    );

    expect(transformed.veteranSsnLastFour).to.equal('');
  });

  it('preserves other top-level formData fields when the toggle is on', () => {
    const formData = {
      fullName: { first: 'Mae', middle: '', last: 'Rivera' },
      dateOfBirth: '1931-06-07',
      nonPrefill: { veteranSsnLastFour: '6789' },
    };

    const { formData: transformed } = prefillTransformer(
      pages,
      formData,
      metadata,
      stateWithToggleOn,
    );

    expect(transformed.fullName).to.deep.equal(formData.fullName);
    expect(transformed.dateOfBirth).to.equal('1931-06-07');
    expect(transformed.veteranSsnLastFour).to.equal('6789');
  });
});
