# Gemora_Shards_of_Fate

## Required asset delivery workflow

When creating, importing, replacing or optimizing a raster game asset:

1. Preserve the original under `assets/source/`. Never overwrite the only master with a lossy export.
2. Deliver runtime raster images as `.webp` under `apps/game-client/public/art/`. Keep SVG icons as vectors; screenshots and source frames outside public may remain PNG.
3. Use `npm run assets:add -- --input <source-file> --output art/<name>.webp --quality 0.88` to retain a master, encode WebP and register the output. Add `--width <pixels>` only after checking display size and DPR. For registered assets, edit `assets/webp-assets.json` then run `npm run assets:build`.
4. Keep alpha, aspect ratio, sprite grids and anchors intact. Never regenerate artwork merely to convert its format. Use original aligned frames when exporting smaller sprite atlases, not previously lossy WebP.
5. Update every TS/CSS/HTML/JSON reference, including dynamic paths and responsive variants. Remove obsolete public originals only after verifying the retained source and replacement.
6. Run `npm run assets:check`, the game-client build and relevant browser tests. Inspect transparent edges, small details and animation on desktop/mobile before completing the task.
7. Report file-byte savings separately from decoded pixel memory. WebP encoding alone does not reduce decoded RGBA/texture memory; resize or unload assets when appropriate.

The project exporter uses the installed Playwright Chromium browser (Edge by default; override with `PLAYWRIGHT_CHANNEL`). It produces lossy WebP with transparency; use a verified lossless encoder if pixel-exact losslessness is explicitly required. Do not claim this exporter is lossless.
