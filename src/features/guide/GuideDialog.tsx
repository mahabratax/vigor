import { displayLabel } from '../../i18n/display';
import React from 'react';
import type { PageContext } from '../../app/context';
import { Button, Icon, Modal } from '../../components/ui';
import { recommendedTour } from './model';
import type { GuideController } from './useGuide';
import { FarmIllustration } from '../../components/FarmIllustration';
export function GuideDialog({
  ctx,
  path,
  guide,
  onClose,
}: {
  ctx: PageContext;
  path: string;
  guide: GuideController;
  onClose: () => void;
}) {
  const recommended = recommendedTour(path);
  return (
    <Modal
      title={'Vigor guide'}
      description={`Explore ${displayLabel(ctx.s.greenhouse.name)} or rehearse your presentation.`}
      onClose={onClose}
      wide
    >
      <div className="guide-intro illustrated">
        <FarmIllustration name="greenhouse" />
        <div>
          <h3>Follow a workflow on your pages</h3>
          <p>
            Tours highlight the controls you need. Select Try on page to interact, then Resume tour
            to continue. Nothing runs or saves automatically.
          </p>
        </div>
      </div>
      <div className="guide-catalog">
        {guide.catalog.map((t) => {
          const record = guide.progress[t.id],
            resume = record && !record.finished;
          return (
            <article
              key={t.id}
              className="guide-choice"
              data-recommended={t.id === recommended || undefined}
              data-presentation={t.id === 'presentation' || undefined}
            >
              <Icon name={t.icon} size={22} />
              <div>
                <h3>{displayLabel(t.title)}</h3>
                <p>{displayLabel(t.description)}</p>
                <small>
                  {displayLabel(
                    record?.finished
                      ? 'Tour completed'
                      : resume
                        ? `${record.seen.length} of ${t.steps.length} steps viewed`
                        : `${t.steps.length} steps`,
                  )}
                  {displayLabel(t.id === recommended ? ' / recommended for this page' : '')}
                  {t.id === 'presentation' && ' / Suggested pacing, no automatic timer'}
                </small>
              </div>
              <div className="guide-choice-actions">
                <Button
                  tone={t.id === recommended ? 'primary' : 'default'}
                  ariaLabel={`${resume ? 'Resume' : record?.finished ? 'Restart' : 'Start'} tour ${t.title}`}
                  onClick={() => guide.start(t.id)}
                >
                  {displayLabel(
                    resume ? 'Resume tour' : record?.finished ? 'Restart tour' : 'Start tour',
                  )}
                </Button>
                {resume && (
                  <button
                    className="text-link"
                    onClick={() => guide.start(t.id, true)}
                    aria-label={`Restart tour ${t.title}`}
                  >
                    From the beginning
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
      <p className="guide-footnote">
        Tour progress is saved per account and greenhouse. Completing a tour does not complete farm
        tasks.
      </p>
      <details className="guide-limits">
        <summary>Device connection status</summary>
        <p>
          Records and configuration are stored in this browser. Cameras, sensors, scheduler, and
          payments are not connected. Saving a routine does not run devices.
        </p>
        <p>
          Tours do not reset data or control devices. Sample values and cost assumptions are not
          field-validated.
        </p>
      </details>
    </Modal>
  );
}
