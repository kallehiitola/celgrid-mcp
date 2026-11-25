# Install Celgrid MCP

Use the hosted MCP server at `https://celgrid.ai/mcp` with Streamable HTTP. Public guide and library tools work without credentials.

## Claude Code

```sh
claude mcp add celgrid --transport http https://celgrid.ai/mcp
```

## Cline, Cursor, and other MCP clients

Add `https://celgrid.ai/mcp` as a Streamable HTTP server. For a stdio client, use the public GitHub package with Node.js 18 or later.

```json
{
  "mcpServers": {
    "celgrid": {
      "command": "npx",
      "args": ["-y", "github:kallehiitola/celgrid-mcp"]
    }
  }
}
```

## Verify and authorize

1. Call `celgrid_guide` to read the live service guide.
2. Call `celgrid_library` with `{"q": "knight"}` and confirm it returns public sprites.
3. For account tools, have the user create a [personal API key](https://celgrid.ai/settings#api-keys). Keys are available on all verified accounts, including Starter, Indie, Studio, credit pack, and BYOK wallet users.
4. Add the key through a protected client setting as `Authorization: Bearer <key>` or `X-API-Key` for HTTP, or as `CELGRID_API_KEY` for stdio.
5. BYOK generation uses the saved Anthropic key or optional `X-Anthropic-Key` header (`ANTHROPIC_API_KEY` for stdio). The prepaid Celgrid wallet covers the 15% orchestration fee. Ask before incurring AI generation costs.

Never ask someone to paste a real key in chat, echo a key, or add it to a committed configuration.
