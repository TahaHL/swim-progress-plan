import { useState } from 'react';
import { Check, Clapperboard, Eye, X, type LucideIcon } from 'lucide-react';
import { cx } from '@/components/ui/primitives';
import type { SkillVideo } from '@/types';

const KIND: Record<SkillVideo['kind'], { heading: string; icon: LucideIcon; tone: string }> = {
  correct: { heading: 'What to look for', icon: Check, tone: 'bg-aqua-soft text-aqua-dark' },
  mistakes: { heading: 'Mistakes to watch for', icon: X, tone: 'bg-sunken text-ink-2' },
  notice: { heading: 'From the poolside', icon: Eye, tone: 'bg-foam text-ocean-dark' },
};

/**
 * The demonstration videos for one skill: correct technique, common mistakes, and what parents
 * should notice. One player, three tabs.
 *
 * A slot with `src` set plays real footage with native controls. A slot without it shows a
 * labelled placeholder and no play button, so nothing pretends to be a video. See VIDEO_SOURCES
 * in src/data/skills.ts for how to add footage.
 */
export function VideoSection({ videos, skillName }: { videos: SkillVideo[]; skillName: string }) {
  const [activeId, setActiveId] = useState(videos[0]?.id);
  const active = videos.find((v) => v.id === activeId) ?? videos[0];
  if (!active) return null;
  const kind = KIND[active.kind];
  const Icon = kind.icon;

  const move = (step: number) => {
    const index = videos.findIndex((v) => v.id === active.id);
    const target = videos[(index + step + videos.length) % videos.length];
    setActiveId(target.id);
    document.getElementById(`video-tab-${target.id}`)?.focus();
  };

  return (
    <div>
      <div role="tablist" aria-label={`Videos for ${skillName}`} className="flex gap-1 overflow-x-auto rounded-xl bg-sunken p-1">
        {videos.map((video) => {
          const selected = video.id === active.id;
          return (
            <button
              key={video.id}
              id={`video-tab-${video.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls="video-panel"
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveId(video.id)}
              onKeyDown={(event) => {
                if (event.key === 'ArrowRight') move(1);
                else if (event.key === 'ArrowLeft') move(-1);
                else return;
                event.preventDefault();
              }}
              className={cx(
                'min-h-10 flex-1 rounded-lg px-3 text-[0.95rem] font-semibold whitespace-nowrap transition-colors',
                selected ? 'bg-surface text-ink shadow-raised' : 'text-ink-2 hover:text-ink',
              )}
            >
              {video.title}
            </button>
          );
        })}
      </div>

      <div
        id="video-panel"
        role="tabpanel"
        aria-labelledby={`video-tab-${active.id}`}
        className="mt-4 grid gap-x-6 gap-y-4 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]"
      >
        {active.src ? (
          <video
            key={active.id}
            src={active.src}
            poster={active.poster}
            controls
            playsInline
            aria-label={`${active.title}: ${skillName}`}
            className="aspect-video w-full max-w-full rounded-2xl bg-deep"
          >
            Your browser cannot play this video.
          </video>
        ) : (
          <div
            role="img"
            aria-label={`Placeholder for the ${active.title.toLowerCase()} video. Not yet filmed.`}
            data-testid="video-placeholder"
            className="deep-panel relative flex aspect-video w-full max-w-full flex-col items-center justify-center px-5 text-center"
          >
            <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/45 px-2.5 py-1 text-sm font-medium">
              <Clapperboard className="size-3.5" aria-hidden="true" />
              Placeholder
            </span>
            <p className="font-display text-lg font-semibold">Video not yet filmed</p>
            <p className="tabular mt-1 max-w-xs text-[0.95rem] text-white/80">
              Planned length {active.plannedDuration}. A qualified demonstrator will be filmed for this slot.
            </p>
          </div>
        )}

        <div className="min-w-0">
          <p className="leading-snug text-ink-2">{active.caption}</p>
          <h3 className="mt-3 font-display font-medium">{kind.heading}</h3>
          <ul className="mt-2 flex flex-col gap-2">
            {active.lookFor.map((item) => (
              <li key={item} className="flex gap-2.5 leading-snug">
                <span className={cx('mt-0.5 grid size-5 shrink-0 place-items-center rounded-full', kind.tone)}>
                  <Icon className="size-3.5" strokeWidth={2.75} aria-hidden="true" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
