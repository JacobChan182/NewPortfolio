import { useEffect, useRef } from 'react';
import type Lenis from 'lenis';

type UseScrollVideoScrubOptions = {
  lenis: Lenis | null;
  /** Viewport heights of scroll used to scrub 0 → end of video */
  scrubViewportHeights?: number;
  enabled?: boolean;
};

function getScrollY(lenis: Lenis | null) {
  return lenis?.scroll ?? window.scrollY;
}

function seekVideo(video: HTMLVideoElement, time: number) {
  const clamped = Math.max(0, Math.min(time, video.duration || 0));
  if (Math.abs(video.currentTime - clamped) < 0.04) return;

  if ('fastSeek' in video && typeof video.fastSeek === 'function') {
    try {
      video.fastSeek(clamped);
      return;
    } catch {
      /* fall through */
    }
  }
  video.currentTime = clamped;
}

export function useScrollVideoScrub({
  lenis,
  scrubViewportHeights = 3,
  enabled = true,
}: UseScrollVideoScrubOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readyRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !enabled) return;

    const onReady = () => {
      readyRef.current = true;
      video.pause();
      seekVideo(video, 0);
    };

    video.addEventListener('loadedmetadata', onReady);
    if (video.readyState >= 1) onReady();

    const update = () => {
      if (!readyRef.current || !video.duration) return;

      const distance = window.innerHeight * scrubViewportHeights;
      const progress = Math.min(Math.max(getScrollY(lenis) / distance, 0), 1);
      seekVideo(video, progress * video.duration);
    };

    if (lenis) {
      lenis.on('scroll', update);
    }
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();

    return () => {
      video.removeEventListener('loadedmetadata', onReady);
      lenis?.off('scroll', update);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [lenis, scrubViewportHeights, enabled]);

  return videoRef;
}
