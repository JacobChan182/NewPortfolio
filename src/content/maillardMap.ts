/** Scroll distance for the title reveal (vh) */
export const MAILLARD_TEXT_SCROLL_VH = 54;
/** Scroll distance to scrub through the full clip (vh) */
export const MAILLARD_VIDEO_SCRUB_VH = 200;
/** Section scroll fraction (0–1) where video scrub begins */
export const MAILLARD_VIDEO_SCRUB_START =
  MAILLARD_TEXT_SCROLL_VH / (MAILLARD_TEXT_SCROLL_VH + MAILLARD_VIDEO_SCRUB_VH);

export const MAILLARD_SCRUB_VIDEO_URL = '/videos/full_phone_scrub.mp4';
