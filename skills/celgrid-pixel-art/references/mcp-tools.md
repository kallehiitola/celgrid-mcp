# Celgrid MCP Tools Reference

All 10 tools exposed by Celgrid MCP (`https://celgrid.ai/mcp` or `celgrid-mcp` stdio):

| Tool | Credit Cost | Purpose | Key Parameters |
| :--- | :--- | :--- | :--- |
| `celgrid_guide` | 0 cr (no key needed) | Read live pixel-grid rules, palette names, models, and export specs | None |
| `celgrid_library` | 0 cr (no key needed) | Search public starter packs and saved library sprites | `q`, `project_id`, `animation`, `size`, `type` |
| `celgrid_create_blank` | 0 cr | Create a transparent indexed pixel canvas (4x4 to 64x64, 1 to 16 frames) | `name`, `width`, `height`, `frames`, `palette_lock` or `colors`, `fps` |
| `celgrid_generate` | Credits or BYOK | Generate an exact indexed still or multi-frame animation | `prompt` (required), `width`, `height`, `max_colors`, `frames`, `fps`, `view`, `animation`, `outline`, `movement`, `quality` (`fast`/`balanced`/`studio`), `model`, `palette_lock`, `source_asset`, `source_frame` |
| `celgrid_revise` | Credits or BYOK | Repair 1 frame or draw next frame with optional Allow/Lock pixel mask | `id`, `frame`, `operation` (`repair`/`next`), `instruction`, `pixel_mask` |
| `celgrid_propagate_edit` | Credits or BYOK | AI Ripple Edit: propagate a Frame 1 manual edit across all frames and up to 6 linked animations | `id`, `source_frame`, `instruction`, `include_current_frames`, `linked_asset_ids` |
| `celgrid_edit_pixels` | 0 cr | Write exact integer palette indices on a frame as an immutable version | `id`, `frame`, `grid`, `note` |
| `celgrid_rename` | 0 cr | Update sprite display title | `id`, `title` |
| `celgrid_timing` | 0 cr | Change playback and export FPS (0.5 to 60) without redrawing pixels | `id`, `fps` |
| `celgrid_export` | 0 cr | Fetch validated metadata, palette hexes, and lossless download URLs (`pack_zip`, `spritesheet_png`, `frame0_png`, `metadata_json`) | `id` |

## Curated Palettes
- `apollo`: 16-color moody dungeon fantasy palette (used by Cryptbound starter pack)
- `sweetie16`: 16-color bright cozy RPG palette (used by Meadowkeep starter pack)
- `endesga16`: 16-color vibrant tactical/adventure palette (used by Sunspire Tactics)
- `pico8`: Classic 16-color fantasy console palette
- `slso8`: 8-color warm retro sunset palette
- `gameboy`: 4-color classic handheld green ramp

## Quality Pipelines
- `studio` (recommended for final game assets): 3-pass pipeline (Silhouette + palette lock -> Cluster shading -> Vision self-critique + contact-sheet animation audit).
- `balanced`: 2-pass pipeline (Silhouette + cluster shading).
- `fast`: Single-pass aligned grid for rapid prototyping.
