import { useEffect, useRef, type RefObject } from 'react';
import type Lenis from 'lenis';
import { useSectionScrollProgress } from './useSectionScrollProgress';

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

type UseSectionScrollVideoScrubOptions = {
  sectionRef: RefObject<HTMLElement | null>;
  lenis: Lenis | null;
  enabled?: boolean;
};

export function useSectionScrollVideoScrub({
  sectionRef,
  lenis,
  enabled = true,
}: UseSectionScrollVideoScrubOptions) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readyRef = useRef(false);
  const progress = useSectionScrollProgress(sectionRef, { lenis, enabled });

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

    return () => video.removeEventListener('loadedmetadata', onReady);
  }, [enabled]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !enabled) return;

    const apply = () => {
      if (!readyRef.current || !video.duration) return;
      seekVideo(video, progress * video.duration);
    };

    apply();
    video.addEventListener('loadedmetadata', apply);
    return () => video.removeEventListener('loadedmetadata', apply);
  }, [progress, enabled]);

  return { videoRef, progress };
}
