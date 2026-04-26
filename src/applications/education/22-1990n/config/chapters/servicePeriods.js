import {
  currentOrPastDateUI,
  currentOrPastDateSchema,
  textUI,
  textSchema,
  selectUI,
  selectSchema,
} from 'platform/forms-system/src/js/web-component-patterns';

const SERVICE_COMPONENT_LABELS = {
  USA: 'U.S. Army (USA)',
  USN: 'U.S. Navy (USN)',
  USAF: 'U.S. Air Force (USAF)',
  USMC: 'U.S. Marine Corps (USMC)',
  USCG: 'U.S. Coast Guard (USCG)',
  USAR: 'U.S. Army Reserve (USAR)',
  ARNG: 'U.S. Army National Guard (ARNG)',
  USNR: 'U.S. Naval Reserve (USNR)',
  AFRES: 'U.S. Air Force Reserve (AFRES)',
  ANG: 'U.S. Air National Guard (ANG)',
  USMCR: 'U.S. Marine Corps Reserve (USMCR)',
  CGRES: 'U.S. Coast Guard Reserve (CGRES)',
};

const SERVICE_COMPONENT_KEYS = Object.keys(SERVICE_COMPONENT_LABELS);

export const servicePeriodsUiSchema = {
  serviceInformation: {
    servicePeriods: {
      'ui:title': 'Service periods',
      'ui:description':
        'Enter at least one period of military service. Add additional periods as needed.',
      items: {
        dateEnteredService: currentOrPastDateUI({
          title: 'Date entered service',
          hint: 'Enter the date you began your period of military service.',
          errorMessages: {
            required: 'Please enter your service entry date.',
          },
        }),
        dateSeparated: currentOrPastDateUI({
          title: 'Date separated from service',
          hint:
            'Leave blank if you are still on active duty.',
        }),
        serviceComponent: selectUI({
          title: 'Service component',
          hint: 'Select the branch and component you served in during this period.',
          labels: SERVICE_COMPONENT_LABELS,
          errorMessages: {
            required: 'Please select your service component.',
          },
        }),
        serviceStatus: textUI({
          title: 'Service status',
          hint:
            'Describe your service status during this period. Examples: Active duty, Drilling reservist, IRR',
          errorMessages: {
            required: 'Please enter your service status.',
          },
        }),
      },
      'ui:options': {
        itemName: 'Service Period',
        viewField: ServicePeriodViewField,
      },
    },
  },
};

function ServicePeriodViewField({ formData }) {
  if (!formData) return null;
  const { serviceComponent, dateEnteredService } = formData;
  return (
    <div>
      <strong>
        {serviceComponent || 'Unknown branch'} —{' '}
        {dateEnteredService || 'Unknown entry date'}
      </strong>
    </div>
  );
}

ServicePeriodViewField.propTypes = {};

export const servicePeriodsSchema = {
  type: 'object',
  required: ['serviceInformation'],
  properties: {
    serviceInformation: {
      type: 'object',
      required: ['servicePeriods'],
      properties: {
        servicePeriods: {
          type: 'array',
          minItems: 1,
          maxItems: 10,
          items: {
            type: 'object',
            required: ['dateEnteredService', 'serviceComponent', 'serviceStatus'],
            properties: {
              dateEnteredService: currentOrPastDateSchema,
              dateSeparated: {
                type: 'string',
                pattern: '^\\d{4}-\\d{2}-\\d{2}$',
              },
              serviceComponent: selectSchema(SERVICE_COMPONENT_KEYS),
              serviceStatus: {
                type: 'string',
                maxLength: 50,
                minLength: 1,
              },
            },
          },
        },
      },
    },
  },
};