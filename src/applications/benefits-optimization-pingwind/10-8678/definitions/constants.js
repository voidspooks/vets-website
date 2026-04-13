export const TITLE = 'Apply for annual clothing allowance online';
export const SUBTITLE =
  'Application For Annual Clothing Allowance (VA Form 10-8678)';
export const FORM_ID = '10-8678';

export const FORM_10_8678 = {
  INTRODUCTION: {
    FORM_TITLE: 'Apply for annual clothing allowance online',
    FORM_SUBTITLE:
      'Application For Annual Clothing Allowance (VA Form 10-8678)',
    AUTH_START_FORM_TEXT: 'Sign in or create an account',
    SAVE_IN_PROGRESS_TEXT:
      'You can save your progress and return to this form later.',
    INTRO:
      'Use VA Form 10-8678 if you’re a Veteran with a service-connected disability who uses a prosthetic, orthopedic appliance, or skin medication that damages your clothing. This benefit provides an annual payment to help you replace clothing worn, torn, or stained because of your service-connected condition.',
    INTRO_FOLLOWUP:
      'Types of clothing included within this allowance are shirts, blouses, pants, skirts, shorts and similar garments permanently damaged by qualifying appliances and skin medications are considered in clothing allowance decisions. Shoes, hats, scarves, underwear, socks, and similar garments are not included.',
    STEP_ELIGIBILITY_TITLE: 'Check your eligibility',
    STEP_ELIGIBILITY_INTRO:
      'You may be eligible for an annual clothing allowance if you have a service-connected disability and use a device or skin medication that damages your clothing.',
    STEP_ELIGIBILITY_CONDITION_INTRO:
      'At least one of these conditions must be true:',
    STEP_ELIGIBILITY_BULLETS: [
      'You wear or use a prescribed prosthetic or orthopedic appliance for your service-connected disability (such as an artificial limb, brace, or wheelchair) that wears or tears your clothing, or',
      'You use a prescribed skin medication for a service-connected skin condition that causes irreparable staining to your outer garments',
    ],
    STEP_ELIGIBILITY_ADDITIONAL_INFO_TITLE: 'Additional information',
    STEP_ELIGIBILITY_ADDITIONAL_INFO_INTRO:
      'You may be eligible for more than one annual clothing allowance if as a result of your service-connected disability or skin condition:',
    STEP_ELIGIBILITY_ADDITIONAL_INFO_BULLETS: [
      'You wear or use more than one qualifying prescribed prosthetic or orthopedic appliance or',
      'You use prescription medication for more than one skin condition',
    ],
    STEP_GATHER_TITLE: 'Gather your information',
    STEP_GATHER_INTRO: 'Here’s what you’ll need to apply:',
    STEP_GATHER_BULLETS: [
      {
        label: 'Your personal information',
        body:
          'This includes your name, date of birth, Social Security number or Military Service number, and contact information.',
      },
      {
        label: 'Your device or medication information',
        body:
          'This includes the name of each prosthetic, orthopedic appliance (such as an artificial limb, brace, or wheelchair), or skin medication you use because of a service-connected condition. You’ll need to list each one that damages or stains your clothing.',
      },
      {
        label: 'Your service-connected condition',
        body:
          'You’ll need to confirm that the device or medication you’re listing is related to a condition connected to your military service.',
      },
    ],
    STEP_START_TITLE: 'Start your application',
    STEP_START_BODY:
      'We’ll take you through each step of the process. It should take about 10 minutes.',
    STEP_START_FOLLOWUP:
      'You can save your progress and return to this form later.',
  },
  BENEFIT_STATUS: {
    TITLE: 'No longer need a clothing allowance?',
    DESCRIPTION:
      'If you have previously been granted a clothing allowance but no longer are prescribed or use the prosthetic device, orthopedic appliance, or skin medication for your service-connected disability, you must notify VA.',
    QUESTION: {
      label: 'Choose your appropriate benefit status',
      body:
        'If you currently receive more than one clothing allowance benefit, and wish to continue receiving at least one of the allowances, select “I will continue with the application for the clothing allowance benefit”, and complete the required information for the prescribed device, orthopedic appliance, or skin medication you are still using. Select the option to terminate this benefit if you no longer need any clothing allowance.',
    },
    TERMINATE_OPTION:
      'I elect to terminate as I no longer use a device, orthopedic appliance, or skin medication, which previously qualified me for the clothing allowance benefit pursuant to 38 USC §1162.',
    CONTINUE_OPTION:
      'I will continue with the application for the annual clothing allowance benefit',
    ERROR_MESSAGE: 'Select appropriate benefit status',
  },
  VHA_MEDICAL_FACILITY: {
    TITLE: 'Select your local Prosthetic and Sensory Aids Service location',
    DESCRIPTION:
      'Select a facility or PSAS from the list, even if you have elected to terminate any portion of your clothing allowance benefit. If your facility isn’t listed select "Other" and enter the name in the field provided.',
    FIELD_LABEL:
      'What facility or PSAS do you want to submit this application to?',
    FIELD_ERROR: 'Please select a facility or PSAS',
    OTHER_LABEL: 'If "Other", please specify',
    OTHER_ERROR: 'Please enter a facility or PSAS',
    OTHER_OPTION: 'Other',
  },
  APPLICATION_CERTIFICATION: {
    TITLE: 'Application Certification Statement, Legal Information',
    DESCRIPTION:
      'Select the checkboxes to certify that you regularly use a qualifying prosthetic device, orthopedic appliance, or skin medication because of a service-connected disability or skin condition that damages or irreparably stains your outer garments.',
    CERTIFICATION_SECTION: {
      TITLE: 'Application Certification',
      BODY:
        'I certify that because of my service-connected disability authorized under 38 USC § 1162, in doing so I certify that because of my service-connected disability or disabilities, I regularly wear or use the prosthetic or orthopedic appliance(s) and/or skin medication(s) listed in this application which results in irreparable wear and tear to my clothing, or (2) use a skin medication listed in section 1 prescribed for this application which causes irreparable staining to my outer garments. Note: If I have multiple prosthetic and/or skin medication(s) appliances to claim for more than one clothing allowance benefit, I will need to notify VA in writing if I am no longer prescribed and use the identified items which may impact my entitlement to the annual clothing allowance benefit. By applying for this benefit, VA has the right to periodically review my continued entitlement to this benefit.',
      CHECKBOX_LABEL: 'I’ve read and understand the Application Certification.',
      ERROR_MESSAGE:
        'Select the checkbox to certify that you use a qualifying appliance or skin medication for a service-connected disability and wish to apply for this benefit',
    },
    PENALTY: {
      TITLE: 'Penalty',
      BODY:
        'The law provides severe penalties, which include fine or imprisonment for up to 5 years, or both, for willful submission of any statement or evidence of a material fact, knowing it to be false.',
    },
  },
  BENEFIT_TERMINATION_CERTIFICATION: {
    TITLE: 'Benefit Termination Certification and Legal Information',
    DESCRIPTION:
      'Select the checkbox to confirm that you are no longer prescribed or regularly use a qualifying prosthetic device, orthopedic appliance, or skin medication because of a service-connected disability.',
    CERTIFICATION: {
      TITLE: 'Benefit termination certification',
      BODY:
        'I understand that I must notify VA when I no longer am prescribed and use the identified items which may impact my entitlement to the annual clothing allowance benefit.',
      CHECKBOX_LABEL:
        'I have read and understand the benefit termination certification.',
      ERROR_MESSAGE:
        'Select the checkbox to confirm you are no longer prescribed or using a qualifying device, appliance, or skin medication',
    },
    PENALTY: {
      TITLE: 'Penalty',
      BODY:
        'The law provides severe penalties including fine or imprisonment, or both, for willful submission of any false statement or evidence of material fact.',
    },
  },
};

export const MAX_BENEFIT_ITEMS = 4;

export const BODY_PART_LABELS = {
  upperRight: 'Upper body right side',
  upperLeft: 'Upper body left side',
  lowerRight: 'Lower body right side',
  lowerLeft: 'Lower body left side',
};
