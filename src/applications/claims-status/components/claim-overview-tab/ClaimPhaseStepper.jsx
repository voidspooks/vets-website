import React from 'react';
import PropTypes from 'prop-types';
import { Link, useSearchParams } from 'react-router-dom-v5-compat';

import {
  buildDateFormatter,
  isPensionClaim,
  isSafeUrl,
} from '../../utils/helpers';
import { getClaimPhases, getPensionClaimPhases } from '../../utils/claimPhase';

const isRelativeUrl = url =>
  typeof url === 'string' && (url.startsWith('/') || url.startsWith('../'));

export default function ClaimPhaseStepper({
  claimDate,
  currentClaimPhaseDate,
  currentPhase,
  currentPhaseBack,
  claimTypeCode,
  customSteps,
  currentStepPrefix,
}) {
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type');
  const typeQuery = typeParam ? `?type=${typeParam}` : '';

  const formattedClaimDate = buildDateFormatter()(claimDate);
  const formattedCurrentClaimPhaseDate = buildDateFormatter()(
    currentClaimPhaseDate || claimDate,
  );

  let claimPhases;
  if (customSteps?.length > 0) {
    claimPhases = customSteps.map((step, index) => ({
      phase: step.phase || index + 1,
      header: step.header,
      description: step.description,
      descriptionDateTemplate: step.descriptionDateTemplate || null,
      details: step.details,
      linkText: step.linkText,
      linkUrl: step.linkUrl,
      repeatable: !!step.repeatable,
    }));
  } else if (isPensionClaim(claimTypeCode)) {
    claimPhases = getPensionClaimPhases(formattedClaimDate);
  } else {
    claimPhases = getClaimPhases(formattedClaimDate);
  }
  const finalPhase = claimPhases.length;

  const isCurrentPhase = phase => {
    return phase === currentPhase;
  };
  const isCurrentPhaseAndNotFinalPhase = phase => {
    return isCurrentPhase(phase) && phase !== finalPhase;
  };
  const isPhaseComplete = phase => {
    return (
      phase < currentPhase || (isCurrentPhase(phase) && phase === finalPhase)
    );
  };
  const phaseCanRepeat = claimPhase => {
    if (customSteps?.length > 0) {
      return claimPhase.repeatable;
    }
    return claimPhase.repeatable || [3, 4, 5, 6].includes(claimPhase.phase);
  };

  let headerIconAttributes = {};
  const showIcon = phase => {
    if (isCurrentPhaseAndNotFinalPhase(phase)) {
      // Set headerIcon object
      headerIconAttributes = {
        icon: 'flag',
        text: 'Current',
        class: 'phase-current',
      };
      return true;
    }

    if (isPhaseComplete(phase)) {
      // Set headerIcon object
      headerIconAttributes = {
        icon: 'check_circle',
        text: 'Completed',
        class: 'phase-complete',
      };
      return true;
    }

    return false;
  };

  return (
    <div className="claim-phase-stepper">
      <va-accordion>
        {claimPhases.map((claimPhase, phaseIndex) => (
          <va-accordion-item
            key={phaseIndex}
            header={claimPhase.header}
            id={`phase${claimPhase.phase}`}
            open={isCurrentPhase(claimPhase.phase)}
          >
            {showIcon(claimPhase.phase) && (
              <va-icon
                icon={headerIconAttributes.icon}
                class={headerIconAttributes.class}
                srtext={headerIconAttributes.text}
                slot="icon"
              />
            )}
            {isCurrentPhase(claimPhase.phase) && (
              <strong className="current-phase">
                {currentStepPrefix || 'Your claim is in this step as of'}{' '}
                {formattedCurrentClaimPhaseDate}.
              </strong>
            )}
            {isCurrentPhase(claimPhase.phase) &&
              currentPhaseBack && (
                <va-alert
                  class="optional-alert vads-u-padding-bottom--1"
                  status="info"
                  slim
                >
                  We moved your claim back to this step because we needed to
                  find or review more evidence
                </va-alert>
              )}
            {(!isCurrentPhase(claimPhase.phase) || !currentPhaseBack) &&
              phaseCanRepeat(claimPhase) && (
                <div className="repeat-phase">
                  <va-icon icon="autorenew" size={3} />
                  <span>Step may repeat if we need more information.</span>
                </div>
              )}
            <p className="vads-u-margin-y--0">
              {claimPhase.descriptionDateTemplate
                ? claimPhase.descriptionDateTemplate.replace(
                    '{date}',
                    formattedClaimDate,
                  )
                : claimPhase.description}
            </p>
            {claimPhase.details?.map((detail, detailIndex) => (
              <p key={detailIndex}>{detail}</p>
            ))}
            {claimPhase.linkText &&
              isSafeUrl(claimPhase.linkUrl) && (
                <p>
                  {isRelativeUrl(claimPhase.linkUrl) ? (
                    <Link
                      to={`${claimPhase.linkUrl}${typeQuery}`}
                      className="active-va-link"
                    >
                      {claimPhase.linkText}
                    </Link>
                  ) : (
                    <a
                      href={claimPhase.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {claimPhase.linkText}
                    </a>
                  )}
                </p>
              )}
          </va-accordion-item>
        ))}
      </va-accordion>
    </div>
  );
}

ClaimPhaseStepper.propTypes = {
  claimDate: PropTypes.string.isRequired,
  currentPhase: PropTypes.number.isRequired,
  claimTypeCode: PropTypes.string,
  currentClaimPhaseDate: PropTypes.string,
  currentPhaseBack: PropTypes.bool,
  currentStepPrefix: PropTypes.string,
  customSteps: PropTypes.array,
};
