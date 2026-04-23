import { datadogRum } from '@datadog/browser-rum';
import { formatDateInLocalTimezone, formatNameFirstToLast } from './helpers';
import {
  areDatesEqualToMinute,
  normalizeProcedureName,
  parseRadiologyReport,
} from './radiologyUtil';
import { labTypes, loincCodes, EMPTY_FIELD } from './constants';
import * as rumActions from './rumConstants';

/**
 * Convert an SCDF (v2) imaging study record into the frontend shape used by
 * the labs-and-tests list and the radiology detail views.
 *
 * @param {Object} record - A single JSONAPI resource from the imaging studies response
 * @returns {Object} Frontend-shaped imaging study record
 */
export const convertScdfImagingStudy = record => {
  const attrs = record.attributes || record;
  return {
    id: `${record.id}`,
    name: attrs.description || EMPTY_FIELD,
    date: formatDateInLocalTimezone(attrs.date, true) || EMPTY_FIELD,
    rawDate: attrs.date || null,
    results: attrs.notes?.length ? attrs.notes.join('\n') : EMPTY_FIELD,
    imageCount: attrs.imageCount || 0,
    studyId: attrs.identifier || record.id,
    series: attrs.series || [],
    status: attrs.status || null,
    eventId: attrs.eventId || null,
  };
};

/**
 * Maximum allowed difference (in milliseconds) between a lab record's date
 * and an imaging study's date for them to be considered the same study.
 */
const IMAGING_MATCH_TOLERANCE_MS = 31 * 60 * 1000; // 31 minutes
const NEAR_MISS_TOLERANCE_MS = IMAGING_MATCH_TOLERANCE_MS * 2;

/** Only UHD radiology records are eligible for SCDF imaging study merge. */
const MERGE_ELIGIBLE_TYPE = loincCodes.UHD_RADIOLOGY;

/**
 * Compute statistics about the study-to-report merge for Datadog RUM tracking.
 *
 * @param {Array} labsList - The original labs list (pre-merge)
 * @param {Array} imagingStudies - The imaging studies list
 * @param {Set} matchedImagingIds - IDs of studies that were successfully matched
 * @param {Object} stageCounts - Per-stage match counts { stage1, stage2, stage3 }
 */
export const computeMergeStats = (
  labsList,
  imagingStudies,
  matchedImagingIds,
  stageCounts = {},
) => {
  const reportCount = labsList.filter(
    lab =>
      lab.type === MERGE_ELIGIBLE_TYPE &&
      lab.sortDate &&
      !Number.isNaN(new Date(lab.sortDate).getTime()),
  ).length;
  const studyCount = imagingStudies.length;
  const matchedCount = matchedImagingIds.size;
  const unmatchedReports = reportCount - matchedCount;
  const unmatchedStudies = studyCount - matchedCount;

  // How many studies arrived with an eventId from the API
  const studiesWithEventId = imagingStudies.filter(s => s.eventId).length;

  // For each study, find the distance to the closest radiology report.
  // Track min/max inline to avoid spread-operator argument-length limits.
  let minClosestDistanceMs = null;
  let maxClosestDistanceMs = null;
  let nearMissCount = 0;
  imagingStudies.forEach(study => {
    if (!study.rawDate) return;
    const studyTime = new Date(study.rawDate).getTime();
    if (Number.isNaN(studyTime)) return;

    const closestDistance = labsList.reduce((min, lab) => {
      if (lab.type !== MERGE_ELIGIBLE_TYPE || !lab.sortDate) return min;
      const labTime = new Date(lab.sortDate).getTime();
      if (Number.isNaN(labTime)) return min;
      return Math.min(min, Math.abs(labTime - studyTime));
    }, Infinity);

    if (closestDistance !== Infinity) {
      minClosestDistanceMs =
        minClosestDistanceMs === null
          ? closestDistance
          : Math.min(minClosestDistanceMs, closestDistance);
      maxClosestDistanceMs =
        maxClosestDistanceMs === null
          ? closestDistance
          : Math.max(maxClosestDistanceMs, closestDistance);
    }

    // Near miss: unmatched study whose closest report is within 2× tolerance
    if (
      !matchedImagingIds.has(study.id) &&
      closestDistance <= NEAR_MISS_TOLERANCE_MS
    ) {
      nearMissCount += 1;
    }
  });

  return {
    reportCount,
    studyCount,
    matchedCount,
    unmatchedReports,
    unmatchedStudies,
    matchedByEventId: stageCounts.stage1 || 0,
    matchedByDayAndName: stageCounts.stage2 || 0,
    matchedByTimeTolerance: stageCounts.stage3 || 0,
    studiesWithEventId,
    nearMissCount,
    minClosestDistanceMs,
    maxClosestDistanceMs,
    toleranceMs: IMAGING_MATCH_TOLERANCE_MS,
  };
};

/**
 * Check if two dates are on the same calendar day.
 * @param {string} date1 - First date string
 * @param {string} date2 - Second date string (can be ISO string or timestamp)
 * @returns {boolean} - True if dates are on the same day
 */
const areDatesOnSameDay = (date1, date2) => {
  const parseDate = input => {
    if (!input) return null;
    if (/^\d+$/.test(input)) {
      return new Date(Number(input));
    }
    return new Date(input);
  };

  const d1 = parseDate(date1);
  const d2 = parseDate(date2);

  if (!d1 || !d2 || Number.isNaN(d1.getTime()) || Number.isNaN(d2.getTime())) {
    return false;
  }

  return (
    d1.getUTCFullYear() === d2.getUTCFullYear() &&
    d1.getUTCMonth() === d2.getUTCMonth() &&
    d1.getUTCDate() === d2.getUTCDate()
  );
};

/**
 * Run a single matching pass over labs and imaging studies using the provided
 * predicate. Returns a Map of lab.id → study for each new match found.
 * Already-matched IDs (in matchedLabIds / matchedImagingIds) are skipped.
 *
 * When `requireUniqueMatch` is true, a lab is only matched if exactly one
 * unmatched study satisfies the predicate. If multiple studies qualify the
 * lab is skipped (ambiguous match).
 */
const runImagingMatchingPass = (
  labsList,
  imagingStudies,
  matchedLabIds,
  matchedImagingIds,
  predicate,
  { requireUniqueMatch = false } = {},
) => {
  const newMatches = new Map();
  labsList.forEach(lab => {
    if (matchedLabIds.has(lab.id) || lab.type !== MERGE_ELIGIBLE_TYPE) return;
    if (requireUniqueMatch) {
      const candidates = imagingStudies.filter(
        study => !matchedImagingIds.has(study.id) && predicate(lab, study),
      );
      if (candidates.length === 1) {
        newMatches.set(lab.id, candidates[0]);
        matchedLabIds.add(lab.id);
        matchedImagingIds.add(candidates[0].id);
      }
    } else {
      for (const study of imagingStudies) {
        if (!matchedImagingIds.has(study.id) && predicate(lab, study)) {
          newMatches.set(lab.id, study);
          matchedLabIds.add(lab.id);
          matchedImagingIds.add(study.id);
          break;
        }
      }
    }
  });
  return newMatches;
};

/**
 * Merge SCDF imaging study metadata into a labs-and-tests list using a
 * multi-stage matching algorithm. Each stage only considers records not yet
 * matched by an earlier stage, and each match is 1:1.
 *
 * Stages (evaluated in order of specificity):
 *   1. study.eventId === lab.id  (direct API link)
 *   2. Same calendar day + study.name matches lab.name (normalized)
 *   3. Timestamp within tolerance — only when exactly one study matches
 *      (ambiguous multi-match is skipped)
 *
 * @param {Array} labsList  - Converted labs-and-tests records (each has `sortDate`)
 * @param {Array} imagingStudies - Converted SCDF imaging studies (each has `rawDate`)
 * @returns {Array} A new array of lab records with imaging fields merged where matched
 */
export const mergeImagingStudiesIntoLabs = (
  labsList = [],
  imagingStudies = [],
) => {
  if (!imagingStudies.length) {
    const stats = computeMergeStats(labsList, imagingStudies, new Set());
    if (stats.reportCount > 0 || stats.studyCount > 0) {
      datadogRum.addAction(rumActions.MERGE_IMAGING_STUDIES, stats);
    }
    return labsList;
  }

  const matchedLabIds = new Set();
  const matchedImagingIds = new Set();
  const allMatches = new Map();

  // Stage 1: eventId === lab.id (most specific)
  const stage1 = runImagingMatchingPass(
    labsList,
    imagingStudies,
    matchedLabIds,
    matchedImagingIds,
    (lab, study) => study.eventId && study.eventId === lab.id,
  );
  stage1.forEach((v, k) => allMatches.set(k, v));

  // Stage 2: same calendar day + normalized name match
  const stage2 = runImagingMatchingPass(
    labsList,
    imagingStudies,
    matchedLabIds,
    matchedImagingIds,
    (lab, study) => {
      if (!lab.sortDate || !study.rawDate) return false;
      const labName = normalizeProcedureName(lab.name);
      const studyName = normalizeProcedureName(study.name);
      return (
        labName &&
        studyName &&
        labName === studyName &&
        areDatesOnSameDay(lab.sortDate, study.rawDate)
      );
    },
  );
  stage2.forEach((v, k) => allMatches.set(k, v));

  // Stage 3: timestamp tolerance (loosest) — skip if multiple studies match
  const stage3 = runImagingMatchingPass(
    labsList,
    imagingStudies,
    matchedLabIds,
    matchedImagingIds,
    (lab, study) => {
      if (!lab.sortDate || !study.rawDate) return false;
      const labTime = new Date(lab.sortDate).getTime();
      const studyTime = new Date(study.rawDate).getTime();
      if (Number.isNaN(labTime) || Number.isNaN(studyTime)) return false;
      return Math.abs(labTime - studyTime) <= IMAGING_MATCH_TOLERANCE_MS;
    },
    { requireUniqueMatch: true },
  );
  stage3.forEach((v, k) => allMatches.set(k, v));

  // Apply matches to labs
  const mergedList = labsList.map(lab => {
    const match = allMatches.get(lab.id);
    if (match) {
      return {
        ...lab,
        imagingStudyId: match.id,
        imagingStudyStatus: match.status,
        imageCount: match.imageCount || 0,
      };
    }
    return lab;
  });

  const stageCounts = {
    stage1: stage1.size,
    stage2: stage2.size,
    stage3: stage3.size,
  };
  const stats = computeMergeStats(
    labsList,
    imagingStudies,
    matchedImagingIds,
    stageCounts,
  );
  if (stats.reportCount > 0 || stats.studyCount > 0) {
    datadogRum.addAction(rumActions.MERGE_IMAGING_STUDIES, stats);
  }

  return mergedList;
};

const toSortableISOString = dateInput => {
  if (dateInput == null) return null;
  const input =
    typeof dateInput === 'string' && /^\d+$/.test(dateInput)
      ? Number(dateInput)
      : dateInput;
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.toISOString().split('.')[0]}Z`;
};

export const buildRadiologyResults = record => {
  const reportText = record?.reportText || '\n';
  const impressionText = record?.impressionText || '\n';
  return `Report:\n${reportText.replace(/\r\n|\r/g, '\n').replace(/^/gm, '  ')}
Impression:\n${impressionText.replace(/\r\n|\r/g, '\n').replace(/^/gm, '  ')}`;
};

export const convertMhvRadiologyRecord = record => {
  const orderedBy = formatNameFirstToLast(record.requestingProvider);
  const imagingProvider = formatNameFirstToLast(record.radiologist);
  return {
    id: `r${record.id}-${record.hash}`,
    name: record.procedureName,
    type: labTypes.RADIOLOGY,
    reason: record.reasonForStudy || EMPTY_FIELD,
    orderedBy: orderedBy || EMPTY_FIELD,
    clinicalHistory: record?.clinicalHistory?.trim() || EMPTY_FIELD,
    imagingLocation: record.performingLocation,
    date: formatDateInLocalTimezone(record.eventDate, true) || EMPTY_FIELD,
    sortDate: record.eventDate,
    imagingProvider: imagingProvider || EMPTY_FIELD,
    results: buildRadiologyResults(record),
  };
};

export const convertCvixRadiologyRecord = record => {
  const parsedReport = parseRadiologyReport(record.reportText);
  return {
    id: `r${record.id}-${record.hash}`,
    name: record.procedureName,
    type: labTypes.CVIX_RADIOLOGY,
    reason: parsedReport['Reason for Study'] || EMPTY_FIELD,
    orderedBy: parsedReport['Req Phys'] || EMPTY_FIELD,
    clinicalHistory: parsedReport['Clinical History'] || EMPTY_FIELD,
    imagingLocation: record.facilityInfo?.name || EMPTY_FIELD,
    date:
      formatDateInLocalTimezone(record.performedDatePrecise, true) ||
      EMPTY_FIELD,
    sortDate: toSortableISOString(record.performedDatePrecise),
    imagingProvider: EMPTY_FIELD,
    results: buildRadiologyResults({
      reportText: parsedReport.Report,
      impressionText: parsedReport.Impression,
    }),
    studyId: record.studyIdUrn,
    imageCount: record.imageCount,
  };
};

const mergeRadiologyRecords = (phrRecord, cvixRecord) => {
  if (phrRecord && cvixRecord) {
    return {
      ...phrRecord,
      studyId: cvixRecord.studyId,
      imageCount: cvixRecord.imageCount,
    };
  }
  return phrRecord || cvixRecord || null;
};

/**
 * Run a single matching pass over unmatched PHR and CVIX records using the
 * provided predicate. Returns a Map of phrRecord.id → cvixRecord for each
 * new match found. Already-matched IDs (in matchedPhrIds / matchedCvixIds)
 * are skipped.
 */
const runMatchingPass = (
  phrList,
  cvixList,
  matchedPhrIds,
  matchedCvixIds,
  predicate,
) => {
  const newMatches = new Map();
  for (const phrRecord of phrList) {
    if (!matchedPhrIds.has(phrRecord.id)) {
      for (const cvixRecord of cvixList) {
        if (
          !matchedCvixIds.has(cvixRecord.id) &&
          predicate(phrRecord, cvixRecord)
        ) {
          newMatches.set(phrRecord.id, cvixRecord);
          matchedPhrIds.add(phrRecord.id);
          matchedCvixIds.add(cvixRecord.id);
          break;
        }
      }
    }
  }
  return newMatches;
};

/**
 * Create a union of the radiology reports from PHR and CVIX. Duplicates are
 * merged using a multi-stage strategy so that the most specific match criteria
 * are evaluated first, preventing greedy mismatches when multiple studies share
 * the same date.
 *
 * Stages (each stage only considers records not yet matched by an earlier stage):
 *   1. Procedure name (normalized) AND timestamp equal to the minute
 *   2. Timestamp equal to the minute (any procedure name)
 *   3. Procedure name (normalized) AND same calendar day
 *
 * @param {Array} phrRadiologyTestsList - List of PHR radiology records.
 * @param {Array} cvixRadiologyTestsList - List of CVIX radiology records.
 * @returns {Array} - The merged list of radiology records.
 */
export const mergeRadiologyLists = (
  phrRadiologyTestsList,
  cvixRadiologyTestsList,
) => {
  const matchedPhrIds = new Set();
  const matchedCvixIds = new Set();
  // Accumulates all matches across stages: phrId → cvixRecord
  const allMatches = new Map();

  // Precompute normalized names so stages 1 & 3 don't redo this in inner loops
  const phrNames = new Map(
    phrRadiologyTestsList.map(r => [r.id, normalizeProcedureName(r.name)]),
  );
  const cvixNames = new Map(
    cvixRadiologyTestsList.map(r => [r.id, normalizeProcedureName(r.name)]),
  );

  // Stage 1: procedure name + timestamp to the minute (most specific)
  const stage1 = runMatchingPass(
    phrRadiologyTestsList,
    cvixRadiologyTestsList,
    matchedPhrIds,
    matchedCvixIds,
    (phr, cvix) => {
      const phrName = phrNames.get(phr.id);
      const cvixName = cvixNames.get(cvix.id);
      return (
        phrName &&
        cvixName &&
        phrName === cvixName &&
        areDatesEqualToMinute(phr.sortDate, cvix.sortDate)
      );
    },
  );
  stage1.forEach((v, k) => allMatches.set(k, v));

  // Stage 2: timestamp to the minute only
  const stage2 = runMatchingPass(
    phrRadiologyTestsList,
    cvixRadiologyTestsList,
    matchedPhrIds,
    matchedCvixIds,
    (phr, cvix) => areDatesEqualToMinute(phr.sortDate, cvix.sortDate),
  );
  stage2.forEach((v, k) => allMatches.set(k, v));

  // Stage 3: procedure name + same calendar day (loosest)
  const stage3 = runMatchingPass(
    phrRadiologyTestsList,
    cvixRadiologyTestsList,
    matchedPhrIds,
    matchedCvixIds,
    (phr, cvix) => {
      const phrName = phrNames.get(phr.id);
      const cvixName = cvixNames.get(cvix.id);
      return (
        phrName &&
        cvixName &&
        phrName === cvixName &&
        areDatesOnSameDay(phr.sortDate, cvix.sortDate)
      );
    },
  );
  stage3.forEach((v, k) => allMatches.set(k, v));

  // Build the merged output: matched PHR records get CVIX data merged in,
  // unmatched PHR records pass through, unmatched CVIX records are appended.
  const mergedArray = phrRadiologyTestsList.map(phrRecord => {
    const matchingCvix = allMatches.get(phrRecord.id);
    return matchingCvix
      ? mergeRadiologyRecords(phrRecord, matchingCvix)
      : phrRecord;
  });

  return mergedArray.concat(
    cvixRadiologyTestsList.filter(record => !matchedCvixIds.has(record.id)),
  );
};

/**
 * Merge PHR and CVIX details for a single radiology record.
 * @param {Object} phrDetails - PHR radiology details (raw from API)
 * @param {Object} cvixDetails - CVIX radiology details (raw from API)
 * @returns {Object} - The merged radiology record
 */
export const mergeRadiologyDetails = (phrDetails, cvixDetails) => {
  const convertedPhr = phrDetails
    ? convertMhvRadiologyRecord(phrDetails)
    : null;
  const convertedCvix = cvixDetails
    ? convertCvixRadiologyRecord(cvixDetails)
    : null;
  return mergeRadiologyRecords(convertedPhr, convertedCvix);
};
