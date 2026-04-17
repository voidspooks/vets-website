import { NOT_SHARED } from '../../components/FormFields/AddressSelectionField';
import { formValue, whenAll } from './form-config';

export const certifierRoleIs = role => formData =>
  formValue('certifierRole')(formData) === role;

export const roleIsOther = certifierRoleIs('other');

// address-sharing predicates
const certifierAddressIsNotShared = formData => {
  const sharedWith = formValue('view:certifierSharedAddress')(formData);
  return !sharedWith || sharedWith === NOT_SHARED;
};

export const certifierHasNoSharedAddressSelection = whenAll(
  roleIsOther,
  certifierAddressIsNotShared,
);
