export const MODALITY_CONFIG = {
  communityCareEps: { text: 'In-person', icon: 'location_city' },
  communityCare: { text: 'In-person', icon: 'location_city' },
  vaInPerson: { text: 'In-person', icon: 'location_city' },
  vaInPersonVaccine: { text: 'In-person', icon: 'location_city' },
  vaPhone: { text: 'Phone', icon: 'phone' },
  vaVideoCareAtHome: { text: 'Video', icon: 'videocam' },
  vaVideoCareAtAnAtlasLocation: { text: 'Video', icon: 'videocam' },
  inPerson: { text: 'In-person', icon: 'location_city' },
  phone: { text: 'Phone', icon: 'phone' },
  video: { text: 'Video', icon: 'videocam' },
};

export const DEFAULT_MODALITY = { text: 'In-person', icon: 'location_city' };

export function getModalityDisplay(modality) {
  return MODALITY_CONFIG[modality] || DEFAULT_MODALITY;
}
