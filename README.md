# NewPortfolio

Modern portfolio for Jacob Chan - Apple-like UI, Lenis smooth scroll, React Three Fiber hero.

Content migrated from https://github.com/JacobChan182/portfolio

## Develop

npm install
npm run dev

## Environment

Copy .env.example to .env and add EmailJS keys.

## Chanocaster 3D model (hero)

The hero uses the **legacy portfolio mesh**: `public/models/chanocasterold.glb` (same file as [JacobChan182/portfolio](https://github.com/JacobChan182/portfolio) `public/chanocaster.glb`). It auto-spins like the old `ChanocasterViewer.js` and supports drag-to-orbit.

Optional animated export (separate file):

```bash
"D:\SteamLibrary\steamapps\common\Blender\blender.exe" --background "public/models/blender models/chanocasteranimation.blend" --python scripts/export-chanocaster-glb.py
```

Writes `public/models/chanocaster.glb` (not used by the hero unless you change `CHANOCASTER_MODEL_URL`).

## Assets from the legacy site

Copy into public/images/ from your old repo:
- crashScreenshot.png, HRScreenshot.png, flusherScreenshot.png
- guitar/IMG_2178.jpg, guitar/IMG_2175.jpg, guitar/IMG_22892.jpg

Place 3D models in public/models/

See CONSTITUTION.md for design standards.