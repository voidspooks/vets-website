export const veteranFields = {
  parentObject: 'veteran',
  fullName: 'fullName',
  ssn: 'ssn',
  vaFileNumber: 'vaFileNumber',
  dateOfBirth: 'dateOfBirth',
};

export const claimantFields = {
  parentObject: 'claimant',
  fullName: 'fullName',
  relationshipType: 'relationshipType',
  otherRelationshipDescription: 'otherRelationshipDescription',
  address: 'address',
  phone: 'phone',
  email: 'email',
};

export const requestedApportionmentPersonFields = {
  parentObject: 'requestedApportionmentPeople',
  fullName: 'fullName',
  ssn: 'ssn',
  veteranRelationshipDescription: 'veteranRelationshipDescription',
  receivesApportionmentNow: 'receivesApportionmentNow',
  stepchildLivesWithVeteran: 'stepchildLivesWithVeteran',
  stepchildDepartureDate: 'stepchildDepartureDate',
  adoptedChildrenQuestion: 'adoptedChildrenQuestion',
};

export const apportionmentFields = {
  parentObject: 'apportionment',
  apportionmentClaimReason: 'apportionmentClaimReason',
  incarcerationConvictionType: 'incarcerationConvictionType',
  veteranIncarceratedOver60Days: 'veteranIncarceratedOver60Days',
  veteranIncarcerationFelonyOrMisdemeanor:
    'veteranIncarcerationFelonyOrMisdemeanor',
  survivingBeneficiaryIncarceratedOver60Days:
    'survivingBeneficiaryIncarceratedOver60Days',
  survivingBeneficiaryIncarcerationFelonyOrMisdemeanor:
    'survivingBeneficiaryIncarcerationFelonyOrMisdemeanor',
  veteranIncompetentInCare: 'veteranIncompetentInCare',
  veteranReceivingPensionInCare: 'veteranReceivingPensionInCare',
  beneficiaryInEnemyTerritory: 'beneficiaryInEnemyTerritory',
  veteranDisappeared: 'veteranDisappeared',
  facilityName: 'facilityName',
  facilityAddress: 'facilityAddress',
};

export const relationshipOptions = {
  currentSpouse: 'Current spouse',
  child18To23InSchool: 'Child 18-23 in school',
  custodianForChildUnder18: 'Custodian filing for child under 18',
  childOver18Incapable: 'Child over 18 permanently incapable of self-support',
  dependentParent: 'Dependent parent',
  other: 'Other',
};

export const POSTAL_CODE_ERROR_MESSAGES = {
  USA: {
    required: 'Please enter a postal code',
    pattern: 'Please enter a valid 5-digit postal code',
  },
  CAN: {
    required: 'Please enter a postal code',
    pattern: 'Please enter a valid 6-character postal code',
  },
  MEX: {
    required: 'Please enter a postal code',
    pattern: 'Please enter a valid 5-digit postal code',
  },
  NONE: {
    required: 'Please enter a postal code',
    pattern: 'Please enter a valid postal code',
  },
  OTHER: {
    required:
      "Please enter a postal code that meets your country's requirements. If your country doesn't require a postal code, enter NA.",
    pattern: 'Please enter a valid postal code',
  },
};

export const formTitles = {
  form:
    "Information Regarding Apportionment of Beneficiary's Award (VA 21-0788)",
  subTitle: 'Please complete this form as accurately as you can.',
  informationRequired: 'Information we are required to share',
  veteranInformation: "Section I: Veteran's identification information",
  claimantInformation:
    'Section II: Information on claimant or individual acting on behalf of a minor child',
  apportionmentInformation: 'Section III: Apportionment information',
  remarksCertification: 'Sections IV and V: Remarks and certification',
};

export const introductionPageText = {
  formTitle: "Request apportionment of a beneficiary's award online",
  formSubTitle:
    "Information Regarding Apportionment of Beneficiary's Award (VA Form 21-0788)",
  authStartFormText: 'Start the form',
  saveInProgressText:
    'Please complete the 21-0788 form to request an apportionment of a beneficiary’s award.',
  intro:
    "Use this form to request an apportionment of a beneficiary's VA award. In limited situations, a Veteran's disability award or a surviving spouse's award may be apportioned to a spouse, child, or dependent parent.",
  readBeforeHeader: 'Read this first',
  readBeforeItems: [
    'This form must be completed by the spouse, child, dependent parent, or an individual acting on behalf of a minor child requesting the apportionment.',
    'If you are certifying that you are married for VA benefits purposes, your marriage must be recognized by the place where you and your spouse resided at the time of marriage, or where you or your spouse resided when you filed your claim or later became eligible for benefits.',
    'Answer all questions fully and accurately.',
  ],
  whatYouNeedHeader: 'Gather your information',
  whatYouNeedItems: [
    {
      label: 'Veteran information',
      text:
        "The Veteran's name, Social Security number, VA file number, and date of birth",
    },
    {
      label: 'Claimant information',
      text:
        'Your name, relationship to the Veteran, address, telephone number, and email address',
    },
    {
      label: 'Apportionment information',
      text:
        "The person or people you're requesting an apportionment for and the reason for your request",
    },
  ],
  startHeader: 'Start your request',
  startBody:
    'We’ll guide you through each section of the form. It should take about 15 minutes.',
  startFollowup: 'You can save your progress and come back later.',
};

export const confirmationPageText = {
  thankYou: 'Thank you for submitting your request for apportionment.',
  nextStep:
    "After we review your form, we'll contact you if we need more information.",
  confirmationPrefix: 'Your confirmation number is',
};

export const informationRequiredText = {
  pageTitle: 'Information we are required to share',
  aboutFormTitle:
    "I understand that VA Form 21-0788 is used to request an apportionment of a beneficiary's award.",
  aboutFormHeadline: 'About VA Form 21-0788',
  aboutFormDescription:
    'In certain limited circumstances, a Veteran’s disability award or a surviving spouse’s award may be apportioned to a spouse, child, or dependent parent.',
  aboutFormError: 'You must acknowledge the purpose of this form to continue.',
  privacyActTitle:
    'I have read the Privacy Act and Respondent Burden information.',
  privacyActHeadline: 'Privacy Act and Respondent Burden',
  privacyActDescription:
    'The information you submit is used to determine benefits and may be disclosed for authorized routine uses under the Privacy Act.',
  privacyActError:
    'You must acknowledge the Privacy Act and Respondent Burden information to continue.',
};

export const veteranInformationText = {
  pageTitle: "Section I: Veteran's identification information",
  pageDescription:
    "Provide the Veteran's identifying information exactly as it appears on VA records when possible.",
  basicInfoHeading: "Veteran's basic information",
  firstNameTitle: 'First name',
  middleInitialTitle: 'Middle initial',
  lastNameTitle: 'Last name',
  firstNameError: "Enter the Veteran or service member's first name",
  lastNameError: "Enter the Veteran or service member's last name",
  dateOfBirthTitle: 'Date of birth',
  dateOfBirthHint: 'For example: January 19, 2022',
  dateOfBirthRequiredError:
    'Please provide the Veteran or service member’s date of birth, include the 4-digit year',
  dateOfBirthIncompleteError: 'Please enter a complete date',
  dateOfBirthPatternError: 'Please enter a valid date of birth',
  ssnRequiredError: "Please Enter the Veteran or service member's SSN",
  ssnPatternError:
    'Please enter a valid 9 digit Social Security number (dashes allowed)',
  vaFileNumberTitle: 'VA file number',
};

export const claimantInformationText = {
  pageTitle:
    'Section II: Information on claimant or individual acting on behalf of a minor child',
  nameTitle: 'Your name',
  firstNameTitle: 'First name',
  middleInitialTitle: 'Middle initial',
  lastNameTitle: 'Last name',
  firstNameError: "Enter the Veteran or service member's first name",
  lastNameError: "Enter the Veteran or service member's last name",
  relationshipTitle: 'Relationship to Veteran',
  otherRelationshipTitle: 'Other relationship',
  addressPageTitle: 'Your address',
  addressPageDescription:
    'Provide your current mailing address and contact information.',
  streetLabel: 'Street address',
  apartmentUnitLabel: 'Apartment or unit number',
  cityLabel: 'City',
  stateLabel: 'State',
  zipCodeLabel: 'ZIP code',
  streetRequiredError: 'Enter the Veteran or service member’s street address',
  phoneTitle: 'Primary telephone number',
  phoneRequiredError:
    'Enter a valid United States of America phone number. Use 10 digits.',
  emailTitle: 'Email address',
  emailHint:
    "We'll use this email address to confirm when we receive your form",
  emailError:
    'Enter a valid email address without spaces using this format: email@domain.com',
};

export const apportionmentInformationText = {
  pageTitle: 'Section III: Apportionment information',
  pageDescription:
    'Only complete the portions of this section that apply to your request.',
  requestedPeopleSummaryTitle: 'People you are requesting apportionment for',
  requestedPeopleSummaryHint:
    'You’ll need to add at least 1 person. You can add up to 4 people.',
  requestedPeopleSummaryDescription:
    'Add each person you are requesting an apportionment for. For each person, we’ll ask for their name, relationship to the Veteran, and whether they currently receive an apportionment.',
  requestedPeopleItemTitle: 'Requested apportionment person',
  requestedPeopleIdentityPageTitle: 'Person name and Social Security number',
  requestedPeopleRelationshipPageTitle: 'Relationship to the Veteran',
  requestedPeopleReceiptPageTitle: 'Current apportionment status',
  requestedPeopleStepchildPageTitle: 'Stepchild household status',
  requestedPeopleStepchildDatePageTitle:
    "Date the stepchild left the Veteran's household",
  requestedPeopleAdoptionPageTitle: 'Adoption question',
  requestedPeopleNounSingular: 'person',
  requestedPeopleNounPlural: 'people',
  firstNameTitle: 'First name',
  middleInitialTitle: 'Middle initial',
  lastNameTitle: 'Last name',
  firstNameError: "Enter the Veteran or service member's first name",
  lastNameError: "Enter the Veteran or service member's last name",
  ssnRequiredError: "Please Enter the Veteran or service member's SSN",
  ssnPatternError:
    'Please enter a valid 9 digit Social Security number (dashes allowed)',
  relationshipTitle: 'Relationship to the Veteran',
  currentlyReceivingTitle:
    'Is the individual currently in receipt of an apportionment?',
  requestedPeopleError:
    'Please select "Yes" to add at least 1 person you are requesting an apportionment for.',
  stepchildQuestionTitle:
    "If any person listed above is the Veteran's stepchild, is the stepchild still living in the Veteran's household?",
  stepchildDepartureDateTitle:
    "Date the stepchild left the Veteran's household",
  stepchildDepartureDateHint: 'For example: January 19, 2022',
  adoptedChildrenTitle:
    "Has the Veteran's child(ren) for whom the apportionment is claimed been legally adopted by another person?",
  q13PageTitle: 'Reason for the apportionment claim',
  q13aPageTitle: '13A. Provide the reason for the apportionment claim',
  q13bPageTitle:
    '13B. Provide the name and address of the facility where the beneficiary is incarcerated or receiving care',
  q13IntroDescription:
    'Select the statement that best describes the reason for the apportionment claim. If you select one of the incarceration reasons, choose whether the conviction was a felony or misdemeanor.',
  q13aReasonTitle: 'Reason for the apportionment claim',
  q13aReasonLabels: {
    veteranIncarcerated:
      'Veteran is incarcerated for more than 60 days as a result of conviction',
    survivingBeneficiaryIncarcerated:
      'Surviving spouse or child is incarcerated for more than 60 days as a result of conviction',
    veteranIncompetentInCare:
      "Veteran is incompetent, without fiduciary, and is receiving hospital treatment, nursing home, or domiciliary care provided by the United States or political subdivision and the Veteran's benefits are not being paid to the Veteran's spouse",
    veteranReceivingPensionInCare:
      'Veteran is in receipt of pension and is receiving hospital, domiciliary, or nursing home care by the United States or a political subdivision',
    beneficiaryInEnemyTerritory:
      'The primary beneficiary resides in the territory of or under the control of an enemy of the United States or its allies',
    veteranDisappeared:
      'The Veteran has disappeared for 90 days or more and their whereabouts remain unknown',
  },
  q13aReasonError: 'Select the reason for the apportionment claim',
  veteranIncarceratedTitle:
    'Has the Veteran been incarcerated for more than 60 days?',
  convictionFelonyOrMisdemeanorTitle:
    'Was the conviction for a felony or misdemeanor? (38 U.S.C. 5313)',
  survivingBeneficiaryIncarceratedTitle:
    'Has the surviving spouse or child been incarcerated for more than 60 days?',
  veteranIncompetentInCareTitle:
    'Is the Veteran incompetent, without a fiduciary, and receiving hospital treatment, nursing home, or domiciliary care?',
  veteranReceivingPensionInCareTitle:
    'Is the Veteran receiving pension and receiving hospital, domiciliary, or nursing home care?',
  beneficiaryInEnemyTerritoryTitle:
    'Does the primary beneficiary reside in territory of or under the control of an enemy of the United States or its allies?',
  veteranDisappearedTitle:
    'Has the Veteran disappeared for 90 days or more and do their whereabouts remain unknown?',
  yesNoError: 'Select Yes or No',
  convictionTypeError: 'Select felony or misdemeanor',
  convictionTypeLabels: {
    felony: 'Felony',
    misdemeanor: 'Misdemeanor',
  },
  facilityNameTitle: 'Name of facility',
  facilityAddressTitle: 'Address of facility',
  facilityPageTitle:
    '13B. Provide the name and address of the facility where the beneficiary is incarcerated or receiving care',
  facilityPageDescription:
    'Provide the facility name and address for the qualifying incarceration or care situation.',
};

export const remarksCertificationText = {
  pageTitle: 'Sections IV and V: Remarks and certification',
  pageDescription:
    'Add any remarks and certify your request before continuing.',
  remarksTitle: 'Remarks (if any)',
  certifyTitle:
    'I certify that I have completed this statement and that its information is true and correct to the best of my knowledge and belief.',
  certifyError: 'You must certify to continue.',
  penaltyHeadline: 'Penalty',
  penaltyBody:
    'The law provides severe penalties, which include fine or imprisonment or both, for the willful submission of any statement or evidence of a material fact, knowing it to be false, or for the fraudulent acceptance of any payment to which you are not entitled.',
};

export const formConfigText = {
  statementOfTruth:
    'I confirm that the information in this form is accurate and has been represented correctly.',
  inProgressMessage:
    "Your request for apportionment of a beneficiary's award is in progress.",
  expiredMessage:
    "Your saved request for apportionment of a beneficiary's award has expired.",
  savedMessage:
    "Your request for apportionment of a beneficiary's award has been saved.",
  notFoundMessage:
    "Please start over to complete your request for apportionment of a beneficiary's award.",
  noAuthMessage:
    "Please sign in again to continue your request for apportionment of a beneficiary's award.",
  appType: 'claimant form',
  submitButtonText: 'Submit',
};
