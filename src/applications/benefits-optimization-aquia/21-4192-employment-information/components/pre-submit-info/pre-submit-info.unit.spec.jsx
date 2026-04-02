/**
 * @module tests/components/PreSubmitInfo.unit.spec
 * @description Unit tests for PreSubmitInfo component
 */

import { expect } from 'chai';
import { PreSubmitInfo, isSignatureValid } from './pre-submit-info';

describe('PreSubmitInfo Component', () => {
  describe('Component Export', () => {
    it('should export a React functional component', () => {
      expect(PreSubmitInfo).to.exist;
      expect(PreSubmitInfo).to.be.a('function');
    });

    it('should export isSignatureValid utility function', () => {
      expect(isSignatureValid).to.exist;
      expect(isSignatureValid).to.be.a('function');
    });
  });

  describe('isSignatureValid Function', () => {
    it('should return an error message for empty signature', () => {
      // expect it to have the value Enter your full name
      expect(isSignatureValid('')).to.equal('Enter your full name');
    });

    it('should return an error message for null signature', () => {
      expect(isSignatureValid(null)).to.equal('Enter your full name');
    });

    it('should return an error message for undefined signature', () => {
      expect(isSignatureValid(undefined)).to.equal('Enter your full name');
    });

    it('should return an error message for signatures with less than 3 characters', () => {
      expect(isSignatureValid('J')).to.equal(
        'Name must be at least 3 characters long',
      );
      expect(isSignatureValid('Jo')).to.equal(
        'Name must be at least 3 characters long',
      );
    });

    it('should return true for signatures with 3+ characters', () => {
      expect(isSignatureValid('Joe')).to.be.true;
      expect(isSignatureValid('John')).to.be.true;
      expect(isSignatureValid('John Doe')).to.be.true;
    });

    it('should trim whitespace before validation', () => {
      expect(isSignatureValid('   ')).to.equal(
        'Name must be at least 3 characters long',
      );
      expect(isSignatureValid('  J  ')).to.equal(
        'Name must be at least 3 characters long',
      );
      expect(isSignatureValid('  Jo  ')).to.equal(
        'Name must be at least 3 characters long',
      );
      expect(isSignatureValid('  Joe  ')).to.be.true;
      expect(isSignatureValid(' John Doe ')).to.be.true;
    });

    it('should accept valid special characters in names', () => {
      expect(isSignatureValid("O'Brien")).to.be.true;
      expect(isSignatureValid('Smith-Jones')).to.be.true;
      expect(isSignatureValid("Mary-Jane O'Connor")).to.be.true;
      expect(isSignatureValid('John Jr.')).to.be.true;
      expect(isSignatureValid('Dr. Smith')).to.be.true;
    });

    it('should accept international and accented characters', () => {
      expect(isSignatureValid('José García')).to.be.true;
      expect(isSignatureValid('François Müller')).to.be.true;
      expect(isSignatureValid('María López')).to.be.true;
      expect(isSignatureValid('Søren Ødegård')).to.be.true;
      expect(isSignatureValid('Nguyễn Văn')).to.be.true;
    });

    it('should reject names with numbers', () => {
      expect(isSignatureValid('John123')).to.equal(
        'Name can only include letters, spaces, hyphens, apostrophes, and periods',
      );
      expect(isSignatureValid('123 Main')).to.equal(
        'Name can only include letters, spaces, hyphens, apostrophes, and periods',
      );
      expect(isSignatureValid('Test User 2')).to.equal(
        'Name can only include letters, spaces, hyphens, apostrophes, and periods',
      );
      expect(isSignatureValid('Jane Doe 3rd')).to.equal(
        'Name can only include letters, spaces, hyphens, apostrophes, and periods',
      );
    });

    it('should reject names with invalid special characters', () => {
      expect(isSignatureValid('John@Smith')).to.equal(
        'Name can only include letters, spaces, hyphens, apostrophes, and periods',
      );
      expect(isSignatureValid('Jane#Doe')).to.equal(
        'Name can only include letters, spaces, hyphens, apostrophes, and periods',
      );
      expect(isSignatureValid('Test$User')).to.equal(
        'Name can only include letters, spaces, hyphens, apostrophes, and periods',
      );
      expect(isSignatureValid('Name (Nickname)')).to.equal(
        'Name can only include letters, spaces, hyphens, apostrophes, and periods',
      );
      expect(isSignatureValid('User!!')).to.equal(
        'Name can only include letters, spaces, hyphens, apostrophes, and periods',
      );
      expect(isSignatureValid('Name&Name')).to.equal(
        'Name can only include letters, spaces, hyphens, apostrophes, and periods',
      );
    });

    it('should reject strings with only special characters (no letters)', () => {
      expect(isSignatureValid('- - -')).to.equal(
        'Name must contain at least one letter',
      );
      expect(isSignatureValid("'-'-'")).to.equal(
        'Name must contain at least one letter',
      );
      expect(isSignatureValid('...---...')).to.equal(
        'Name must contain at least one letter',
      );
    });

    it('should reject strings with only one unique character', () => {
      expect(isSignatureValid('aaa')).to.equal(
        'Name must contain more than one unique character',
      );
      expect(isSignatureValid('---')).to.equal(
        'Name must contain more than one unique character',
      );
      expect(isSignatureValid('...')).to.equal(
        'Name must contain more than one unique character',
      );
    });

    it('should accept fixture test signatures', () => {
      // These match the signatures in maximal.json and minimal.json
      expect(isSignatureValid('Test Signature Name')).to.be.true;
      expect(isSignatureValid('Different Test Name')).to.be.true;
    });

    it('should handle very long signatures', () => {
      const longName = 'BA'.repeat(50);
      expect(isSignatureValid(longName)).to.be.true;
    });
  });

  describe('Validation Logic - No Name Matching', () => {
    it('should validate signatures with valid characters regardless of specific name', () => {
      // Test various names that would NOT match a typical veteran name
      // All use valid characters (letters, spaces, hyphens, apostrophes, periods)
      const testSignatures = [
        'Bob',
        'Jane Doe',
        'Random Name',
        'Completely Different Person',
        "O'Brien-Smith",
        'X Y Z',
        'Dr. Anonymous',
      ];

      testSignatures.forEach(signature => {
        expect(isSignatureValid(signature), `Should accept: "${signature}"`).to
          .be.true;
      });
    });

    it('should reject signatures with invalid characters even if length is valid', () => {
      expect(isSignatureValid('Test User 123')).to.equal(
        'Name can only include letters, spaces, hyphens, apostrophes, and periods',
      ); // Has numbers
      expect(isSignatureValid('John@Doe')).to.equal(
        'Name can only include letters, spaces, hyphens, apostrophes, and periods',
      ); // Has special char
      expect(isSignatureValid('abc123')).to.equal(
        'Name can only include letters, spaces, hyphens, apostrophes, and periods',
      ); // Has numbers
    });

    it('should reject signatures shorter than 3 characters', () => {
      expect(isSignatureValid('AB')).to.equal(
        'Name must be at least 3 characters long',
      );
      expect(isSignatureValid('X')).to.equal(
        'Name must be at least 3 characters long',
      );
      expect(isSignatureValid('Jo')).to.equal(
        'Name must be at least 3 characters long',
      );
    });

    it('should not perform any name comparison logic', () => {
      // The validation function checks character types and length, not specific names
      // Any valid name format is accepted regardless of veteran's actual name
      const veteranName = 'John Smith';
      const differentName = 'Jane Doe';

      // Both should be valid - no comparison is performed
      expect(isSignatureValid(veteranName)).to.be.true;
      expect(isSignatureValid(differentName)).to.be.true;

      // Valid letter combinations are accepted
      expect(isSignatureValid('abc')).to.be.true;
      expect(isSignatureValid('XYZ')).to.be.true;

      // But invalid characters are rejected
      expect(isSignatureValid('123')).to.equal(
        'Name can only include letters, spaces, hyphens, apostrophes, and periods',
      );
      expect(isSignatureValid('!!!')).to.equal(
        'Name can only include letters, spaces, hyphens, apostrophes, and periods',
      );
    });

    it('should accept names that do NOT match typical veteran names', () => {
      // These are intentionally different from what might be in veteranInformation
      expect(isSignatureValid('Anonymous User')).to.be.true;
      expect(isSignatureValid('Test Person')).to.be.true;
      expect(isSignatureValid('Different Name Entirely')).to.be.true;
    });
  });
});
