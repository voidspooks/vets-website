import { transformForSubmit } from 'platform/forms-system/src/js/helpers';
import cloneDeep from 'platform/utilities/data/cloneDeep';
import {
  LOAN_INTENT,
  NON_DIGIT_REGEX,
  serviceStatuses,
  TOGGLE_KEY,
} from '../constants';

export const replaceNonDigits = number =>
  (number || '').replace(NON_DIGIT_REGEX, '');

export const isoDateString = (dateString = '') => {
  const [year, setMonth = '', setDay = ''] = dateString.split('-');
  // default month/day to 01 when missing or XX
  const month =
    !setMonth || setMonth === 'XX' ? '01' : setMonth.padStart(2, '0');
  const day = !setDay || setDay === 'XX' ? '01' : setDay.padStart(2, '0');
  // using new Date().toISOString() includes the timezone offset, so we're building it
  return dateString ? `${year}-${month}-${day}T00:00:00.000Z` : '';
};

export const formatV2Data = (data = {}) => {
  const isADSM = data.identity === serviceStatuses.ADSM;
  const hadPriorLoans = data.loanHistory?.hadPriorLoans === true;
  const priorLoans = hadPriorLoans ? data.relevantPriorLoans || [] : [];

  return {
    fullName: data.fullName,
    veteran: data.veteran,
    identity: data.identity,
    militaryHistory: {
      separatedDueToDisability: data.militaryHistory?.separatedDueToDisability,
      ...(isADSM && {
        preDischargeClaim: data.militaryHistory?.preDischargeClaim,
        purpleHeartRecipient: data.militaryHistory?.purpleHeartRecipient,
      }),
    },
    periodsOfService: (data.periodsOfService || []).map(period => ({
      ...period,
      dateRange: {
        from: isoDateString(period.dateRange?.from),
        to: isoDateString(period.dateRange?.to),
      },
    })),
    loanHistory: {
      certificateUse: data.loanHistory?.certificateUse,
      hadPriorLoans: data.loanHistory?.hadPriorLoans,
    },
    relevantPriorLoans: priorLoans.map(loan => ({
      ...loan,
      loanDate: isoDateString(loan.loanDate),
      vaLoanNumber: replaceNonDigits(loan.vaLoanNumber),
      naturalDisaster: {
        affected: loan.naturalDisaster?.affected,
        ...(loan.naturalDisaster?.affected &&
          loan.naturalDisaster?.dateOfLoss && {
            dateOfLoss: isoDateString(loan.naturalDisaster.dateOfLoss),
          }),
      },
    })),
    files2: data.files2,
    [`view:${TOGGLE_KEY}`]: true,
  };
};

export const customCOEsubmit = (formConfig, form) => {
  const formCopy = cloneDeep(form);
  const isV2 = Boolean(formCopy.data[`view:${TOGGLE_KEY}`]);

  const { periodsOfService = [], relevantPriorLoans = [] } = formCopy.data;

  const nextData = isV2
    ? formatV2Data(formCopy.data)
    : {
        ...formCopy.data,
        periodsOfService: periodsOfService.map(period => ({
          ...period,
          dateRange: {
            from: isoDateString(period.dateRange.from),
            to: isoDateString(period.dateRange.to),
          },
        })),
        relevantPriorLoans: relevantPriorLoans.map(loan => ({
          ...loan,
          dateRange: {
            from: isoDateString(loan.dateRange.from),
            to: isoDateString(loan.dateRange.to),
          },
          vaLoanNumber: replaceNonDigits(loan.vaLoanNumber),
        })),
      };

  const formattedForm = {
    ...formCopy,
    data: {
      ...nextData,
      version: isV2 ? 2 : 1,
    },
  };

  // transformForSubmit returns a JSON string
  const formData = transformForSubmit(formConfig, formattedForm);

  return JSON.stringify({
    lgyCoeClaim: {
      form: formData,
    },
  });
};

export const getLoanIntent = value =>
  Object.values(LOAN_INTENT).find(type => type.value === value);
