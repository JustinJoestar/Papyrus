# Papyrus Summer Challenge — Promo Video

A 50-second, 1080p promo built with [Remotion](https://remotion.dev) (video-as-React-code).
Matches the site's obsidian-gold brand and uses real product screenshots.

## Render the MP4
```bash
cd promo
npm install        # first time only
npm run render     # outputs out/papyrus-challenge.mp4
```
First render downloads a headless Chromium automatically (one-time).

## Preview / edit live
```bash
npm run dev        # opens Remotion Studio in the browser
```

## Add music (optional)
1. Drop a track at `promo/public/music.mp3`.
2. In `src/PromoVideo.tsx`, add at the top: `import { Audio, staticFile } from "remotion";`
   and inside the `<AbsoluteFill>` add: `<Audio src={staticFile("music.mp3")} volume={0.65} />`
3. Re-render. (Royalty-free sources: Uppbeat, Pixabay Music. Vibe: cinematic, building, premium.)

## Add a voiceover (optional)
Same as music — drop `public/vo.mp3` and add another `<Audio>` tag. The video is
designed to work fully with text-on-screen alone, so VO is not required.

## Structure
- `src/Root.tsx` — composition (1920×1080, 30fps, 1500 frames)
- `src/PromoVideo.tsx` — scene timeline + persistent background
- `src/scenes.tsx` — the 8 scenes (intro → hook → title → leaderboard → how-it-works → awards → parents → CTA)
- `src/components.tsx` — brand background, spectral wave, gold text, motion helpers, screenshot frame
- `public/shots/` — the product screenshots

To swap a screenshot, replace the file in `public/shots/` (keep the name) and re-render.
