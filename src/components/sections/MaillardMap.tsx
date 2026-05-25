import { useEffect, useRef } from 'react';
import { useSectionScrollVideoScrub } from '../../hooks/useSectionScrollVideoScrub';
import { useLenisInstance } from '../providers/LenisProvider';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useHeaderVisibility } from '../layout/HeaderVisibilityContext';

const TITLE = 'MaillardMap';
const TECH_STACK =
  'Swift, Kotlin, Express, TypeScript, PostgreSQL, Mapbox, Foursquare, S3, OpenAPI';
const VIDEO_SRC = '/videos/full_phone_scrub.mp4';
const TESTFLIGHT_URL = 'https://testflight.apple.com/join/acu9qcwU';
const TESTFLIGHT_BADGE = '/images/ui/testflight-badge.png';
/** Scroll distance for the title reveal (unchanged from original 220vh section) */
const TEXT_SCROLL_VH = 54;
/** Scroll distance to scrub through the full 12s clip */
const VIDEO_SCRUB_VH = 200;
/** Section scroll fraction where video scrub begins — derived from vh split above */
const TEXT_SCROLL_END = TEXT_SCROLL_VH / (TEXT_SCROLL_VH + VIDEO_SCRUB_VH);
/** Total section height: sticky viewport + text runway + video runway */
const SCROLL_VH = 100 + TEXT_SCROLL_VH + VIDEO_SCRUB_VH;

export function MaillardMap() {
  const sectionRef = useRef<HTMLElement>(null);
  const lenis = useLenisInstance();
  const reducedMotion = useReducedMotion();
  const { setMaillardNavHidden } = useHeaderVisibility();
  const { bindVideo, progress, videoReady, videoError } = useSectionScrollVideoScrub({
    sectionRef,
    lenis,
    enabled: !reducedMotion,
    videoScrollStart: TEXT_SCROLL_END,
  });

  const textProgress = reducedMotion ? 1 : Math.min(progress / TEXT_SCROLL_END, 1);

  useEffect(() => {
    if (reducedMotion) {
      setMaillardNavHidden(false);
      return;
    }

    const section = sectionRef.current;
    if (!section) return;

    const started = section.getBoundingClientRect().top <= 0;
    const inMaillardExperience = started && progress < 1;
    setMaillardNavHidden(inMaillardExperience);

    return () => setMaillardNavHidden(false);
  }, [progress, reducedMotion, setMaillardNavHidden]);

  return (
    <section
      id="maillard-map"
      ref={sectionRef}
      className="section maillard-map"
      style={{
        ['--maillard-scroll-vh' as string]: String(SCROLL_VH),
        ['--maillard-video-x' as string]: '-5vw',
        minHeight: `${SCROLL_VH}vh`,
      }}
      aria-label="MaillardMap"
    >
      <div className="maillard-map__sticky">
        <div className="maillard-map__layout">
          <div className="maillard-map__content">
            <div className="maillard-map__intro">
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
              <p
                className="maillard-map__subtitle"
                style={{ ['--reveal' as string]: String(textProgress) }}
              >
                {TECH_STACK}
              </p>
              <p
                className="maillard-map__beta"
                style={{ ['--reveal' as string]: String(textProgress) }}
              >
                <a
                  className="maillard-map__beta-link"
                  href={TESTFLIGHT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Join the MaillardMap beta on TestFlight"
                >
                  <img
                    className="maillard-map__beta-badge"
                    src={TESTFLIGHT_BADGE}
                    alt="Available on Apple TestFlight"
                    width={283}
                    height={85}
                    loading="lazy"
                    decoding="async"
                  />
                </a>
              </p>
            </div>
          </div>

          <div className="maillard-map__media">
            <div className="maillard-map__video-frame">
              <video
                ref={bindVideo}
                className="maillard-map__video"
                src={VIDEO_SRC}
                muted
                playsInline
                preload="auto"
                aria-hidden="true"
                tabIndex={-1}
              />
            </div>
            {videoError ? (
              <span className="maillard-map__video-status maillard-map__video-status--error">
                Video failed to load
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
