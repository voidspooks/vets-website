import { expect } from 'chai';
import MockDate from 'mockdate';
import {
  generateSlotsForDay,
  transformSlotsForCommunityCare,
} from '../../../services/mocks/utils/slots';
import { mockToday } from '../../../tests/mocks/constants';

const draftAppointmentUtil = require('../../utils/provider');

describe('VAOS provider utils', () => {
  afterEach(() => {
    MockDate.reset();
  });
  describe('createDraftAppointmentInfo', () => {
    it('Creates empty slots array with 0', () => {
      const providerObjectNoSlots = draftAppointmentUtil.createDraftAppointmentInfo();
      expect(providerObjectNoSlots.attributes.slots.length).to.equal(0);
    });
  });
  describe('getSlotByDate', () => {
    it('returns the correct object for a given data', () => {
      const slots = generateSlotsForDay(mockToday, {
        slotsPerDay: 1,
        slotDuration: 60,
        businessHours: {
          start: 12,
          end: 18,
        },
      });
      const transformedSlots = transformSlotsForCommunityCare(slots);
      const date = transformedSlots[0].start;
      expect(
        draftAppointmentUtil.getSlotByDate(transformedSlots, date),
      ).to.equal(transformedSlots[0]);
    });
  });

  describe('mergeProviderSlotsWithSnapshot', () => {
    const vaParams = {
      providerType: 'va',
      clinicId: '437',
      locationId: '983',
      clinicalService: 'primaryCare',
    };
    const vaSnapshot = {
      providerType: 'va',
      id: '437',
      locationId: '983',
      serviceType: 'primaryCare',
      name: 'Merged clinic name',
      facilityName: 'Merged facility',
      phone: '555-0000',
    };
    const minimalVaDraft = {
      id: 'draft-eps',
      type: 'draft_appointment',
      attributes: {
        careType: 'VA',
        provider: {
          id: '437',
          type: 'unified_provider',
          attributes: {
            providerType: 'va',
            name: '',
            facilityName: '',
          },
        },
        slots: [],
      },
    };

    it('fills blank unified_provider fields when snapshot matches params', () => {
      const merged = draftAppointmentUtil.mergeProviderSlotsWithSnapshot(
        minimalVaDraft,
        vaSnapshot,
        vaParams,
      );
      expect(merged.attributes.provider.attributes.name).to.equal(
        'Merged clinic name',
      );
      expect(merged.attributes.provider.attributes.phone).to.equal('555-0000');
    });

    it('returns the same object reference when snapshot does not match params', () => {
      const badParams = { ...vaParams, clinicId: '999' };
      const merged = draftAppointmentUtil.mergeProviderSlotsWithSnapshot(
        minimalVaDraft,
        vaSnapshot,
        badParams,
      );
      expect(merged).to.equal(minimalVaDraft);
    });

    it('does not overwrite non-empty API fields', () => {
      const draft = {
        ...minimalVaDraft,
        attributes: {
          ...minimalVaDraft.attributes,
          provider: {
            ...minimalVaDraft.attributes.provider,
            attributes: {
              ...minimalVaDraft.attributes.provider.attributes,
              name: 'From API',
            },
          },
        },
      };
      const merged = draftAppointmentUtil.mergeProviderSlotsWithSnapshot(
        draft,
        vaSnapshot,
        vaParams,
      );
      expect(merged.attributes.provider.attributes.name).to.equal('From API');
    });
  });

  describe('normalizeSlotsProvider', () => {
    it('uses VA fallback when name and facilityName are both empty', () => {
      const flat = draftAppointmentUtil.normalizeSlotsProvider({
        id: '437',
        type: 'unified_provider',
        attributes: {
          providerType: 'va',
          name: '',
          facilityName: '',
          locationId: '983',
        },
      });
      expect(flat.name).to.equal('Not available');
      expect(flat.individualProviders[0].name).to.equal('Not available');
      expect(flat.providerOrganization.name).to.equal('Not available');
      expect(flat.location.name).to.equal('Not available');
    });

    it('uses community care fallback when name and facilityName are both empty', () => {
      const flat = draftAppointmentUtil.normalizeSlotsProvider({
        id: 'svc-1',
        type: 'unified_provider',
        attributes: {
          providerType: 'community_care',
          name: '',
          facilityName: '',
          providerServiceId: 'svc-1',
        },
      });
      expect(flat.name).to.equal('Provider name not available');
      expect(flat.individualProviders[0].name).to.equal(
        'Provider name not available',
      );
    });

    it('still prefers non-empty API name and facilityName', () => {
      const flat = draftAppointmentUtil.normalizeSlotsProvider({
        id: 'clinic-1',
        type: 'unified_provider',
        attributes: {
          providerType: 'va',
          name: '  Clinic A  ',
          facilityName: '',
          locationId: '983',
        },
      });
      expect(flat.name).to.equal('Clinic A');
      expect(flat.location.name).to.equal('Clinic A');
    });
  });
});
