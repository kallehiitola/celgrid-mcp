import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const binPath = path.join(__dirname, "bin", "celgrid-mcp.mjs");

const child = spawn(process.execPath, [binPath], {
  env: { ...process.env, CELGRID_URL: process.env.CELGRID_URL || "https://celgrid.ai" },
  stdio: ["pipe", "pipe", "pipe"],
});

let buf = "";
const pending = new Map();

child.stdout.on("data", (chunk) => {
  buf += chunk.toString("utf8");
  while (buf.includes("\n")) {
    const idx = buf.indexOf("\n");
    const line = buf.slice(0, idx).trim();
    buf = buf.slice(idx + 1);
    if (!line) continue;
    const msg = JSON.parse(line);
    const resolver = pending.get(msg.id);
    if (resolver) {
      pending.delete(msg.id);
      resolver(msg);
    }
  }
});

function rpc(id, method, params = {}) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timeout waiting for ${method}`)), 15000);
    pending.set(id, (msg) => {
      clearTimeout(timer);
      resolve(msg);
    });
    child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id, method, params })}\n`);
  });
}

try {
  const init = await rpc(1, "initialize", { protocolVersion: "2025-11-25", clientInfo: { name: "smoke", version: "1.0" } });
  if (init.result?.serverInfo?.name !== "celgrid-mcp") throw new Error("Unexpected serverInfo");

  const ping = await rpc(2, "ping");
  if (!ping.result) throw new Error("Ping failed");

  const list = await rpc(3, "tools/list");
  const names = (list.result?.tools || []).map((t) => t.name);
  if (names.length !== 10 || !names.includes("celgrid_propagate_edit") || !names.includes("celgrid_create_blank")) {
    throw new Error(`Expected 10 tools including propagate/create_blank, got: ${names.join(",")}`);
  }

  const guide = await rpc(4, "tools/call", { name: "celgrid_guide", arguments: {} });
  if (guide.result?.isError || !(guide.result?.content?.[0]?.text || "").includes("Celgrid")) {
    throw new Error(`celgrid_guide failed: ${JSON.stringify(guide)}`);
  }

  const lib = await rpc(5, "tools/call", { name: "celgrid_library", arguments: { q: "knight" } });
  if (lib.result?.isError) throw new Error(`celgrid_library failed: ${JSON.stringify(lib)}`);
  const parsedLib = JSON.parse(lib.result.content[0].text);
  if (!Array.isArray(parsedLib.assets) || parsedLib.assets.length < 1) {
    throw new Error("Expected starter pack knight assets from live celgrid.ai");
  }

  const firstId = parsedLib.assets[0].id;
  const exp = await rpc(6, "tools/call", { name: "celgrid_export", arguments: { id: firstId } });
  if (exp.result?.isError) throw new Error(`celgrid_export failed: ${JSON.stringify(exp)}`);
  const parsedExp = JSON.parse(exp.result.content[0].text);
  if (!parsedExp.pack_zip?.endsWith("/pack.zip")) throw new Error("Missing pack_zip export URL");

  console.log(`CELGRID_MCP_SMOKE_OK tools=${names.length} live_knights=${parsedLib.assets.length} sample=${firstId}`);
} finally {
  child.kill();
}
