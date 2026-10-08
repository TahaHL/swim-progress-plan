import { useState } from 'react';
import { Check, Clapperboard, Play, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button, cx } from '@/components/ui/primitives';
import type { SkillVideo } from '@/types';

/**
 * One demonstration video.
 *
 * With `video.src` set it plays the real footage. Without it, it renders a clearly labelled
 * placeholder whose play button opens the planned content, so nothing pretends to be a video.
 * See VIDEO_SOURCES in src/data/skills.ts for how to add footage.
 */
export function VideoCard({ video, skillName }: { video: SkillVideo; skillName: string }) {
  const [open, setOpen] = useState(false);
  const isPlaceholder = !video.src;
  const correct = video.kind === 'correct';
  const ItemIcon = correct ? Check : X;

  return (
    <article className="flex flex-col">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${isPlaceholder ? 'Preview' : 'Play'} video: ${video.title} for ${skillName}${isPlaceholder ? ' (placeholder, not yet filmed)' : ''}`}
        className="group relative block aspect-video w-full max-w-full overflow-hidden rounded-2xl bg-deep text-left text-white"
      >
        {video.poster ? (
          <img src={video.poster} alt="" className="absolute inset-0 size-full object-cover" />
        ) : (
          <span aria-hidden="true" className="deep-panel absolute inset-0 !rounded-none" />
        )}
        <span className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-deep/85 to-transparent" aria-hidden="true" />
        <span className="absolute top-3 left-3 rounded-full bg-white px-2.5 py-1 text-sm font-semibold text-deep">
          {video.title}
        </span>
        {isPlaceholder && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full border border-white/40 px-2.5 py-1 text-sm font-medium">
            <Clapperboard className="size-3.5" aria-hidden="true" />
            Placeholder
          </span>
        )}
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid size-14 place-items-center rounded-full bg-white text-deep transition-transform group-hover:scale-105">
            <Play className="ml-0.5 size-6 fill-current" aria-hidden="true" />
          </span>
        </span>
        <span className="tabular absolute right-3 bottom-3 rounded-md bg-deep/80 px-1.5 py-0.5 text-sm">
          {isPlaceholder ? `Planned ${video.plannedDuration}` : video.plannedDuration}
        </span>
      </button>
      <p className="mt-3 text-[0.95rem] leading-snug text-ink-2">{video.caption}</p>
      <h4 className="mt-4 font-display font-medium">{correct ? 'What to look for' : 'Mistakes to watch for'}</h4>
      <ul className="mt-2 flex flex-col gap-2">
        {video.lookFor.map((item) => (
          <li key={item} className="flex gap-2.5 leading-snug">
            <span
              className={cx(
                'mt-0.5 grid size-5 shrink-0 place-items-center rounded-full',
                correct ? 'bg-aqua-soft text-aqua-dark' : 'bg-sunken text-ink-2',
              )}
            >
              <ItemIcon className="size-3.5" strokeWidth={3} aria-hidden="true" />
            </span>
            {item}
          </li>
        ))}
      </ul>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        size="lg"
        title={`${skillName}: ${video.title.toLowerCase()}`}
        description={video.caption}
        footer={<Button onClick={() => setOpen(false)}>Close</Button>}
      >
        {video.src ? (
          <video src={video.src} poster={video.poster} controls playsInline className="aspect-video w-full rounded-xl bg-deep">
            Your browser cannot play this video.
          </video>
        ) : (
          <div className="deep-panel flex aspect-video w-full max-w-full flex-col items-center justify-center !rounded-xl px-6 text-center">
            <Clapperboard className="size-8 text-aqua" aria-hidden="true" />
            <p className="mt-3 font-display text-lg font-semibold">This video has not been filmed yet</p>
            <p className="mt-1 max-w-sm text-[0.95rem] text-white/75">
              The finished programme will show a qualified demonstrator here. Until then, the points below describe
              what the video will cover.
            </p>
          </div>
        )}
        <h3 className="mt-5 font-display font-medium">{correct ? 'What to look for' : 'Mistakes to watch for'}</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-ink-2 marker:text-line-strong">
          {video.lookFor.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Modal>
    </article>
  );
}
