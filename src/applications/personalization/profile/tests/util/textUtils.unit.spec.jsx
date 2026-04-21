import { expect } from 'chai';
import { oxfordCommaList, toInitialCaps } from '../../util/textUtils';

describe('profile textUtils', () => {
  describe('oxfordCommaList', () => {
    it('returns an empty string for an empty array', () => {
      expect(oxfordCommaList([])).to.equal('');
    });

    it('returns the single item for an array with one item', () => {
      expect(oxfordCommaList(['Email'])).to.equal('Email');
    });

    it('joins two items with "and" and no comma', () => {
      expect(oxfordCommaList(['Email', 'Text'])).to.equal('Email and Text');
    });

    it('joins three items with an Oxford comma', () => {
      expect(oxfordCommaList(['Email', 'Text', 'Phone'])).to.equal(
        'Email, Text, and Phone',
      );
    });
  });

  describe('toInitialCaps', () => {
    it('capitalizes the first letter of each lowercase word', () => {
      expect(toInitialCaps('service history information')).to.equal(
        'Service History Information',
      );
    });

    it('preserves words that are already capitalized', () => {
      expect(toInitialCaps('Veteran Status Card')).to.equal(
        'Veteran Status Card',
      );
    });

    it('capitalizes words after punctuation and hyphens', () => {
      expect(
        toInitialCaps('sign-in information and email/text alerts'),
      ).to.equal('Sign-In Information And Email/Text Alerts');
    });
  });
});
