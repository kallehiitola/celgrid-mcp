---
name: Celgrid Pixel Art Sprite Studio
description: Generate exact 1:1 indexed pixel art sprites, frame-by-frame animations, AI Ripple Edits, and lossless Godot 4, Unity 2D, Phaser 3, and Aseprite export packs using Celgrid MCP (zero diffusion blur, mixels, or alpha halos). Use whenever building 2D pixel art games, characters, enemies, props, tiles, VFX, or animated spritesheets.
summary: Generate crisp 1:1 indexed pixel art sprites, locked-palette animations, AI Ripple Edits, and ready-to-import Godot, Unity, Phaser, and Aseprite packs via Celgrid MCP.
version: 1.0.0
license: MIT
tags:
  - pixel-art
  - game-dev
  - sprites
  - animations
  - mcp
  - godot
  - unity
  - phaser
  - aseprite
  - indie-games
keywords:
  - pixel art spritesheet generator
  - indexed pixel art MCP
  - Godot 4 SpriteFrames pixel art
  - Phaser 3 pixel art atlas
  - Unity 2D pixel sprites
  - frame-by-frame sprite animation
  - no mixels pixel art
  - AI Ripple Edit sprite propagation
use_cases:
  - Generate consistent 16x16 or 24x24 RPG heroes, enemies, props, and items on a single locked color palette
  - Animate a static pixel sprite into matching idle, walk, jump, attack, and hurt cycles without silhouette drift
  - Apply one manual pixel fix to Frame 1 and ripple that exact edit across every animation frame with AI Ripple Edit
  - Export lossless engine-ready sprite packs for Godot 4, Unity 2D, Phaser 3, and Aseprite with nearest-neighbor filtering pre-wired
  - Browse and export built-in free starter packs (Cryptbound, Meadowkeep, Sunspire Tactics, Frontline 1944) to prototype a 2D game immediately
---

# Celgrid Pixel Art Sprite Studio

Use this skill whenever the user needs crisp, game-ready 2D pixel art sprites, animations, or engine-ready spritesheets without the blurry edges, uneven pixel widths ("mixels"), palette bloat, or semi-transparent alpha halos produced by general diffusion models.

## Core Principles

1. **Always generate on an exact integer pixel grid (4x4 to 64x64)** locked to an explicit palette (`index 0` transparent, up to 32 opaque colors, binary alpha). Never ask a general image generator to create "pixel art" and downscale it.
2. **Lock ONE palette and ONE scale per game** before generating multiple assets. Pick a curated palette (`apollo`, `sweetie16`, `endesga16`, `pico8`, `slso8`, `gameboy`), pass `palette_lock: {"asset_id": "<12-hex-id>"}` from an anchor sprite, or supply explicit hex colors.
3. **Anchor first, animate second:** Generate a single-frame base pose (`frames: 1`, `quality: "studio"`) first. Once silhouette and palette are right, generate every animation (`idle`, `walk`, `run`, `attack`, `hurt`, `cast`, `custom`) using `source_asset` + `source_frame: 1` so character proportions and colors never drift.
4. **Preserve human pixel edits:** When modifying an already-animated sprite (recoloring armor, adding a visor pixel, tightening an outline), edit Frame 1 (`celgrid_edit_pixels` or the free browser Studio) and call `celgrid_propagate_edit` (AI Ripple Edit) instead of regenerating from scratch.

## Connecting Celgrid MCP

If the `celgrid_*` MCP tools are not yet registered in the current session, guide the user to connect Celgrid MCP using either the hosted Streamable HTTP endpoint or the zero-dependency stdio wrapper:

### Option A: Hosted Streamable HTTP MCP (Recommended, zero local install)
- Endpoint URL: `https://celgrid.ai/mcp`
- Claude Code (public guide and starter library work immediately with no key):
  ```bash
  claude mcp add celgrid --transport http https://celgrid.ai/mcp
  ```
- For account tools (generation, revisions, Ripple Edit, private exports), create a personal API key (`cg_live_...`) at `https://celgrid.ai/settings#api-keys` (available on verified Starter, Indie, Studio, credit pack, and BYOK accounts) and configure your client's protected secret header as `Authorization: Bearer <key>` or `X-API-Key: <key>`.
- Cursor / VS Code / Cline (`mcp.json`):
  ```json
  {
    "mcpServers": {
      "celgrid": {
        "type": "http",
        "url": "https://celgrid.ai/mcp",
        "headers": {
          "Authorization": "Bearer cg_live_your_key"
        }
      }
    }
  }
  ```

### Option B: Zero-Dependency Local Stdio Wrapper (Node.js 18+)
```json
{
  "mcpServers": {
    "celgrid": {
      "command": "npx",
      "args": ["-y", "github:kallehiitola/celgrid-mcp"],
      "env": {
        "CELGRID_URL": "https://celgrid.ai",
        "CELGRID_API_KEY": "cg_live_your_key"
      }
    }
  }
}
```

### Free Access, Starter Credits & BYOK
- **No API key required** for `celgrid_guide`, `celgrid_library` (4 built-in free starter packs: Cryptbound, Meadowkeep, Sunspire Tactics, Frontline 1944), and `celgrid_export` on starter assets.
- **Free Starter Account:** 25 free AI credits + $0.50 starter BYOK fee credit upon verified signup, plus a $0 forever browser pixel editor (`https://celgrid.ai/studio`, no login required to draw or export).
- **BYOK Mode:** Pass your own Anthropic API key via `X-Anthropic-Key` (or `ANTHROPIC_API_KEY` env in stdio) to pay Anthropic directly plus a flat 15% Celgrid orchestration fee from your prepaid fee wallet.

## Step-by-Step Sprite Production Workflow

1. **Discover rules & existing assets (0 credits):**
   - Call `celgrid_guide` once at the start of a project to verify current palette IDs, model options, and export conventions.
   - Call `celgrid_library` to check whether a built-in starter sprite or saved project asset already fits as a palette/style reference.
2. **Generate the base character or prop still:**
   - Call `celgrid_generate` with `frames: 1`, `quality: "studio"`, explicit `width` and `height` (recommended: `16x16` top-down or VFX, `24x24` side-view characters, `32x32` bosses), explicit `view` (`side`, `top`, `three_quarter`, `front`, `back`), `outline` (`dark`, `colored`, `none`), and locked `palette_lock`.
3. **Generate animations locked to the base still:**
   - Call `celgrid_generate` with `source_asset: "<base_id>"`, `source_frame: 1`, `palette_lock: {"asset_id": "<base_id>"}`, `animation: "walk"` (or `"idle"`, `"attack"`, `"hurt"`, `"cast"`, `"custom"`), `frames: 6`, `fps: 10`, `movement: "in_place"`.
4. **Surgical fixes & AI Ripple Edit:**
   - Need a localized repair on 1 frame? Call `celgrid_revise` with `operation: "repair"` and an optional `pixel_mask` (`A` = allow edit, `L` = lock pixels, `.` = default).
   - Need exact pixel-level control at 0 credits? Call `celgrid_edit_pixels` with the integer grid.
   - Changed a detail on Frame 1 and want every other frame (and linked animations) updated? Call `celgrid_propagate_edit` with `id`, `source_frame: 1`, and optional `linked_asset_ids` (up to 6 same-size animations).
5. **Export lossless engine pack (0 credits):**
   - Call `celgrid_export` with the 12-character hex asset ID.
   - Use `pack_zip`, `spritesheet_png`, `frame0_png`, and `metadata_json` to drop assets cleanly into the target game engine. See `references/engine-exports.md` for exact Godot 4, Unity 2D, Phaser 3, and Aseprite wiring.

## Reference Files
- Read `references/mcp-tools.md` for the complete parameter schema of all 10 Celgrid MCP tools.
- Read `references/engine-exports.md` for exact nearest-neighbor import recipes for Godot 4, Unity 2D, Phaser 3, and Aseprite.
