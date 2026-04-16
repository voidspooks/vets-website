import { addMonths } from 'date-fns';
import { getTypeOfCareById } from '../../../../utils/appointment';
import { TYPE_OF_CARE_IDS } from '../../../../utils/constants';
import MockClinicResponse from '../../../fixtures/MockClinicResponse';
import MockEligibilityResponse from '../../../fixtures/MockEligibilityResponse';
import MockFacilityResponse from '../../../fixtures/MockFacilityResponse';
import MockSlotResponse from '../../../fixtures/MockSlotResponse';
import MockUser from '../../../fixtures/MockUser';
import AppointmentListPageObject from '../../page-objects/AppointmentList/AppointmentListPageObject';
import ClinicChoicePageObject from '../../page-objects/ClinicChoicePageObject';
import TypeOfCarePageObject from '../../page-objects/TypeOfCarePageObject';
import TypeOfFacilityPageObject from '../../page-objects/TypeOfFacilityPageObject';
import UrgentCareInformationPageObject from '../../page-objects/UrgentCareInformationPageObject';
import VAFacilityPageObject from '../../page-objects/VAFacilityPageObject';
import {
  mockAppointmentsGetApi,
  mockClinicsApi,
  mockEligibilityApi,
  mockEligibilityCCApi,
  mockFacilitiesApi,
  mockFeatureToggles,
  mockSchedulingConfigurationApi,
  mockSlotsApi,
  mockVamcEhrApi,
  vaosSetup,
} from '../../vaos-cypress-helpers';

const { idV2: typeOfCareId, cceType } = getTypeOfCareById(
  TYPE_OF_CARE_IDS.PRIMARY_CARE,
);

describe('VAOS ClinicChoicePage workflow - Primary care', () => {
  beforeEach(() => {
    vaosSetup();

    mockAppointmentsGetApi({ response: [] });
    mockFeatureToggles();
    mockVamcEhrApi();
  });

  describe('When more than one facility supports online scheduling', () => {
    beforeEach(() => {
      const mockEligibilityResponse = new MockEligibilityResponse({
        facilityId: '983',
        typeOfCareId,
        isEligible: true,
      });

      mockFacilitiesApi({
        response: MockFacilityResponse.createResponses({
          facilityIds: ['983', '984'],
        }),
      });
      mockEligibilityApi({ response: mockEligibilityResponse });
      mockEligibilityCCApi({ cceType, isEligible: true });
      mockSchedulingConfigurationApi({
        facilityIds: ['983', '984'],
        typeOfCareId,
        isDirect: true,
        isRequest: true,
      });
      mockSlotsApi({
        locationId: '983',
        clinicId: '1',
        response: MockSlotResponse.createResponses({
          startTimes: [addMonths(new Date(), 1)],
        }),
      });
    });

    describe('And multiple clinics', () => {
      beforeEach(() => {
        mockClinicsApi({
          locationId: '983',
          response: MockClinicResponse.createResponses({ count: 2 }),
        });
      });

      it('should go to direct schedule flow when choosing a clinic', () => {
        // Arrange
        const mockUser = new MockUser({ addressLine1: '123 Main St.' });

        // Act
        cy.login(mockUser);

        AppointmentListPageObject.visit().scheduleAppointment();

        UrgentCareInformationPageObject.assertUrl().scheduleAppointment();

        TypeOfCarePageObject.assertUrl()
          .assertAddressAlert({ exist: false })
          .selectTypeOfCare(/Primary care/i)
          .clickNextButton();

        TypeOfFacilityPageObject.assertUrl()
          .assertTypeOfFacilityValidationErrors()
          .selectTypeOfFacility(/VA medical center or clinic/i)
          .clickNextButton();

        VAFacilityPageObject.assertUrl()
          .selectLocation(/Facility 983/i)
          .clickNextButton();

        ClinicChoicePageObject.assertUrl()
          .assertClinicChoiceValidationErrors()
          .selectClinic({ selection: /Clinic 1/i })
          .clickNextButton();

        // Assert
        cy.axeCheckBestPractice();
      });

      it('should go to the request flow when choosing last option', () => {
        // Arrange
        const mockUser = new MockUser({ addressLine1: '123 Main St.' });

        // Act
        cy.login(mockUser);

        AppointmentListPageObject.visit().scheduleAppointment();

        UrgentCareInformationPageObject.assertUrl().scheduleAppointment();

        TypeOfCarePageObject.assertUrl()
          .assertAddressAlert({ exist: false })
          .selectTypeOfCare(/Primary care/i)
          .clickNextButton();

        TypeOfFacilityPageObject.assertUrl()
          .assertTypeOfFacilityValidationErrors()
          .selectTypeOfFacility(/VA medical center or clinic/i)
          .clickNextButton();

        VAFacilityPageObject.assertUrl()
          .selectLocation(/Facility 983/i)
          .clickNextButton();

        ClinicChoicePageObject.assertUrl()
          .assertClinicChoiceValidationErrors()
          .selectClinic({ selection: /I need a different clinic/i })
          .clickNextButton();

        // Assert
        cy.axeCheckBestPractice();
      });
    });

    describe('And single clinic', () => {
      beforeEach(() => {
        mockClinicsApi({
          locationId: '983',
          response: MockClinicResponse.createResponses({ count: 1 }),
        });
      });

      it('should show a yes/no choice when a single clinic is available and past history is not required', () => {
        // Arrange
        const mockUser = new MockUser({ addressLine1: '123 Main St.' });

        // Act
        cy.login(mockUser);

        AppointmentListPageObject.visit().scheduleAppointment();

        UrgentCareInformationPageObject.assertUrl().scheduleAppointment();

        TypeOfCarePageObject.assertUrl()
          .assertAddressAlert({ exist: false })
          .selectTypeOfCare(/Primary care/i)
          .clickNextButton();

        TypeOfFacilityPageObject.assertUrl()
          .assertTypeOfFacilityValidationErrors()
          .selectTypeOfFacility(/VA medical center or clinic/i)
          .clickNextButton();

        VAFacilityPageObject.assertUrl()
          .selectLocation(/Facility 983/i)
          .clickNextButton();

        ClinicChoicePageObject.assertUrl()
          .selectClinic({ selection: /Yes, make my appointment at Clinic 1/i })
          .clickNextButton();

        // Assert
        cy.axeCheckBestPractice();
      });

      it('should retain form data after page changes', () => {
        // Arrange
        const mockUser = new MockUser({ addressLine1: '123 Main St.' });

        // Act
        cy.login(mockUser);

        AppointmentListPageObject.visit().scheduleAppointment();

        UrgentCareInformationPageObject.assertUrl().scheduleAppointment();

        TypeOfCarePageObject.assertUrl()
          .assertAddressAlert({ exist: false })
          .selectTypeOfCare(/Primary care/i)
          .clickNextButton();

        TypeOfFacilityPageObject.assertUrl()
          .assertTypeOfFacilityValidationErrors()
          .selectTypeOfFacility(/VA medical center or clinic/i)
          .clickNextButton();

        VAFacilityPageObject.assertUrl()
          .selectLocation(/Facility 983/i)
          .clickNextButton();

        ClinicChoicePageObject.assertUrl()
          .selectClinic({ selection: /Yes, make my appointment at Clinic 1/i })
          .clickBackButton()
          .clickNextButton()
          .clickNextButton();

        // Assert
        cy.axeCheckBestPractice();
      });
    });
  });
});
