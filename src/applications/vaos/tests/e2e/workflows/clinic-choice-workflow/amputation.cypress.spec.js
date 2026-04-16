import { addMonths, subDays } from 'date-fns';
import { getTypeOfCareById } from '../../../../utils/appointment';
import { TYPE_OF_CARE_IDS } from '../../../../utils/constants';
import MockAppointmentResponse from '../../../fixtures/MockAppointmentResponse';
import MockClinicResponse from '../../../fixtures/MockClinicResponse';
import MockEligibilityResponse from '../../../fixtures/MockEligibilityResponse';
import MockFacilityResponse from '../../../fixtures/MockFacilityResponse';
import MockSlotResponse from '../../../fixtures/MockSlotResponse';
import MockUser from '../../../fixtures/MockUser';
import AppointmentListPageObject from '../../page-objects/AppointmentList/AppointmentListPageObject';
import ClinicChoicePageObject from '../../page-objects/ClinicChoicePageObject';
import TypeOfCarePageObject from '../../page-objects/TypeOfCarePageObject';
import UrgentCareInformationPageObject from '../../page-objects/UrgentCareInformationPageObject';
import VAFacilityPageObject from '../../page-objects/VAFacilityPageObject';
import {
  getDateRanges,
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

describe('VAOS ClinicChoicePage workflow - Amputation care', () => {
  beforeEach(() => {
    vaosSetup();

    mockAppointmentsGetApi({ response: [] });
    mockFeatureToggles();
    mockVamcEhrApi();
  });

  describe('When a single facility supports online scheduling', () => {
    const clinicResponses = MockClinicResponse.createResponses({ count: 2 });

    beforeEach(() => {
      mockClinicsApi({
        locationId: '983',
        response: clinicResponses,
      });
    });

    describe('And single clinic and appointment history is required', () => {
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

      it('should show the correct clinic name when filtered to matching', () => {
        // Arrange
        const mockUser = new MockUser({ addressLine1: '123 Main St.' });

        // Create appointment history for the 1st clinic only
        const pastAppointments = new MockAppointmentResponse({
          localStartTime: subDays(new Date(), 1),
        })
          .setClinicId(clinicResponses[0].id)
          .setLocationId('983')
          .setTypeOfCare('amputation');

        const dateRanges = getDateRanges(3);
        dateRanges.forEach(range => {
          mockAppointmentsGetApi({
            start: range.start,
            end: range.end,
            useRFC3339: false,
            response: [pastAppointments],
            statuses: [
              'booked',
              'arrived',
              'fulfilled',
              'cancelled',
              'checked-in',
            ],
          });
        });

        // Act
        cy.login(mockUser);

        AppointmentListPageObject.visit().scheduleAppointment();

        UrgentCareInformationPageObject.assertUrl().scheduleAppointment();

        TypeOfCarePageObject.assertUrl()
          .assertAddressAlert({ exist: false })
          .selectTypeOfCare(/Amputation care/i)
          .clickNextButton();

        VAFacilityPageObject.assertUrl()
          .selectLocation(/Facility 983/i)
          .clickNextButton();

        ClinicChoicePageObject.assertUrl()
          .assertText({
            text: new RegExp(
              `Your last amputation care appointment was at ${clinicResponses[0].getClinicName()}`,
              'i',
            ),
          })
          .assertText({
            text: /Do you you want to schedule your appointment at this clinic?/i,
          })
          .selectClinic({
            selection: new RegExp(
              `Yes, make my appointment at ${clinicResponses[0].getClinicName()}`,
              'i',
            ),
          })
          .clickNextButton();

        // Assert
        cy.axeCheckBestPractice();
      });
    });
  });
});
