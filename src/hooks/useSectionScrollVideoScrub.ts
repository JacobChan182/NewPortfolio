import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import type Lenis from 'lenis';

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

function seekVideo(video: HTMLVideoElement, time: number) {
  const duration = video.duration;
  if (!Number.isFinite(duration) || duration <= 0) return;

  const target = clamp(time, 0, Math.max(duration - 0.04, 0));

  try {
    if (video.readyState >= 2) {
      video.currentTime = target;
    }
  } catch {
    /* ignore while buffering */
  }
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
  const [progress, setProgress] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readyRef = useRef(false);
  const rafRef = useRef(0);
  const activeRef = useRef(false);

  const tick = useCallback(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    const p = getSectionProgress(section);
    setProgress(p);

    if (readyRef.current && video.duration) {
      seekVideo(video, p * video.duration);
    }
  }, [sectionRef]);

  const bindVideo = useCallback(
    (node: HTMLVideoElement | null) => {
      videoRef.current = node;
      readyRef.current = false;
      setVideoReady(false);
      setVideoError(false);

      if (!node || !enabled) return;

      const markReady = () => {
        if (!node.duration || !Number.isFinite(node.duration)) return;
        readyRef.current = true;
        setVideoReady(true);
        node.pause();
        seekVideo(node, 0.05);
        tick();
      };

      const onError = () => {
        readyRef.current = false;
        setVideoReady(false);
        setVideoError(true);
      };

      node.addEventListener('loadedmetadata', markReady);
      node.addEventListener('canplay', markReady);
      node.addEventListener('error', onError);

      if (node.readyState >= 1) markReady();

      return () => {
        node.removeEventListener('loadedmetadata', markReady);
        node.removeEventListener('canplay', markReady);
        node.removeEventListener('error', onError);
      };
    },
    [enabled, tick],
  );

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !enabled) {
      setProgress(enabled ? 0 : 1);
      return;
    }

    const onScroll = () => {
      if (!activeRef.current) return;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };

    const loop = () => {
      tick();
      if (activeRef.current) {
        rafRef.current = requestAnimationFrame(loop);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        activeRef.current = entry.isIntersecting;
        if (activeRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = requestAnimationFrame(loop);
        } else {
          cancelAnimationFrame(rafRef.current);
        }
      },
      { threshold: 0 },
    );

    observer.observe(section);

    if (lenis) lenis.on('scroll', onScroll);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    const resizeObserver = new ResizeObserver(onScroll);
    resizeObserver.observe(section);

    return () => {
      cancelAnimationFrame(rafRef.current);
      activeRef.current = false;
      observer.disconnect();
      resizeObserver.disconnect();
      lenis?.off('scroll', onScroll);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [sectionRef, lenis, enabled, tick]);

  return { bindVideo, progress, videoReady, videoError };
}
