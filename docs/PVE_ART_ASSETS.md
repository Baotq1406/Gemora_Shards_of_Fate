# PvE elemental dragon art — 12/11/2026

Created with the built-in `image_gen` tool, not the CLI/API fallback. New original artwork; inspected the existing Gemora lobby and crystal-dragon mascot before authoring prompts. No third-party game art was downloaded. Outputs were copied into the project, then encoded as WebP at the original dimensions for browser delivery. Atlas framing is configured in the UI, not embedded text.

Final assets: `apps/game-client/public/art/campaign/`:

| File | Use |
| --- | --- |
| `world.webp` | Five-island world map |
| `nature.webp` | Woodland trail and ancient tree lair |
| `water.webp` | Coral trail and waterfall cavern |
| `fire.webp` | Volcanic trail and lava den |
| `light.webp` | Sky terraces and sun sanctuary |
| `dark.webp` | Moon forest and crescent lair |
| `dragons.webp` | Nature/Water/Fire/Light/Dark dragon atlas, left to right |
| `bosses.webp` | Five adult guardian dragon portraits, same ordering |
| `island-lock-v1.webp` | Transparent gold/crystal padlock for unopened islands and unlock dialogs; [asset notes](PVE_LOCK_ASSET.md) |

The original PNG outputs remain under `C:/Users/ADMIN/.codex/generated_images/01a1bf16-a47c-78b0-bebe-6460bcc5e42b/`. Runtime uses only workspace WebP files, not those machine-specific source paths. Total shipped artwork is approximately 4.2 MB. Transparency is retained for character atlases.

## Final world prompt

Use case: stylized-concept. Create ONE beautiful original game background illustration for Gemora's WORLD MAP. Landscape 1536x1024. Cute vibrant 2D hand-painted cartoon fantasy web RPG, thick confident warm outlines, rounded forms, cel-shading, highly polished like an illustrated crystal dragon pet game. A turquoise sky and soft cream clouds with FIVE very distinct large floating islands in a loose left-to-right rising arc: lower left lush green woodland with enormous crystal tree and dragon nest; upper left/center turquoise coral waterfall island with aquatic dragon cave; center orange volcanic island with cozy lava dragon den; upper right white gold sun temple island on clouds; lower right purple moon forest island with violet dragon cavern. Islands separated with breathing space, all clearly visible and large. A very small mint crystal-dragon home island near bottom center. Isometric three-quarter aerial camera, charming rather than realistic or grim. Pale dotted golden magic trail linking five main islands. Frame corners with soft clouds. No labels, letters, words, numbers, HUD, buttons or UI whatsoever. No characters covering islands. Rich saturated greens, turquoise, gold, orange and violet. Keep center of each island visually identifiable for later clickable game labels. Fill canvas with artwork, no border.

## Final region prompts

Each region was generated in a separate call with `transparent_background: false`. Exact common template; substitute the corresponding description below for `{description}`:

Use case: stylized-concept. Create one original PORTRAIT 1024x1536 illustrated level-selection background for Gemora, a cute crystal-dragon fantasy RPG. {description} Camera is top-down three-quarter isometric, looking along an ascending adventurous winding trail from bottom center to top center. Thick warm outlines, hand-painted cartoon cel shading, rounded scenery, polished detailed 2D casual fantasy art, cheerful rich saturated colors, consistent with a mint baby crystal dragon mascot and wooden gold UI. The CENTRAL 60% has spacious traversable ground / wide winding clearings all the way from bottom to top, for game nodes that will be overlaid later. Scenery clusters around left and right edges, with distinct landmarks and dragon footprints. Keep sufficient empty ground in center at ten heights. Background fills entire canvas edge to edge, no borders, NO text, letters, labels, numbers, UI, nodes, buttons, characters or dragons. Not flat vector art, not photorealistic.

- Nature: Emerald woodland dragon habitat. Large ancient hollow crystal tree at the very top center with a nest, rounded green trees, root bridges, sparkling stream winding down the right, mushroom clusters, leaf-shaped crystals, sunny golden green light.
- Water: Turquoise aquatic dragon habitat. Huge coral cave at the very top center, pearl crystals, lagoons, cascades and waterfalls, sandy paths, stepping stones, curvy wooden bridges between small lush islands, pink coral, bright sea blue and turquoise.
- Fire: Volcanic fire dragon habitat. Round dragon cave in a volcano at the very top center, warm amber crystals, chunky purple-brown cliffs and rock paths, orange trees, glowing lava rivers on the edges, stone bridges, warm sunny orange light, friendly cartoon not grim.
- Light: Luminous sky dragon habitat. Golden sun temple dragon nest at the very top center, white marble terraces on floating islands, pale gold crystal groves, fluffy clouds on the edges, curved luminous bridges, ivory stone path, warm heavenly golden afternoon light.
- Dark: Moon dragon habitat. Violet crescent moon dragon cave at the very top center, purple glowing crystal forest, teal bioluminescent mushrooms, lunar pools and old rounded stone archways, violet stepping-stone path. Rich readable lavender indigo twilight, cute and mysterious not scary.

## Final young dragon atlas prompt

`transparent_background: true`.

Use case: stylized-concept. ONE transparent game CHARACTER ATLAS, landscape 1536x1024. Exactly FIVE full-body baby-to-young dragons, arranged in ONE straight horizontal row in FIVE equal-width invisible cells. Each dragon stays within its own 20 percent width cell, centered vertically with empty margin above and below, no overlap or shared props. From LEFT to RIGHT: 1 emerald green nature dragon with rounded branch antlers and leafy wings, chunky paws and amber eyes; 2 sky blue water dragon with pink coral horns, fins and broad paddle tail; 3 orange fire dragon with sturdy dark rocky armor plates and curved lava horns; 4 ivory/gold light dragon with broad crystal wings and elegant golden sun horns; 5 violet moon dragon with round-edged bat wings, crescent crest and curling tail. All unmistakably different silhouettes, friendly but ready for a challenge, expressive large eyes, short cute muzzles, tiny visible fangs, chubby proportions. Polished hand-painted 2D cartoon fantasy pet RPG art, thick dark colorful outlines, soft cel shading, jewel highlights, consistent collection. No clothing or scarves (companion has scarf, these are wild dragons). Transparent background with no ground, no shadow outside characters, NO text, labels, numbers, borders or UI. Render all five characters complete and separated.

## Final boss atlas prompt

`transparent_background: true`.

Use case stylized-concept. One transparent CHARACTER ATLAS for a cute hand-painted 2D fantasy crystal dragon game, landscape1536x1024. FIVE different ADULT BOSS DRAGONS in ONE horizontal row, each confined to an equal-width cell, full body, no overlap, centered vertically. LEFT to RIGHT: ancient green forest dragon quadruped with huge leafy antlers and crystal tree growing on back; elegant long blue aquatic sea dragon with coral crown, long serpentine coiled body and large flowing fins; bulky orange-red volcanic dragon with obsidian armor, powerful forelimbs and massive jagged horns; majestic ivory golden sun dragon with huge radiant faceted crystal feather-like wings and crown; mysterious purple crescent moon dragon with sweeping bat wings and long curved tail. Make these adult silhouettes distinctly different from cute small hatchlings, while retaining big expressive eyes, thick dark colorful outlines, rounded shapes, clean cel shading and charming non-realistic fantasy game style. No humanoids, no scarves, no clothes, no horror, no text, no labels, no letters. Transparent background, no floor. Portraits complete and separated, generous margin above and below.
