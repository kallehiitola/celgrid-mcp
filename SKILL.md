---
name: celgrid
description: Browse, generate, revise, and export indexed pixel-art sprites and animations for games using Celgrid. Use for locked palettes, character-consistent animations, indexed pixel edits, or lossless packs for Godot, Unity, Phaser, and Aseprite.
---

# Celgrid

Connect to `https://celgrid.ai/mcp` with Streamable HTTP. In Claude Code, run `claude mcp add celgrid --transport http https://celgrid.ai/mcp`. For a stdio client with Node.js 18 or later, use `npx -y github:kallehiitola/celgrid-mcp`. See [install instructions](llms-install.md).

1. Call `celgrid_guide` for the live service and export rules. Use `celgrid_library` to look for existing sprites before generating new ones. Both work without a key.
2. Before using an account tool, use the user's existing Celgrid credential or direct them to [Settings](https://celgrid.ai/settings#api-keys) to create a personal key. Verified Starter, Indie, Studio, credit pack, and BYOK wallet users are eligible. Keep keys in protected client configuration and out of prompts, logs, and source control.
3. Use `celgrid_generate` for a base sprite. Specify pixel dimensions, view, and palette. To animate, reuse the base sprite ID as `source_asset` with one-based `source_frame` so the silhouette, proportions, and palette stay consistent.
4. Use `celgrid_revise` for a local AI repair, `celgrid_edit_pixels` for exact indexed changes, and `celgrid_propagate_edit` for a change that needs to carry across frames. For timing-only changes, use `celgrid_timing`.
5. Use `celgrid_export` and download the lossless pack using the client's configured Celgrid authentication for private assets. Check the exported dimensions, pivot, frame durations, and nearest-neighbor filtering in the target engine.

Confirm the user's authority before spending managed credits or using their provider key. BYOK calls incur Anthropic charges and a 15% Celgrid fee debited from their prepaid wallet.
