import { transformForSubmit } from 'platform/forms-system/src/js/helpers';
import _ from 'lodash';
import {
  transformPhoneNumberObject,
  transformMailingAddress,
  todaysDate,
} from '../helpers';

export default function transform(formConfig, form) {
  const veteranTransform = formData => {
    const clonedData = _.cloneDeep(formData);

    clonedData.homePhone = transformPhoneNumberObject(
      clonedData.veteran.homePhone,
    );
    clonedData.mobilePhone = transformPhoneNumberObject(
      clonedData.veteran.mobilePhone,
    );
    if (clonedData.homePhone === '') {
      delete clonedData.homePhone;
    }
    if (clonedData.mobilePhone === '') {
      delete clonedData.mobilePhone;
    }
    clonedData.mailingAddress = transformMailingAddress(
      clonedData.veteran.mailingAddress,
    );
    clonedData.emailAddress = clonedData.veteran.email?.emailAddress;
    delete clonedData.veteran;

    return clonedData;
  };

  const dateTransform = formData => {
    const clonedData = _.cloneDeep(formData);
    clonedData.dateSigned = todaysDate();
    return clonedData;
  };

  const organizationTransform = formData => {
    const clonedData = _.cloneDeep(formData);
    clonedData.organizationAddress.country = 'USA';
    return clonedData;
  };

  const examTransform = formData => {
    const clonedData = _.cloneDeep(formData);
    if (clonedData.examCost) {
      clonedData.examCost = parseFloat(clonedData.examCost);
    }
    return clonedData;
  };

  const cleanUpTransform = formData => {
    const clonedData = _.cloneDeep(formData);
    delete clonedData.AGREED;
    delete clonedData.statementOfTruthCertified;
    delete clonedData.vaFileNumberLast4;
    delete clonedData.ssnLast4;
    return clonedData;
  };

  const usFormTransform = formData =>
    transformForSubmit(
      formConfig,
      { ...form, data: formData },
      { allowPartialAddress: true },
    );

  const transformedData = [
    veteranTransform,
    organizationTransform,
    examTransform,
    dateTransform,
    cleanUpTransform,
    usFormTransform, // this must appear last
  ].reduce((formData, transformer) => {
    return transformer(formData);
  }, form.data);

  return JSON.stringify({
    educationBenefitsClaim: {
      form: transformedData,
    },
  });
}
