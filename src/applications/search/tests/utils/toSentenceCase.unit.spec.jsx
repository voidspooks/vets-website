import { expect } from 'chai';

import { toSentenceCase } from '../../utils';

describe('search utils: toSentenceCase', () => {
  it('returns empty string for nullish input', () => {
    expect(toSentenceCase()).to.equal('');
    expect(toSentenceCase(null)).to.equal('');
    expect(toSentenceCase(undefined)).to.equal('');
  });

  it('converts title case to sentence case', () => {
    expect(toSentenceCase('This Type of Casing')).to.equal(
      'This type of casing',
    );
    expect(toSentenceCase('Health Care And Benefits')).to.equal(
      'Health care and benefits',
    );
  });

  it('preserves all-caps acronyms when the string already has lowercase letters', () => {
    expect(
      toSentenceCase('This Type Of Casing With an Acronym ABCDE'),
    ).to.equal('This type of casing with an acronym ABCDE');
    expect(toSentenceCase('Health Care And CHAMPVA Benefits')).to.equal(
      'Health care and CHAMPVA benefits',
    );
  });

  it("normalizes Board of Veterans' appeals (BVA) title to exact sentence case", () => {
    expect(
      toSentenceCase("Board Of Veterans' Appeals (BVA) Decisions"),
    ).to.equal("Board of veterans' appeals (BVA) decisions");
  });

  it('when the entire title is uppercase, sentence-cases words but keeps (BVA) and dotted abbreviations', () => {
    expect(toSentenceCase('HEALTH CARE AND BENEFITS')).to.equal(
      'Health care and benefits',
    );
    expect(
      toSentenceCase("BOARD OF VETERANS' APPEALS (BVA) DECISIONS"),
    ).to.equal("Board of veterans' appeals (BVA) decisions");
    expect(toSentenceCase('VISIT VA.GOV OR MYHEALTHEVET TODAY')).to.equal(
      'Visit VA.GOV or myhealthevet today',
    );
  });

  it('preserves intentional mixed-case tokens', () => {
    expect(toSentenceCase('VA.gov AND MyHealtheVet')).to.equal(
      'VA.gov and MyHealtheVet',
    );
  });

  it('treats U.S. as a single all-caps token when mixed with title case', () => {
    expect(toSentenceCase('Benefits In The U.S. For Veterans')).to.equal(
      'Benefits in the U.S. for veterans',
    );
  });
});
