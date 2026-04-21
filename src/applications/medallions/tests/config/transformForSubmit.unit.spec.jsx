import { expect } from 'chai';
import transformForSubmit from '../../config/transformForSubmit';

describe('Medallions transformForSubmit', () => {
  const formConfig = { formId: 'FORM_1330M', chapters: {} };
  const form = { data: {} };

  it('includes dateSubmitted and dateExpires in the output', () => {
    const result = JSON.parse(transformForSubmit(formConfig, form));

    expect(result.dateSubmitted).to.be.a('string');
    expect(result.dateExpires).to.be.a('string');
  });

  it('formats dateSubmitted with the expected pattern', () => {
    const result = JSON.parse(transformForSubmit(formConfig, form));

    // Should match: "April 14, 2026 2:52 p.m. ET"
    const dateTimePattern = /^[A-Z][a-z]+ \d{2}, \d{4} \d{1,2}:\d{2} [ap]\.m\. [A-Z]{2,4}$/;
    expect(result.dateSubmitted).to.match(dateTimePattern);
  });

  it('formats dateExpires with the expected pattern', () => {
    const result = JSON.parse(transformForSubmit(formConfig, form));

    const dateTimePattern = /^[A-Z][a-z]+ \d{2}, \d{4} \d{1,2}:\d{2} [ap]\.m\. [A-Z]{2,4}$/;
    expect(result.dateExpires).to.match(dateTimePattern);
  });

  it('dateExpires is approximately one year after dateSubmitted', () => {
    const result = JSON.parse(transformForSubmit(formConfig, form));

    // Extract years from both strings
    const submittedYear = parseInt(result.dateSubmitted.match(/\d{4}/)[0], 10);
    const expiresYear = parseInt(result.dateExpires.match(/\d{4}/)[0], 10);
    expect(expiresYear - submittedYear).to.equal(1);
  });

  it('does not include DST-specific timezone abbreviations', () => {
    const result = JSON.parse(transformForSubmit(formConfig, form));

    // Should use generic abbreviation (ET, CT, PT) not DST-specific (EDT, CST, PDT)
    expect(result.dateSubmitted).to.not.match(/[A-Z][SD]T$/);
    expect(result.dateExpires).to.not.match(/[A-Z][SD]T$/);
  });
});
