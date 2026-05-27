import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import type Lenis from 'lenis';

const PROGRESS_UPDATE_STEP = 0.002;
// One frame at 60 fps — don't seek if already within this tolerance
const FRAME_DURATION = 1 / 60;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getSectionProgress(section: HTMLElement) {
  const rect = section.getBoundingClientRect();
  const scrollRange = section.offsetHeight - window.innerHeight;

  if (scrollRange <= 0) {
    return rect.top <= 0 ? 1 : 0;
  }

  return clamp(-rect.top / scrollRange, 0, 1);
}

function mapVideoProgress(sectionProgress: number, startAfter: number) {
  if (sectionProgress <= startAfter) return 0;
  return (sectionProgress - startAfter) / (1 - startAfter);
}

type UseSectionScrollVideoScrubOptions = {
  sectionRef: RefObject<HTMLElement | null>;
  /** Kept for API compatibility; no longer used internally. */
  lenis: Lenis | null;
  enabled?: boolean;
  /** Section scroll fraction (0–1) before video scrub begins */
  videoScrollStart?: number;
};

export function useSectionScrollVideoScrub({
  sectionRef,
  enabled = true,
  videoScrollStart = 0,
}: UseSectionScrollVideoScrubOptions) {
  const [progress, setProgress] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readyRef = useRef(false);
  const rafRef = useRef(0);
  const activeRef = useRef(false);
  const progressRef = useRef(0);

  // Pending seek: always holds the latest desired time.
  // trySeek() drains it immediately unless a seek is in-flight.
  const pendingTimeRef = useRef<number | null>(null);
  const isSeekingRef = useRef(false);

  const trySeek = useCallback(() => {
    const video = videoRef.current;
    if (!video || isSeekingRef.current || pendingTimeRef.current === null) return;

    const duration = video.duration;
    if (!Number.isFinite(duration) || duration <= 0) return;

    const target = clamp(pendingTimeRef.current, 0, Math.max(duration - 0.04, 0));
    pendingTimeRef.current = null;

    if (Math.abs(video.currentTime - target) < FRAME_DURATION / 2) return;

    isSeekingRef.current = true;
    try {
      video.currentTime = target;
    } catch {
      isSeekingRef.current = false;
    }
  }, []);

  // Continuous RAF loop — runs every frame while the section is intersecting.
  // Reading getBoundingClientRect() each frame is cheap and more reliable than
  // batching seeks through scroll events.
  const rafLoop = useCallback(() => {
    if (!activeRef.current) return;

    const section = sectionRef.current;
    if (section) {
      const p = getSectionProgress(section);

      if (Math.abs(p - progressRef.current) >= PROGRESS_UPDATE_STEP || p === 0 || p === 1) {
        progressRef.current = p;
        setProgress(p);
      }

      if (readyRef.current) {
        const video = videoRef.current;
        if (video?.duration) {
          const videoP = mapVideoProgress(p, videoScrollStart);
          pendingTimeRef.current = videoP * video.duration;
          trySeek();
        }
      }
    }

    rafRef.current = requestAnimationFrame(rafLoop);
  }, [sectionRef, videoScrollStart, trySeek]);

  const bindVideo = useCallback(
    (node: HTMLVideoElement | null) => {
      videoRef.current = node;
      readyRef.current = false;
      isSeekingRef.current = false;
      pendingTimeRef.current = null;
      setVideoReady(false);
      setVideoError(false);

      if (!node || !enabled) return;

      const markReady = () => {
        if (!node.duration || !Number.isFinite(node.duration)) return;
        readyRef.current = true;
        setVideoReady(true);
        node.pause();
      };

      // When a seek finishes, immediately flush any pending seek that
      // accumulated while the browser was decoding.
      const onSeeked = () => {
        isSeekingRef.current = false;
        trySeek();
      };

      const onError = () => {
        // StrictMode / src changes can abort in-flight loads — not a real failure
        const code = node.error?.code;
        if (code === MediaError.MEDIA_ERR_ABORTED) return;
        readyRef.current = false;
        setVideoReady(false);
        setVideoError(true);
      };

      node.addEventListener('loadedmetadata', markReady);
      node.addEventListener('canplay', markReady);
      node.addEventListener('seeked', onSeeked);
      node.addEventListener('error', onError);

      if (node.readyState >= 1) markReady();

      return () => {
        node.removeEventListener('loadedmetadata', markReady);
        node.removeEventListener('canplay', markReady);
        node.removeEventListener('seeked', onSeeked);
        node.removeEventListener('error', onError);
      };
    },
    [enabled, trySeek],
  );

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !enabled) {
      setProgress(enabled ? 0 : 1);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        activeRef.current = entry.isIntersecting;
        if (activeRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = requestAnimationFrame(rafLoop);
        } else {
          cancelAnimationFrame(rafRef.current);
        }
      },
      { threshold: 0 },
    );

    observer.observe(section);

    return () => {
      cancelAnimationFrame(rafRef.current);
      activeRef.current = false;
      observer.disconnect();
    };
  }, [sectionRef, enabled, rafLoop]);

  return { bindVideo, progress, videoReady, videoError };
}
