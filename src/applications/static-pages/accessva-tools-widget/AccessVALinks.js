/**
 * AccessVA Tools and Services URL Constants
 *
 * This file contains all the production URLs for AccessVA tools and services.
 * Update URLs here when they change - no need to modify the widget component.
 *
 * Categories:
 * - veterans: Services for Veterans, family members, and service members
 * - business: Services for Business partners, employees, and contractors
 */

export const ACCESSVA_LINKS = {
  veterans: [
    { text: 'AskVA', url: 'https://www.va.gov/contact-us/ask-va/' },
    {
      text: 'Fiduciary Accountings Submission Tool (FAST)',
      url:
        'https://eauth.va.gov/accessva/?cspSelectFor=https%3A//www.my.va.gov/FAST&ForceAuthn=false',
    },
    {
      text: 'Life Insurance Online Policy Access',
      url: 'https://eauth.va.gov/accessva/?cspSelectFor=einsurance',
    },
    {
      text: 'Million Veteran Program (MVP)',
      url: 'https://eauth.va.gov/accessva/?cspSelectFor=mvp',
    },
    {
      text: 'QuickSubmit',
      url: 'https://eauth.va.gov/accessva/?cspSelectFor=quicksubmit',
    },
    {
      text: 'Sports4Vets',
      url:
        'https://eauth.va.gov/accessva/?cspSelectFor=https%3A//www.my.va.gov/Veterans&ForceAuthn=false',
    },
    {
      text: 'VA Life Insurance (VALife)',
      url: 'https://www.va.gov/life-insurance/options-eligibility/valife/',
    },
    {
      text: 'VetBiz Portal',
      url: 'https://eauth.va.gov/accessva/?cspSelectFor=vetbiz',
    },
    { text: 'VetRide', url: 'https://www.vetride.va.gov/app/home' },
    {
      text:
        'Veterans Exposure Team - Health Outcomes Military Exposures (VET-HOME)',
      url: 'https://vethome.va.gov/',
    },
    {
      text: 'Veterans Health Venture Studio',
      url: 'https://dvagov-vhventures-prod-portal.powerappsportals.us/',
    },
    {
      text: 'Veterans Identification Card (VIC)',
      url: 'https://www.va.gov/records/get-veteran-id-cards/vic/',
    },
    {
      text: 'Veteran Travel Claim Entry',
      url: 'https://www.va.gov/health-care/file-travel-pay-reimbursement/',
    },
    {
      text: 'Veteran Health Identification Card (VHIC)',
      url: 'https://www.va.gov/health-care/get-health-id-card/',
    },
  ],
  business: [
    { text: 'AskVA', url: 'https://www.va.gov/contact-us/ask-va/' },
    { text: 'Box', url: 'https://eauth.va.gov/accessva/?cspSelectFor=box' },
    { text: 'Box High Impact', url: 'https://veteransaffairs-frhext.box.com/' },
    {
      text: 'Centralized Mail Portal',
      url: 'https://eauth.va.gov/accessva/?cspSelectFor=dmhs',
    },
    {
      text: 'Community Care Referrals and Authorization (CCR&A)',
      url: 'https://eauth.va.gov/accessva/?cspSelectFor=ccra',
    },
    {
      text: 'Education Development Management System (EDMS)',
      url: 'https://www.my.va.gov/DODLiaison',
    },
    {
      text: 'Fiduciary Accountings Submission Tool (FAST)',
      url: 'https://www.my.va.gov/FAST',
    },
    {
      text: 'Financial Services Center PCS Travel iMOVE Approver Portal',
      url: 'https://imove-approver.mlinqsonline.net/',
    },
    {
      text: 'Financial Services Center PCS Travel iMOVE Employee Portal',
      url: 'https://imove-employee.mlinqsonline.net/',
    },
    { text: 'Gen3 Data Commons', url: 'https://va.data-commons.org/login' },
    { text: 'Grants4Vets', url: 'https://www.my.va.gov/nvspsegrantee' },
    {
      text: 'Homeless Management Information System (HMIS)',
      url: 'https://www.hmisrepository.va.gov/',
    },
    {
      text: 'IAM Invitation Service',
      url: 'https://eauth.va.gov/accessva/?cspSelectFor=iamiis',
    },
    { text: 'Kahua', url: 'https://launch.kahuafn.com/web/' },
    { text: 'ProjNet', url: 'https://projnet2.org/' },
    { text: 'Prosthetics Vendor Portal', url: 'https://www.my.va.gov/PVP' },
    {
      text: 'Puppies Assisting Wounded Service Members',
      url: 'https://omhsp-paws-prod.powerappsportals.us/',
    },
    { text: 'QGenda', url: 'https://login.qgenda.com/' },
    {
      text: 'QuickSubmit',
      url: 'https://eauth.va.gov/accessva/?cspSelectFor=quicksubmit',
    },
    {
      text: 'Remote Order Entry System (ROES)',
      url: 'https://eauth.va.gov/accessva/?cspSelectFor=roes',
    },
    {
      text: 'Stakeholder Enterprise Portal (SEP)',
      url: 'https://eauth.va.gov/accessva/?cspSelectFor=sep',
    },
    {
      text: 'SourceTrack',
      url: 'https://eauth.va.gov/accessva/?cspSelectFor=smts',
    },
    {
      text: 'Sports4Vets for Certifying Officials and NVGAG Volunteers',
      url: 'https://www.my.va.gov/stipends4vets',
    },
    { text: 'Squares', url: 'https://www.my.vaemcc.va.gov/SQUARES' },
    {
      text: 'VA Caregiver Support',
      url:
        'https://www.va.gov/family-and-caregiver-benefits/health-and-disability/comprehensive-assistance-for-family-caregivers/',
    },
    {
      text: 'VA Loan Electronic Reporting Interface Reengineering (VALERI-R)',
      url: 'https://eauth.va.gov/accessva/?cspSelectFor=valerir',
    },
    {
      text: 'VetBiz Portal (VetBiz)',
      url: 'https://eauth.va.gov/accessva/?cspSelectFor=vetbiz',
    },
    {
      text: 'Veterans Benefits Management Platform (VBMS)',
      url: 'https://eauth.va.gov/accessva/?cspSelectFor=bip',
    },
    {
      text: 'Veterans Identification Card (VIC)',
      url: 'https://www.va.gov/records/get-veteran-id-cards/vic/',
    },
    {
      text: 'Veterans Health Venture Studio',
      url: 'https://dvagov-vhventures-prod-portal.powerappsportals.us/',
    },
    {
      text: 'Veterans Re-Entry Search Service (VRSS)',
      url: 'https://vrss.va.gov/',
    },
    { text: 'VTA IDES', url: 'https://www.my.vavet.va.gov/AccessVTA' },
    { text: 'VLogicFM', url: 'https://www.vlogicfm.us/' },
    {
      text: 'yourIT',
      url:
        'https://eauth.va.gov/accessva/?cspSelectFor=yourit&targetPath=/selfservice',
    },
  ],
};
