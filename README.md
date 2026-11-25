# Celgrid MCP Server (`celgrid-mcp`)

Pixel-native AI sprite studio and animation **Model Context Protocol (MCP)** server for **Claude Code, Cursor, OpenAI Codex, Windsurf, and Cline** backed by [Celgrid](https://celgrid.ai).

Built for both human game developers and AI coding agents making 2D games: instead of blurry diffusion images full of mixels and dirty alpha halos, Celgrid generates **exact 1:1 indexed integer pixel grids (4x4 to 64x64)** on locked color palettes with 3-pass Vision self-critique, paired with a **$0 browser pixel editor**, **AI Ripple Edit** across frames/animations, and lossless engine packs for **Godot 4, Unity, Phaser 3, and Aseprite**.

## Why Celgrid MCP?

- **Exact 1:1 Indexed Pixel Grids:** Zero mixels, zero blurry anti-aliasing, zero semi-transparent alpha fringe.
- **Locked Game Palettes:** Built-in `apollo`, `sweetie16`, `endesga16`, `pico8`, `slso8`, `gameboy`, existing-asset palette locking, or custom hex ramps.
- **Turnkey Engine Packs (`pack.zip`):** Ready-to-drop Godot 4 (`animation.tres` + `sprite.tscn` with Nearest filter), Unity C# (`UnitySpriteForgeImporter.cs.txt`), Phaser 3 (`atlas.json` + `phaser-animations.json`), and Aseprite JSON.
- **Hybrid Human + AI Control:** Open any generated sprite in the $0 browser Studio (`https://celgrid.ai/studio`), edit one frame by hand, and run `celgrid_propagate_edit` (AI Ripple Edit) to apply that edit across every frame and linked animation.
- **Zero Dependencies:** Pure Node.js standard library (`>= 18`), clean audit surface.

## Quick Setup

### Claude Code
```bash
claude mcp add celgrid -e CELGRID_API_KEY=cg_live_your_key -- npx -y github:kallehiitola/celgrid-mcp
```
*(Or `npx -y celgrid-mcp` once published on npm. Works without an API key for `celgrid_guide` and `celgrid_library`.)*

### Cursor (`.cursor/mcp.json`) / Cline / Windsurf
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

### Bring Your Own Anthropic Key (BYOK, 15% Fee)
Add `"ANTHROPIC_API_KEY": "sk-ant-..."` to `env` to route generation directly through your own Anthropic key (`X-Anthropic-Key` header) with a flat 15% Celgrid orchestration fee from your prepaid fee wallet ($0.50 free starter fee credit on verified signup).

## Available MCP Tools (10)

| Tool | Cost | Description |
| :--- | :--- | :--- |
| `celgrid_guide` | Free | Read the live Celgrid agent guide and exact schema rules |
| `celgrid_library` | Free | Search and list public starter packs and your saved library sprites |
| `celgrid_create_blank` | 0 cr | Create a clean transparent 4x4 to 64x64 pixel canvas (1 to 16 frames) |
| `celgrid_generate` | Credits / BYOK | Generate an exact indexed sprite or multi-frame animation (`source_asset` locks character identity) |
| `celgrid_revise` | Credits / BYOK | Surgical AI repair on 1 frame (or draw next frame) with optional Allow/Lock pixel mask |
| `celgrid_propagate_edit` | Credits / BYOK | AI Ripple Edit: propagate a single-frame manual edit across all frames and up to 6 linked animations |
| `celgrid_edit_pixels` | 0 cr | Patch exact integer pixel rows on a frame as a new immutable version |
| `celgrid_rename` | 0 cr | Update sprite display title |
| `celgrid_timing` | 0 cr | Change playback and export FPS (0.5 to 60) without redrawing |
| `celgrid_export` | 0 cr | Get validated metadata and lossless `pack.zip`, `spritesheet.png`, and `frame.png` URLs |

## Pricing & Free Tier
- **Manual Browser Editor & Lossless Exports:** $0 forever at `https://celgrid.ai/studio`
- **Starter:** 25 free AI credits + $0.50 BYOK fee credit on verified account
- **Indie:** $19/mo (750 cr/mo) | **Studio:** $49/mo (2,200 cr/mo, includes REST API & MCP keys) | **BYOK:** $0/mo + 15% orchestration fee

## License
MIT License - Ludoitte Oy. See [LICENSE](./LICENSE).
