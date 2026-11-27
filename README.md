# Celgrid MCP Server (`celgrid-mcp`)

[![kallehiitola/celgrid-mcp MCP server](https://glama.ai/mcp/servers/kallehiitola/celgrid-mcp/badges/score.svg)](https://glama.ai/mcp/servers/kallehiitola/celgrid-mcp)
[![Official MCP Registry](https://img.shields.io/badge/MCP%20Registry-ai.celgrid%2Fcelgrid-blue)](https://registry.modelcontextprotocol.io/v0/servers?search=ai.celgrid%2Fcelgrid)

Pixel-native AI sprite studio and animation **Model Context Protocol (MCP)** server for **Claude Code, Cursor, OpenAI Codex, Windsurf, and Cline** backed by [Celgrid](https://celgrid.ai).

Built for both human game developers and AI coding agents making 2D games: instead of blurry diffusion images full of mixels and dirty alpha halos, Celgrid generates **exact 1:1 indexed integer pixel grids (4x4 to 64x64)** on locked color palettes with 3-pass Vision self-critique, paired with a **$0 browser pixel editor**, **AI Ripple Edit** across frames/animations, and lossless engine packs for **Godot 4, Unity, Phaser 3, and Aseprite**.

## Why Celgrid MCP?

- **Exact 1:1 Indexed Pixel Grids:** Zero mixels, zero blurry anti-aliasing, zero semi-transparent alpha fringe.
- **Locked Game Palettes:** Built-in `apollo`, `sweetie16`, `endesga16`, `pico8`, `slso8`, `gameboy`, existing-asset palette locking, or custom hex ramps.
- **Turnkey Engine Packs (`pack.zip`):** Ready-to-drop Godot 4 (`animation.tres` + `sprite.tscn` with Nearest filter), Unity C# (`UnityCelgridImporter.cs.txt`), Phaser 3 (`atlas.json` + `phaser-animations.json`), and Aseprite JSON.
- **Hybrid Human + AI Control:** Open any generated sprite in the $0 browser Studio (`https://celgrid.ai/studio`), edit one frame by hand, and run `celgrid_propagate_edit` (AI Ripple Edit) to apply that edit across every frame and linked animation.
- **Zero Dependencies:** Pure Node.js standard library (`>= 18`), clean audit surface.

## Connect Celgrid MCP

Start in Claude Code with the hosted Streamable HTTP server. You can call `celgrid_guide` and `celgrid_library` without signing in.

```sh
claude mcp add celgrid --transport http https://celgrid.ai/mcp
```

For account tools, create a [personal API key](https://celgrid.ai/settings#api-keys). Verified Starter, Indie, and Studio accounts can create keys, including customers using only a prepaid credit pack or BYOK wallet. Configure the hosted connection with `Authorization: Bearer <key>` or `X-API-Key: <key>`. Store the key in your client's secret settings.

For BYOK generation, use your saved Anthropic key from Settings or pass `X-Anthropic-Key` alongside the Celgrid key. Anthropic bills your account directly. Celgrid deducts a 15% orchestration fee from your prepaid fee wallet.

### Stdio fallback

Use Node.js 18 or later. Claude Code can install the public GitHub package directly.

```sh
claude mcp add celgrid -- npx -y github:kallehiitola/celgrid-mcp
```

For other stdio clients, use command `npx` with arguments `-y` and `github:kallehiitola/celgrid-mcp`. Pass `CELGRID_API_KEY` and optionally `ANTHROPIC_API_KEY` through the client's environment. `CELGRID_URL` defaults to `https://celgrid.ai`.

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
- **Starter:** 25 one-time AI credits and $0.50 BYOK fee credit for eligible verified accounts. 2 personal keys and 20 hosted MCP requests per minute. Free managed AI usage is subject to the Starter cap.
- **Indie:** $19/mo, 750 credits per month, 5 personal keys, and 60 hosted MCP requests per minute.
- **Studio:** $49/mo, 2,200 credits per month, 90-day rollover, priority jobs, pipeline cost telemetry, 20 personal keys, and 120 hosted MCP requests per minute.
- **One-time packs and BYOK:** Use a personal key on your verified account. A subscription is optional.

## License
MIT License - Ludoitte Oy. See [LICENSE](./LICENSE).

## Playable MIT Engine Starters (Pre-Wired with Celgrid Sprites & MCP Rules)

- **Godot 4.3+:** [kallehiitola/celgrid-mcp-godot-starter](https://github.com/kallehiitola/celgrid-mcp-godot-starter) (native `SpriteFrames` `.tres`, `sprite.tscn`, integer pixel viewport)
- **Unity 2D:** [kallehiitola/celgrid-mcp-unity-starter](https://github.com/kallehiitola/celgrid-mcp-unity-starter) (one-click `Assets/Editor/CelgridImporter.cs` `.anim` importer + `CryptboundPlayer2D.cs`)
- **Phaser 3:** [kallehiitola/celgrid-mcp-phaser-starter](https://github.com/kallehiitola/celgrid-mcp-phaser-starter) (playable dungeon room in 10 seconds with `pixelArt: true`)
