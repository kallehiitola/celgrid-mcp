#!/usr/bin/env node
/**
 * Celgrid MCP Server (Zero-dependency stdio JSON-RPC 2.0 adapter)
 * Connects Claude Code, Cursor, Codex, Windsurf, and Cline to Celgrid (https://celgrid.ai)
 * for exact 1:1 indexed pixel sprites, animations, AI Ripple Edit propagation, and lossless
 * Godot 4 / Unity / Phaser 3 / Aseprite export packs.
 */

import readline from "node:readline";

const BASE_URL = (process.env.CELGRID_URL || process.env.SPRITEFORGE_URL || "https://celgrid.ai").replace(/\/+$/, "");
const CELGRID_API_KEY = (process.env.CELGRID_API_KEY || "").trim();
const ANTHROPIC_API_KEY = (process.env.ANTHROPIC_API_KEY || process.env.CELGRID_BYOK_KEY || "").trim();

const INSTRUCTIONS =
  "Start with celgrid_guide to learn Celgrid's exact-grid pipeline, locked palettes, and export pack structure. " +
  "Reuse source_asset and 1-based source_frame when animating a character so silhouettes and palettes stay locked. " +
  "Use celgrid_create_blank or celgrid_edit_pixels for 0-credit manual pixel canvases/patches, celgrid_revise for " +
  "2-credit masked frame repairs, and celgrid_propagate_edit (AI Ripple Edit) to apply a single-frame edit across " +
  "remaining frames and linked animations.";

const ID_SCHEMA = { type: "string", pattern: "^[0-9a-f]{12}$" };
const FRAME_SCHEMA = { type: "integer", minimum: 1, maximum: 64 };
const MASK_SCHEMA = {
  type: "array",
  items: { type: "string", pattern: "^[.AL]{4,64}$" },
  minItems: 4,
  maxItems: 64,
};
const PALETTE_LOCK_SCHEMA = {
  oneOf: [
    { type: "string", enum: ["auto", "pico8", "sweetie16", "endesga16", "gameboy", "apollo", "slso8"] },
    { type: "object", properties: { asset_id: ID_SCHEMA }, required: ["asset_id"] },
    { type: "object", properties: { colors: { type: "array", items: { type: "string" } } }, required: ["colors"] },
  ],
};
const REF_IMAGE_SCHEMA = {
  oneOf: [
    {
      type: "object",
      properties: {
        media_type: { type: "string", enum: ["image/png", "image/jpeg", "image/webp", "image/gif"] },
        data: { type: "string", description: "Base64 encoded image bytes" },
      },
      required: ["media_type", "data"],
    },
    {
      type: "object",
      properties: { asset_id: ID_SCHEMA, frame: FRAME_SCHEMA },
      required: ["asset_id"],
    },
  ],
};
const REFERENCES_SCHEMA = {
  type: "object",
  properties: {
    style: { type: "array", items: REF_IMAGE_SCHEMA, maxItems: 12 },
    subject: { type: "array", items: REF_IMAGE_SCHEMA, maxItems: 12 },
  },
  additionalProperties: false,
};
const MODEL_ENUM = ["auto", "claude-fable-5-2", "claude-opus-5-5", "claude-sonnet-5-5", "claude-haiku-5-5"];

const TOOLS = [
  {
    name: "celgrid_guide",
    description: "Read the live Celgrid agent guide: exact pixel-grid rules, locked palettes, animation guidelines, BYOK headers, and engine export formats.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "celgrid_library",
    description: "List available sprites and animations (including the 4 built-in free starter packs and your saved library sprites) with optional filters.",
    inputSchema: {
      type: "object",
      properties: {
        q: { type: "string", description: "Search query for title, prompt, or tag" },
        project_id: { type: "string", description: "Filter by project ID" },
        animation: { type: "string", enum: ["still", "idle", "walk", "run", "attack", "hurt", "cast", "custom"] },
        size: { type: "string", description: "Canvas size filter such as 16x16 or 24x24" },
        type: { type: "string", enum: ["all", "animations", "stills", "starred"] },
      },
      additionalProperties: false,
    },
  },
  {
    name: "celgrid_create_blank",
    description: "Create a clean transparent indexed pixel canvas (4x4 to 64x64, 1 to 16 frames, curated or custom hex palette) at 0 credits.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", minLength: 1, maxLength: 120 },
        width: { type: "integer", minimum: 4, maximum: 64, default: 24 },
        height: { type: "integer", minimum: 4, maximum: 64, default: 24 },
        frames: { type: "integer", minimum: 1, maximum: 16, default: 1 },
        palette_lock: { type: "string", enum: ["sweetie16", "apollo", "endesga16", "pico8", "slso8", "gameboy"] },
        colors: { type: "array", items: { type: "string", pattern: "^#[0-9a-fA-F]{6}$" }, minItems: 1, maxItems: 32 },
        project_id: { type: "string" },
        fps: { type: "number", minimum: 0.5, maximum: 60 },
      },
      additionalProperties: false,
    },
  },
  {
    name: "celgrid_generate",
    description: "Generate an exact 1:1 indexed pixel sprite or multi-frame animation on a locked palette. Reuse source_asset when animating a character.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", minLength: 1, maxLength: 2000 },
        title: { type: "string", maxLength: 120 },
        width: { type: "integer", minimum: 4, maximum: 64 },
        height: { type: "integer", minimum: 4, maximum: 64 },
        max_colors: { type: "integer", minimum: 1, maximum: 32 },
        frames: { type: "integer", minimum: 1, maximum: 64 },
        fps: { type: "number", minimum: 0.5, maximum: 60 },
        view: { type: "string", enum: ["auto", "front", "side", "back", "top", "three_quarter"] },
        animation: { type: "string", enum: ["auto", "idle", "walk", "run", "attack", "hurt", "cast", "custom"] },
        custom_motion: { type: "string", maxLength: 2000 },
        outline: { type: "string", enum: ["auto", "dark", "colored", "none"] },
        movement: { type: "string", enum: ["in_place", "travel"] },
        motion_strength: { type: "string", enum: ["subtle", "normal", "strong"] },
        quality: { type: "string", enum: ["fast", "balanced", "studio"] },
        model: { type: "string", enum: MODEL_ENUM },
        palette_lock: PALETTE_LOCK_SCHEMA,
        source_asset: ID_SCHEMA,
        source_frame: FRAME_SCHEMA,
        references: REFERENCES_SCHEMA,
        pixel_mask: MASK_SCHEMA,
        project_id: { type: "string" },
        maps: { type: "array", items: { type: "string", enum: ["diffuse", "light"] } },
      },
      required: ["prompt"],
      additionalProperties: false,
    },
  },
  {
    name: "celgrid_revise",
    description: "Surgical AI repair on one frame (or draw and insert the next animation pose) with optional green Allow / coral Lock pixel mask.",
    inputSchema: {
      type: "object",
      properties: {
        id: ID_SCHEMA,
        frame: FRAME_SCHEMA,
        operation: { type: "string", enum: ["repair", "next"] },
        instruction: { type: "string", minLength: 1, maxLength: 2000 },
        model: { type: "string", enum: MODEL_ENUM },
        pixel_mask: MASK_SCHEMA,
        references: REFERENCES_SCHEMA,
      },
      required: ["id", "frame", "operation", "instruction"],
      additionalProperties: false,
    },
  },
  {
    name: "celgrid_propagate_edit",
    description: "AI Ripple Edit: diff an edited frame against its original and semantically apply that exact visual change across remaining frames and up to 6 same-size linked animations.",
    inputSchema: {
      type: "object",
      properties: {
        id: ID_SCHEMA,
        source_frame: FRAME_SCHEMA,
        instruction: { type: "string", maxLength: 1200 },
        include_current_frames: { type: "boolean", default: true },
        linked_asset_ids: { type: "array", items: ID_SCHEMA, maxItems: 6 },
        model: { type: "string", enum: MODEL_ENUM },
      },
      required: ["id"],
      additionalProperties: false,
    },
  },
  {
    name: "celgrid_edit_pixels",
    description: "Save direct indexed integer pixel edits on one frame at 0 credits as a new immutable version.",
    inputSchema: {
      type: "object",
      properties: {
        id: ID_SCHEMA,
        frame: FRAME_SCHEMA,
        grid: { type: "array", items: { type: "array", items: { type: "integer", minimum: 0 } } },
        note: { type: "string", maxLength: 240 },
      },
      required: ["id", "frame", "grid"],
      additionalProperties: false,
    },
  },
  {
    name: "celgrid_rename",
    description: "Rename a saved sprite asset.",
    inputSchema: {
      type: "object",
      properties: {
        id: ID_SCHEMA,
        title: { type: "string", minLength: 1, maxLength: 120 },
      },
      required: ["id", "title"],
      additionalProperties: false,
    },
  },
  {
    name: "celgrid_timing",
    description: "Update playback and export FPS (0.5 to 60) on an existing animation without regenerating pixels (0 credits).",
    inputSchema: {
      type: "object",
      properties: {
        id: ID_SCHEMA,
        fps: { type: "number", minimum: 0.5, maximum: 60 },
      },
      required: ["id", "fps"],
      additionalProperties: false,
    },
  },
  {
    name: "celgrid_export",
    description: "Fetch validated sprite metadata, palette hexes, spritesheet geometry, and lossless download URLs for Godot 4, Unity C#, Phaser 3, and Aseprite packs.",
    inputSchema: {
      type: "object",
      properties: { id: ID_SCHEMA },
      required: ["id"],
      additionalProperties: false,
    },
  },
];

function buildHeaders(hasBody) {
  const headers = {
    Accept: "application/json, text/markdown;q=0.9, text/plain;q=0.8",
    "User-Agent": "celgrid-mcp/1.0.0",
  };
  if (hasBody) headers["Content-Type"] = "application/json";
  if (CELGRID_API_KEY) headers["X-Celgrid-Api-Key"] = CELGRID_API_KEY;
  if (ANTHROPIC_API_KEY) headers["X-Anthropic-Key"] = ANTHROPIC_API_KEY;
  return headers;
}

async function apiRequest(route, payload = undefined, method = undefined) {
  const hasBody = payload !== undefined;
  const res = await fetch(`${BASE_URL}${route}`, {
    method: method || (hasBody ? "POST" : "GET"),
    headers: buildHeaders(hasBody),
    body: hasBody ? JSON.stringify(payload) : undefined,
  });
  const text = await res.text();
  const ct = (res.headers.get("content-type") || "").toLowerCase();
  if (!res.ok) {
    let msg = text || `HTTP ${res.status}`;
    if (ct.includes("application/json")) {
      try {
        const parsed = JSON.parse(text);
        msg = parsed.error || parsed.detail?.error || parsed.detail || msg;
      } catch {}
    }
    throw new Error(`Celgrid API ${res.status}: ${msg}`);
  }
  if (ct.includes("application/json")) {
    return JSON.parse(text);
  }
  return text;
}

function assertId(id) {
  if (typeof id !== "string" || !/^[0-9a-f]{12}$/.test(id)) {
    throw new Error("Invalid asset ID: expected a 12-character lowercase hex string.");
  }
  return id;
}

function summarizeAsset(data) {
  const clean = { ...data };
  delete clean.grid;
  const base = `${BASE_URL}/v1/pixel-assets/${clean.id}`;
  return {
    asset: clean,
    studio_url: `${BASE_URL}/studio?asset=${clean.id}`,
    pack_zip: `${base}/pack.zip`,
    spritesheet_png: `${base}/spritesheet.png`,
    frame0_png: `${base}/frame.png?index=0`,
    metadata_json: `${base}/json`,
  };
}

async function callTool(name, args = {}) {
  if (name === "celgrid_guide") {
    return await apiRequest("/v1/guide");
  }
  if (name === "celgrid_library") {
    const params = new URLSearchParams();
    for (const k of ["q", "project_id", "animation", "size", "type"]) {
      if (args[k]) params.set(k, String(args[k]));
    }
    const qs = params.toString();
    return await apiRequest(`/v1/pixel-assets${qs ? `?${qs}` : ""}`);
  }
  if (name === "celgrid_create_blank") {
    return summarizeAsset(await apiRequest("/v1/pixel-assets/blank", args, "POST"));
  }
  if (name === "celgrid_generate") {
    return summarizeAsset(await apiRequest("/v1/pixel-assets", args, "POST"));
  }
  if (name === "celgrid_revise") {
    const id = assertId(args.id);
    const body = { ...args };
    delete body.id;
    return summarizeAsset(await apiRequest(`/v1/pixel-assets/${id}/frames`, body, "POST"));
  }
  if (name === "celgrid_propagate_edit") {
    const id = assertId(args.id);
    const body = { ...args };
    delete body.id;
    const out = await apiRequest(`/v1/pixel-assets/${id}/propagate`, body, "POST");
    const summary = summarizeAsset(out);
    if (Array.isArray(out.propagated_assets)) {
      summary.propagated_assets = out.propagated_assets.map(summarizeAsset);
    }
    return summary;
  }
  if (name === "celgrid_edit_pixels") {
    const id = assertId(args.id);
    const body = { ...args };
    delete body.id;
    return summarizeAsset(await apiRequest(`/v1/pixel-assets/${id}/pixels`, body, "POST"));
  }
  if (name === "celgrid_rename") {
    const id = assertId(args.id);
    return await apiRequest(`/v1/pixel-assets/${id}`, { title: args.title }, "PATCH");
  }
  if (name === "celgrid_timing") {
    const id = assertId(args.id);
    return await apiRequest(`/v1/pixel-assets/${id}/timing`, { fps: args.fps }, "POST");
  }
  if (name === "celgrid_export") {
    const id = assertId(args.id);
    return summarizeAsset(await apiRequest(`/v1/pixel-assets/${id}/json`));
  }
  throw new Error(`Unknown tool: ${name}`);
}

async function handleMessage(msg) {
  if (!msg || typeof msg !== "object") {
    return { jsonrpc: "2.0", id: null, error: { code: -32600, message: "Invalid request" } };
  }
  if (!("id" in msg)) {
    return null; // Notification (e.g., notifications/initialized)
  }
  const out = { jsonrpc: "2.0", id: msg.id };
  const method = msg.method;
  if (method === "initialize") {
    const requested = msg.params?.protocolVersion;
    const supported = ["2024-11-05", "2025-03-26", "2025-06-18", "2025-11-25"];
    out.result = {
      protocolVersion: supported.includes(requested) ? requested : supported[supported.length - 1],
      serverInfo: { name: "celgrid", version: "1.0.0" },
      capabilities: { tools: {} },
      instructions: INSTRUCTIONS,
    };
    return out;
  }
  if (method === "ping") {
    out.result = {};
    return out;
  }
  if (method === "tools/list") {
    out.result = { tools: TOOLS };
    return out;
  }
  if (method === "tools/call") {
    try {
      const toolName = msg.params?.name;
      const toolArgs = msg.params?.arguments || {};
      const result = await callTool(toolName, toolArgs);
      const text = typeof result === "string" ? result : JSON.stringify(result, null, 2);
      out.result = { content: [{ type: "text", text }] };
    } catch (err) {
      out.result = {
        content: [{ type: "text", text: err?.message || String(err) }],
        isError: true,
      };
    }
    return out;
  }
  out.error = { code: -32601, message: `Method not found: ${method}` };
  return out;
}

const rl = readline.createInterface({ input: process.stdin, terminal: false });
rl.on("line", async (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  let resp;
  try {
    resp = await handleMessage(JSON.parse(trimmed));
  } catch {
    resp = { jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } };
  }
  if (resp !== null) {
    process.stdout.write(`${JSON.stringify(resp)}\n`);
  }
});
