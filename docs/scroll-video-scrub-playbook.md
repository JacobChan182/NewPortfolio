# Scroll Video Scrub Playbook

Reusable guide for smooth scroll-driven video animations in this portfolio. Based on the MaillardMap section (`phone_mm_scrub.mp4` + `useSectionScrollVideoScrub`).

---

## Overview

Smooth scroll scrubbing depends on **two things working together**:

1. **Video file** — encoded so every frame can be decoded instantly on seek
2. **Playback code** — seeks every animation frame without throttling, skipping, or seek collisions

If either side is wrong, you get choppy motion, flicker, or lag behind scroll.

---

## Part 1: Prepare the Video Asset

### Target specs (MaillardMap reference)

| Property | Value |
|---|---|
| File | `public/videos/phone_mm_scrub.mp4` |
| Codec | H.264 (`libx264`) |
| Resolution | 1280 × 720 |
| Frame rate | 30 fps |
| Duration | 4 s (120 frames) |
| Bitrate | ~3.1 Mbps |
| File size | ~1.5 MB |
| Audio | None |
| Keyframes | **Every frame (all I-frames)** |
| B-frames | 0 |
| Pixel format | `yuv420p` |
| Web optimization | `+faststart` (moov atom at front) |

### Why all-keyframe encoding matters

Normal H.264 videos store most frames as P/B frames that depend on earlier keyframes (I-frames). When you set `video.currentTime`, the browser must decode from the nearest keyframe forward. That causes:

- Delay while decoding
- Visible flicker between frames
- Seek requests getting dropped or queued badly

For scroll scrubbing, encode with **GOP size = 1** so every frame is independently decodable.

### FFmpeg: create a scrub-friendly MP4

From a source clip (`.mp4`, `.mkv`, Blender export, etc.):

```bash
ffmpeg -y -i input.mp4 \
  -c:v libx264 \
  -preset medium \
  -crf 20 \
  -g 1 \
  -keyint_min 1 \
  -sc_threshold 0 \
  -bf 0 \
  -pix_fmt yuv420p \
  -movflags +faststart \
  -an \
  public/videos/your_clip_scrub.mp4
```

Flag breakdown:

| Flag | Purpose |
|---|---|
| `-crf 20` | Quality (18–22 is a good range; lower = better quality, larger file) |
| `-g 1` | GOP size 1 → every frame is a keyframe |
| `-keyint_min 1` | Minimum keyframe interval of 1 |
| `-sc_threshold 0` | Disable scene-cut keyframe logic |
| `-bf 0` | No B-frames (simpler, faster seeks) |
| `-pix_fmt yuv420p` | Broad browser compatibility |
| `-movflags +faststart` | Metadata at start of file for faster web playback |
| `-an` | Remove audio (not needed for scrub animations) |

Optional: cap resolution if the source is very large (keeps file size down without hurting perceived quality on a phone mockup):

```bash
-vf "scale=1280:720:flags=lanczos"
```

Optional: force 30 fps if your source frame rate is inconsistent:

```bash
-r 30
```

### Verify the export before using it

**Check stream info:**

```bash
ffprobe -v quiet -print_format json -show_streams public/videos/your_clip_scrub.mp4
```

Look for:

- `"has_b_frames": 0`
- `"avg_frame_rate": "30/1"` (or your chosen fps)
- Reasonable `"bit_rate"` and `"width"` / `"height"`

**Confirm every frame is a keyframe:**

```bash
ffprobe -v quiet \
  -select_streams v:0 \
  -show_frames \
  -show_entries frame=pict_type \
  public/videos/your_clip_scrub.mp4 \
  | grep pict_type | sort | uniq -c
```

Expected output:

```text
120 pict_type=I
```

If you see `P` or `B` frames, re-encode with `-g 1 -keyint_min 1 -sc_threshold 0 -bf 0`.

### Quality vs file size tradeoffs

| Knob | Effect |
|---|---|
| `-crf 18` | Higher quality, larger file |
| `-crf 22` | Smaller file, slightly softer |
| Lower resolution (`1280x720` vs `1920x1080`) | Biggest file-size win for phone/UI demos |
| Shorter clip / fewer frames | Less scroll runway needed, smaller file |
| `-preset slow` | Better compression at same CRF, slower encode |

MaillardMap uses **CRF 20 at 1280×720 with all I-frames** — good balance of quality and ~1.5 MB for 4 seconds.

### Naming convention

Use a dedicated scrub asset, separate from a normal playback clip:

```text
public/videos/project_demo.mp4        # normal video (autoplay, etc.)
public/videos/project_demo_scrub.mp4  # scroll-scrub version (all keyframes)
```

---

## Part 2: React Section Setup

### Section structure

Each scroll animation section needs:

1. A **tall scroll runway** (`minHeight` in `vh`) so scroll maps to animation progress
2. A **sticky inner container** so the video stays pinned while scrolling
3. A `<video>` wired to the scrub hook

MaillardMap example:

```tsx
const VIDEO_SRC = '/videos/phone_mm_scrub.mp4';
const SCROLL_VH = 220;           // scroll runway length
const TEXT_SCROLL_END = 0.45;    // first 45% of scroll = text reveal, rest = video

<section
  ref={sectionRef}
  style={{ minHeight: `${SCROLL_VH}vh` }}
>
  <div className="sticky-container">
    <video
      ref={bindVideo}
      src={VIDEO_SRC}
      muted
      playsInline
      preload="auto"
      aria-hidden="true"
      tabIndex={-1}
    />
  </div>
</section>
```

### Required `<video>` attributes

| Attribute | Why |
|---|---|
| `muted` | Required for reliable programmatic control |
| `playsInline` | Prevents fullscreen takeover on iOS |
| `preload="auto"` | Buffers frames before scroll starts |
| No `autoplay` / `loop` | Scroll drives playback, not time |
| `aria-hidden="true"` | Decorative animation |

### Hook usage

```tsx
const { bindVideo, progress, videoReady, videoError } = useSectionScrollVideoScrub({
  sectionRef,
  lenis,
  enabled: !reducedMotion,
  videoScrollStart: TEXT_SCROLL_END, // 0 = scrub from start; 0.45 = scrub after text
});
```

- `progress` — section scroll progress `0 → 1` (use for text reveals, opacity, etc.)
- `videoScrollStart` — fraction of section scroll before video begins scrubbing
- `enabled: !reducedMotion` — skip animation for accessibility

---

## Part 3: Playback Code Patterns

Implementation lives in `src/hooks/useSectionScrollVideoScrub.ts`.

### Problems the old approach had

| Anti-pattern | Symptom |
|---|---|
| `if (video.seeking) return;` | Seeks skipped while decoding → video falls behind, then jumps |
| 24 fps seek throttle | Artificial cap; RAF runs at 60 fps but video only updates 24 times/sec |
| Scroll-event-driven RAF | Missed frames during fast scroll; cancel/re-request churn |
| Seeking on every scroll event without queue | Overlapping seeks cause flicker |

### Patterns that fixed it

#### 1. Continuous RAF loop (not scroll-event-driven)

While the section is visible, run one stable `requestAnimationFrame` loop:

- Read scroll position every frame via `getBoundingClientRect()`
- Map section position → video time
- Always reflects the latest scroll state

Start/stop the loop with `IntersectionObserver` so work only happens when the section is on screen.

#### 2. Pending-seek queue

Never drop a seek because the browser is busy.

```ts
pendingTimeRef.current = targetTime; // always store latest desired time
trySeek();                             // seek now, or wait if one is in-flight

video.addEventListener('seeked', () => {
  isSeekingRef.current = false;
  trySeek(); // flush the latest pending seek immediately
});
```

This prevents stutter from stacked/overlapping `currentTime` assignments.

#### 3. Half-frame tolerance (not a fps throttle)

Skip seeks only when already close enough:

```ts
const FRAME_DURATION = 1 / 30;

if (Math.abs(video.currentTime - target) < FRAME_DURATION / 2) return;
```

This avoids redundant seeks without capping update rate.

#### 4. Pause the video; never play it

```ts
node.pause();
// only ever set node.currentTime — never .play()
```

Scroll scrubbing is frame-by-frame seeking, not playback.

#### 5. Clamp target time slightly before end

```ts
const target = clamp(time, 0, Math.max(duration - 0.04, 0));
```

Avoids edge-case seek failures at the last frame.

---

## Part 4: Checklist for a New Scroll Animation

### Encode

- [ ] Export source animation
- [ ] Re-encode with all I-frames (`-g 1 -keyint_min 1 -sc_threshold 0 -bf 0`)
- [ ] Use `-crf 20` (adjust 18–22 as needed)
- [ ] Add `-movflags +faststart`
- [ ] Strip audio with `-an`
- [ ] Verify all frames are `pict_type=I`
- [ ] Place in `public/videos/<name>_scrub.mp4`

### Build the section

- [ ] Set scroll runway (`minHeight: Nvh`)
- [ ] Sticky container for pinned content
- [ ] Wire `useSectionScrollVideoScrub`
- [ ] Set `videoScrollStart` if text/UI animates before video
- [ ] Use `progress` for non-video scroll effects (title reveal, fades)
- [ ] Respect `useReducedMotion`

### Video element

- [ ] `muted`, `playsInline`, `preload="auto"`
- [ ] No autoplay / loop
- [ ] Loading + error states

### Test

- [ ] Slow scroll — smooth, no flicker
- [ ] Fast scroll — video keeps up, no long lag then jump
- [ ] Scroll up and down repeatedly — no stutter
- [ ] Mobile Safari (iOS is the strictest)
- [ ] Reduced motion preference disables animation

---

## Part 5: Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Flicker / flash between frames | Normal GOP encoding (P/B frames) | Re-encode with all I-frames |
| Video lags behind scroll | `video.seeking` guard skipping seeks | Use pending-seek queue + `seeked` handler |
| Choppy despite good video | 24 fps or other seek throttling | Remove time-based throttle; use RAF loop |
| Jumps at end of scroll | Seeking to exact `duration` | Clamp to `duration - 0.04` |
| Blank frame on load | Seek before `canplay` | Wait for `loadedmetadata` / `canplay` before seeking |
| Huge file size | All I-frames at high resolution | Lower resolution or raise CRF slightly |
| iOS won't scrub | Missing `playsInline` / not muted | Add both attributes |

---

## Part 6: Optional Alternatives

### Sprite sheet (`phone_mm_sprite.jpg`)

A sprite sheet (one JPEG, all frames in a grid) can avoid video decode entirely by drawing frames to a `<canvas>`. This project has a sprite asset but the current MaillardMap implementation uses the all-keyframe MP4 approach instead.

Use a sprite when:

- You need pixel-perfect frame control with zero decode latency
- Video seeking is still unreliable on a target device

Tradeoff: larger single image download, manual frame math, no H.264 compression.

### `fastSeek()` (hero background hook)

`src/hooks/useScrollVideoScrub.ts` uses `video.fastSeek()` when available. That API is optimized for coarse seeking and is fine for full-page background scrubbing, but for pinned section scrubbing the pending-seek RAF pattern in `useSectionScrollVideoScrub` is more reliable.

---

## Quick Reference: One-Liner Encode

```bash
ffmpeg -y -i input.mp4 -c:v libx264 -preset medium -crf 20 -g 1 -keyint_min 1 -sc_threshold 0 -bf 0 -pix_fmt yuv420p -movflags +faststart -an public/videos/name_scrub.mp4
```

## Quick Reference: Verify Keyframes

```bash
ffprobe -v quiet -select_streams v:0 -show_frames -show_entries frame=pict_type public/videos/name_scrub.mp4 | grep pict_type | sort | uniq -c
```

Expected: only `pict_type=I`.
