import { site } from '../../content/site';
import { useScrollVideoScrub } from '../../hooks/useScrollVideoScrub';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useLenisInstance } from '../providers/LenisProvider';

export function ScrollVideoBackground() {
  const lenis = useLenisInstance();
  const reducedMotion = useReducedMotion();
  const { src, webm, poster, scrubViewportHeights } = site.heroVideo;

  const videoRef = useScrollVideoScrub({
    lenis,
    scrubViewportHeights,
    enabled: !reducedMotion,
  });

  if (reducedMotion) {
    return (
      <div className="scroll-video-bg scroll-video-bg--fallback" aria-hidden>
        {poster ? <img src={poster} alt="" /> : null}
      </div>
    );
  }

  return (
    <div className="scroll-video-bg" aria-hidden>
      <video
        ref={videoRef}
        className="scroll-video-bg__video"
        muted
        playsInline
        preload="auto"
        {...(poster ? { poster } : {})}
      >
        {webm ? <source src={webm} type="video/webm" /> : null}
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
}
