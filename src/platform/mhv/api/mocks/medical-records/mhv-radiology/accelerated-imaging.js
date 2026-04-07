/**
 * Mock data for the accelerated imaging studies endpoints
 *
 * Endpoints served:
 *   GET /my_health/v2/medical_records/imaging             → studies list
 *   GET /my_health/v2/medical_records/imaging/:id/thumbnails → study w/ presigned thumbnail URLs
 *   GET /my_health/v2/medical_records/imaging/:id/dicom      → study w/ presigned DICOM zip URL
 *   GET /my_health/v2/medical_records/imaging/thumbnail_proxy → serves a JPEG placeholder
 *
 * Each study date is set to match its corresponding radiology lab record
 * in the accelerated labs mock (within the 10-minute merge tolerance), so
 * they will pair correctly when the MERGE_IMAGING_STUDIES action fires:
 *   Study 1 (CHEST)   → 2024-12-05T12:50  matches FACIAL BONE lab
 *   Study 2 (ABDOMEN) → 2024-12-05T14:30  matches ABDOMEN lab
 */

const path = require('path');

// ---------------------------------------------------------------------------
// Study data
// ---------------------------------------------------------------------------

const STUDY_1_ID = 'urn-vastudy-200CRNR-CM-4-chest-xray-match';
const STUDY_2_ID = 'urn-vastudy-200CRNR-CM-5-abdomen-match';

const makeStudy = ({
  id,
  identifier,
  description,
  notes,
  imageCount,
  series,
  date,
  eventId = null,
  thumbnailsReady = false,
  dicomReady = false,
}) => ({
  id,
  type: 'imaging_study',
  attributes: {
    id,
    eventId,
    identifier,
    status: 'available',
    modality: 'CR',
    date,
    description,
    notes,
    patientId: '1012740414V122180',
    seriesCount: series.length,
    imageCount,
    series: series.map(s => ({
      ...s,
      instances: s.instances.map(inst => ({
        ...inst,
        thumbnailUrl: thumbnailsReady
          ? `https://s3.amazonaws.com/mock-va-imaging/thumbnails/${
              inst.imageId
            }.jpg`
          : null,
      })),
    })),
    dicomZipUrl: dicomReady
      ? `https://s3.amazonaws.com/mock-va-imaging/dicom/${id}.zip`
      : null,
  },
});

const study1Series = [
  {
    uid: '1.2.840.113619.2.55.3.604688119.968.1234567890.1',
    number: 1,
    modality: 'CR',
    instances: [
      {
        uid: '1.2.840.113619.2.55.3.604688119.968.1234567890.1.1',
        number: 1,
        title: 'PA View',
        sopClass: '1.2.840.10008.5.1.4.1.1.1',
        imageId:
          'urn:vaimage:200CRNR-CM_7_chest-pa~-CM_4_chest-xray-match~-1012740414V122180',
      },
      {
        uid: '1.2.840.113619.2.55.3.604688119.968.1234567890.1.2',
        number: 2,
        title: 'LAT View',
        sopClass: '1.2.840.10008.5.1.4.1.1.1',
        imageId:
          'urn:vaimage:200CRNR-CM_7_chest-lat~-CM_4_chest-xray-match~-1012740414V122180',
      },
    ],
  },
];

const study2Series = [
  {
    uid: '1.2.840.113619.2.55.3.604688119.968.9876543210.1',
    number: 1,
    modality: 'CR',
    instances: [
      {
        uid: '1.2.840.113619.2.55.3.604688119.968.9876543210.1.1',
        number: 1,
        title: 'AP View',
        sopClass: '1.2.840.10008.5.1.4.1.1.1',
        imageId:
          'urn:vaimage:200CRNR-CM_8_abd-ap~-CM_5_abdomen-match~-1012740414V122180',
      },
      {
        uid: '1.2.840.113619.2.55.3.604688119.968.9876543210.1.2',
        number: 2,
        title: 'LAT View',
        sopClass: '1.2.840.10008.5.1.4.1.1.1',
        imageId:
          'urn:vaimage:200CRNR-CM_8_abd-lat~-CM_5_abdomen-match~-1012740414V122180',
      },
      {
        uid: '1.2.840.113619.2.55.3.604688119.968.9876543210.1.3',
        number: 3,
        title: 'PA Chest View',
        sopClass: '1.2.840.10008.5.1.4.1.1.1',
        imageId:
          'urn:vaimage:200CRNR-CM_8_chest-pa~-CM_5_abdomen-match~-1012740414V122180',
      },
    ],
  },
];

// Build study variants
const study1Args = {
  id: STUDY_1_ID,
  identifier: 'urn:vastudy:200CRNR-CM_4_chest-xray-match~-1012740414V122180',
  description: 'CHEST 2 VIEWS PA&LAT',
  notes: ['CHEST 2 VIEWS PA&LAT'],
  imageCount: 2,
  date: '2024-12-05T12:50:00+00:00',
  eventId: '27667fa0-f9e0-4427-a744-fbb221d21e37',
  series: study1Series,
};

const study2Args = {
  id: STUDY_2_ID,
  identifier: 'urn:vastudy:200CRNR-CM_5_abdomen-match~-1012740414V122180',
  description: 'ABDOMEN 2 + PA & LAT CHEST',
  notes: ['ABDOMEN 2 + PA & LAT CHEST'],
  imageCount: 3,
  date: '2024-12-05T14:30:00+00:00',
  eventId: '1a63f144-b9c6-4127-894a-567b446fd1da',
  series: study2Series,
};

// ---------------------------------------------------------------------------
// List endpoint – thumbnails & DICOM URLs are null at this stage
// ---------------------------------------------------------------------------
const oracleHealthImage1 = {
  id: 'urn-vastudy-200CRNR-CM-4-e2IzLTQ4LWnullTRiLTkyLWVhLTQ3LWJkLTgwLTg',
  type: 'imaging_study',
  attributes: {
    id: 'urn-vastudy-200CRNR-CM-4-e2IzLTQ4LWnullTRiLTkyLWVhLTQ3LWJkLTgwLTg',
    eventId: '8721358',
    identifier:
      'urn:vastudy:200CRNR-CM_4_e2IzLTQ4LWnullTRiLTkyLWVhLTQ3LWJkLTgwLTg5LTc1LWQ0LWIwLTUwLWNkLTYyfQ%7e%7e-1234567890V012345',
    status: 'available',
    modality: null,
    date: '2026-01-13T15:41:24+00:00',
    description: 'CCIA P3721 EDIPI Ingest test 1-7-26',
    notes: ['CCIA P3721 EDIPI Ingest test 1-7-26'],
    patientId: '1234567890V012345',
    seriesCount: 2,
    imageCount: 2,
    series: [
      {
        uid: null,
        number: 1,
        modality: null,
        instances: [
          {
            uid: null,
            number: 0,
            title: 'PDF',
            sopClass: null,
            imageId:
              'urn:vaimage:200CRNR-CM_7_e2IzLTQ4LWnullTRiLTkyLWVhLTQ3LWJkLTgwLTg5LTc1LWQ0LWIwLTUwLWNkLTYyfQ%7e%7e-CM_4_e2IzLTQ4LWnullTRiLTkyLWVhLTQ3LWJkLTgwLTg5LTc1LWQ0LWIwLTUwLWNkLTYyfQ%7e%7e-1234567890V012345',
            thumbnailUrl: null,
          },
        ],
      },
      {
        uid: null,
        number: 2,
        modality: null,
        instances: [
          {
            uid: null,
            number: 0,
            title: 'PDF',
            sopClass: null,
            imageId:
              'urn:vaimage:200CRNR-CM_5_WFItMjA4NzUzNjY4MTE%7e-CM_4_e2IzLTQ4LWnullTRiLTkyLWVhLTQ3LWJkLTgwLTg5LTc1LWQ0LWIwLTUwLWNkLTYyfQ%7e%7e-1234567890V012345',
            thumbnailUrl: null,
          },
        ],
      },
    ],
    dicomZipUrl: null,
  },
};
const studies = [
  makeStudy({ ...study1Args }),
  makeStudy({ ...study2Args }),
  oracleHealthImage1,
];

// ---------------------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------------------

const ORACLE_HEALTH_ID =
  'urn-vastudy-200CRNR-CM-4-e2IzLTQ4LWnullTRiLTkyLWVhLTQ3LWJkLTgwLTg';

const studyMap = {
  [STUDY_1_ID]: study1Args,
  [STUDY_2_ID]: study2Args,
};

/** Return a copy of oracleHealthImage1 with thumbnail URLs populated. */
const oracleHealthWithThumbnails = () => ({
  ...oracleHealthImage1,
  attributes: {
    ...oracleHealthImage1.attributes,
    series: oracleHealthImage1.attributes.series.map(s => ({
      ...s,
      instances: s.instances.map(inst => ({
        ...inst,
        thumbnailUrl: `https://s3.amazonaws.com/mock-va-imaging/thumbnails/${
          inst.imageId
        }.jpg`,
      })),
    })),
  },
});

/** Return a copy of oracleHealthImage1 with DICOM ZIP URL populated. */
const oracleHealthWithDicom = () => ({
  ...oracleHealthImage1,
  attributes: {
    ...oracleHealthImage1.attributes,
    dicomZipUrl: `https://s3.amazonaws.com/mock-va-imaging/dicom/${ORACLE_HEALTH_ID}.zip`,
  },
});

/** GET /my_health/v2/medical_records/imaging/:id/thumbnails */
const thumbnails = (req, res) => {
  if (req.params.id === ORACLE_HEALTH_ID) {
    return res.json([oracleHealthWithThumbnails()]);
  }
  const args = studyMap[req.params.id];
  if (!args) {
    return res
      .status(404)
      .json({ errors: [{ title: 'Not found', status: '404' }] });
  }
  return res.json([makeStudy({ ...args, thumbnailsReady: true })]);
};

/** GET /my_health/v2/medical_records/imaging/:id/dicom */
const dicom = (req, res) => {
  if (req.params.id === ORACLE_HEALTH_ID) {
    return res.json([oracleHealthWithDicom()]);
  }
  const args = studyMap[req.params.id];
  if (!args) {
    return res
      .status(404)
      .json({ errors: [{ title: 'Not found', status: '404' }] });
  }
  return res.json([makeStudy({ ...args, dicomReady: true })]);
};

/** GET /my_health/v2/medical_records/imaging/thumbnail_proxy?url=... */
const thumbnailProxy = (_req, res) => {
  const filePath = path.resolve(__dirname, '01.jpeg');
  res.type('image/jpeg').sendFile(filePath);
};

module.exports = {
  studies,
  thumbnails,
  dicom,
  thumbnailProxy,
  oracleHealthImage1,
};
