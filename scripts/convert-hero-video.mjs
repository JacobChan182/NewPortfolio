/**
 * Convert Blender MKV export → web MP4 (H.264, scroll-scrub friendly).
 * Usage: node scripts/convert-hero-video.mjs [input.mkv] [output.mp4]
 */
import { execFileSync } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const input = path.resolve(root, process.argv[2] ?? 'public/videos/0001-0120.mkv');
const output = path.resolve(root, process.argv[3] ?? 'public/videos/chanocaster.mp4');

if (!ffmpegPath) {
  console.error('ffmpeg binary not found (ffmpeg-static).');
  process.exit(1);
}

console.log('Input:', input);
console.log('Output:', output);

execFileSync(
  ffmpegPath,
  [
    '-y',
    '-i',
    input,
    '-c:v',
    'libx264',
    '-preset',
    'medium',
    '-crf',
    '20',
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    '-an',
    output,
  ],
  { stdio: 'inherit' },
);

console.log('Done:', output);
