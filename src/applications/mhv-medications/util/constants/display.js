export const imageRootUri = 'https://www.myhealth.va.gov/static/MILDrugImages/';

export const INCLUDE_IMAGE_ENDPOINT = 'include_image=true';

export const allergyTypes = {
  OBSERVED:
    'Observed (you experienced this allergy or reaction while you were getting care at this VA location)',
  REPORTED:
    'Historical (you experienced this allergy or reaction in the past, before you started getting care at this VA location)',
};

export const FIELD_NONE_NOTED = 'None noted';
export const FIELD_NOT_AVAILABLE = 'Not available';
export const NO_PROVIDER_NAME = 'Provider name not available';
export const NON_VA_MEDICATION_MESSAGE =
  'You can’t manage this medication in this online tool.';

export const UNFILLED_OH_MESSAGE_CONTENT = {
  MANAGEMENT_IMPROVEMENTS_ENABLED: {
    intro: 'We haven’t filled this prescription yet. Details may change.',
    withPhoneInlinePrefix:
      'If you need this medication now, call your VA pharmacy',
    withPhoneBelow:
      'If you need this medication now, call your VA pharmacy at the phone number listed below.',
    withoutPhone:
      'If you need this medication now, call your VA pharmacy’s automated refill line. The phone number is on your prescription label or in your medication details page.',
  },
  MANAGEMENT_IMPROVEMENTS_DISABLED: {
    intro: 'You can’t refill this prescription online right now.',
    withPhoneInlinePrefix: 'If you need a refill, call your VA pharmacy',
    withPhoneBelow:
      'If you need a refill, call your VA pharmacy at the phone number listed below.',
    withoutPhone:
      'To refill now, call your VA pharmacy’s automated refill line. The number is on your prescription label, or contact your VA pharmacy.',
  },
};

export const downtimeNotificationParams = {
  appTitle: 'this medications tool',
};

export const tooltipNames = {
  mhvMedicationsTooltipFilterAccordion:
    'mhv_medications_tooltip_filter_accordion',
};

export const tooltipHintContent = {
  filterAccordion: {
    HINT: 'Filter your list to find a specific medication.',
  },
};

export const recordNotFoundMessage = 'Record not found';

export const nonVAMedicationTypes = `* Prescriptions you filled through a non-VA pharmacy
* Over-the-counter medications, supplements, and herbal remedies
* Sample medications a provider gave you
* Other drugs you’re taking that you don’t have a prescription for, including recreational drugs`;

export const DATETIME_FORMATS = {
  longMonthDate: 'MMMM d, yyyy',
  filename: 'M-d-yyyy_hmmssaaa',
};

export const MEDS_BY_MAIL_FACILITY_ID = '741MM';

/**
 * The tablet breakpoint at which the layout changes for mobile.
 *
 * https://design.va.gov/foundation/breakpoints
 */
export const MOBILE_BREAKPOINT_PX = 767;
