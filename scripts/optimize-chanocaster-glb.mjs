/**
 * Compress legacy chanocaster.glb for web.
 *
 * Profiles (pass as 3rd arg):
 *   mid  — default, ~65% vertices, studio-friendly detail (chanocaster-mid.glb)
 *   low  — ~28% vertices, fastest (chanocaster-opt.glb)
 *
 * Usage: npm run optimize-chanocaster
 *        npm run optimize-chanocaster -- mid
 *        npm run optimize-chanocaster -- low
 */
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const profile = (process.argv[2] ?? 'mid').toLowerCase();

const profiles = {
  mid: {
    output: 'public/models/chanocaster-mid.glb',
    simplifyRatio: '0.65',
    simplifyError: '0.0008',
    meshoptLevel: 'medium',
  },
  low: {
    output: 'public/models/chanocaster-opt.glb',
    simplifyRatio: '0.5',
    simplifyError: '0.001',
    meshoptLevel: 'high',
  },
};

const opts = profiles[profile] ?? profiles.mid;
const input = path.resolve(root, 'public/models/chanocaster.glb');
const output = path.resolve(root, opts.output);

const cli = path.join(root, 'node_modules', '@gltf-transform', 'cli', 'bin', 'cli.js');

console.log(`Profile: ${profile} → ${opts.output}`);

execFileSync(
  process.execPath,
  [
    cli,
    'optimize',
    input,
    output,
    '--compress',
    'meshopt',
    '--meshopt-level',
    opts.meshoptLevel,
    '--texture-compress',
    'webp',
    '--simplify-ratio',
    opts.simplifyRatio,
    '--simplify-error',
    opts.simplifyError,
  ],
  { stdio: 'inherit' },
);

console.log('Wrote', output);
