import { expect } from 'chai';

import { emailFormSchema } from '../../util/contact-information/emailUtils';
import { phoneFormSchema } from '../../util/contact-information/phoneUtils';

// Browsers compile HTML `pattern="..."` with the `v` flag, which requires
// `-`, `(`, and `)` to be escaped inside character classes. Constructing
// with the flag below makes any future non-compliant pattern fail here.
// Variable assignment sidesteps ESLint `no-invalid-regexp` (predates `v`).
const V_FLAG = 'v';

describe('contact-information patterns are v-flag compliant', () => {
  it('email pattern', () => {
    const { pattern } = emailFormSchema.properties.emailAddress;
    const re = new RegExp(pattern, V_FLAG);
    expect(re.test('user@va.gov')).to.be.true;
    expect(re.test('not-an-email')).to.be.false;
  });

  it('domestic phone pattern', () => {
    const { pattern } = phoneFormSchema({
      allowInternational: false,
    }).properties.inputPhoneNumber;
    const re = new RegExp(pattern, V_FLAG);
    expect(re.test('(555) 123-4567')).to.be.true;
    expect(re.test('abc')).to.be.false;
  });

  it('extension pattern', () => {
    const { pattern } = phoneFormSchema({
      allowInternational: false,
    }).properties.extension;
    const re = new RegExp(pattern, V_FLAG);
    expect(re.test('123')).to.be.true;
    expect(re.test('abc')).to.be.false;
  });
});
