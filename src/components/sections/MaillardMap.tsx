import { useRef } from 'react';
import { useSectionScrollVideoScrub } from '../../hooks/useSectionScrollVideoScrub';
import { useLenisInstance } from '../providers/LenisProvider';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const TITLE = 'MaillardMap';
const VIDEO_SRC = '/videos/maillardmapphone.mp4';
/** Viewport heights of scroll runway for text + video scrub */
const SCROLL_VH = 220;

export function MaillardMap() {
  const sectionRef = useRef<HTMLElement>(null);
  const lenis = useLenisInstance();
  const reducedMotion = useReducedMotion();
  const { bindVideo, progress, videoReady, videoError } = useSectionScrollVideoScrub({
    sectionRef,
    lenis,
    enabled: !reducedMotion,
  });

  const textProgress = reducedMotion ? 1 : Math.min(progress / 0.45, 1);

  return (
    <section
      id="maillard-map"
      ref={sectionRef}
      className="section maillard-map"
      style={{
        ['--maillard-scroll-vh' as string]: String(SCROLL_VH),
        minHeight: `${SCROLL_VH}vh`,
      }}
      aria-label="MaillardMap"
    >
      <div className="maillard-map__sticky">
        <div className="maillard-map__layout">
          <div className="maillard-map__content">
            <h2
              className="maillard-map__title"
              style={{ ['--reveal' as string]: String(textProgress) }}
              aria-label={TITLE}
            >
              <span className="maillard-map__title-text" aria-hidden="true">
                {TITLE}
              </span>
              <span className="maillard-map__title-ghost" aria-hidden="true">
                {TITLE}
              </span>
            </h2>
          </div>

          <div className="maillard-map__media">
            <video
              ref={bindVideo}
              className="maillard-map__video"
              src={VIDEO_SRC}
              muted
              playsInline
              preload="auto"
              aria-hidden
              tabIndex={-1}
            />
            {videoError ? (
              <span className="maillard-map__video-status maillard-map__video-status--error">
                Video failed to load — use H.264 MP4 (not HEVC/H.265)
              </span>
            ) : !videoReady && !reducedMotion ? (
              <span className="maillard-map__video-status">Loading…</span>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
