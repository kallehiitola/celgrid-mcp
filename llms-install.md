# Autonomous MCP Installation Guide for AI Coding Agents (Cline, Claude Code, Cursor, Codex)

This file lets AI coding agents install and verify **Celgrid MCP (`celgrid-mcp`)** automatically.

## Prerequisites
- Node.js 18 or newer (`node --version`).
- Optional `CELGRID_API_KEY` (`cg_live_...`) generated in Account Settings at `https://celgrid.ai/settings` (Studio plan includes REST API and MCP keys; reading `/v1/guide` and inspecting the 4 built-in starter packs work without a key).
- Optional `ANTHROPIC_API_KEY` if using Bring Your Own Key (BYOK) mode (15% flat orchestration fee from prepaid wallet).

## Step 1: Register the MCP Server

### Claude Code CLI
```bash
claude mcp add celgrid -- npx -y celgrid-mcp
```
With an API key:
```bash
claude mcp add celgrid -e CELGRID_API_KEY=cg_live_your_key -- npx -y celgrid-mcp
```

### Cursor (`.cursor/mcp.json`) or Cline (`cline_mcp_settings.json`)
```json
{
  "mcpServers": {
    "celgrid": {
      "command": "npx",
      "args": ["-y", "celgrid-mcp"],
      "env": {
        "CELGRID_URL": "https://celgrid.ai",
        "CELGRID_API_KEY": "cg_live_your_key"
      }
    }
  }
}
```

## Step 2: Verify Installation
1. Call `celgrid_guide` to fetch the live Celgrid agent guide.
2. Call `celgrid_library` with `{"q": "knight"}` to verify live starter pack assets return cleanly.
3. Call `celgrid_export` on any returned 12-character hex asset ID to inspect its lossless `pack.zip`, `spritesheet.png`, and `sprite.json` URLs.

## Step 3: Recommended Game-Dev Workflow
- Generate a base still sprite first (`frames: 1`, `quality: "studio"`, locked palette such as `"apollo"` or `"sweetie16"`).
- Pass `source_asset` and `source_frame: 1` when generating walk, idle, jump, or attack cycles so silhouette, proportions, and palette never drift.
- Download `pack_zip` to get pre-wired Godot 4 (`animation.tres` + `sprite.tscn`), Unity C# (`UnitySpriteForgeImporter.cs.txt`), Phaser 3 (`atlas.json` + `phaser-animations.json`), and Aseprite JSON assets with nearest-neighbor filtering already set.
