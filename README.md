# mcp-overheid-nl

data.overheid.nl MCP — the Netherlands national open-data portal (CKAN API).

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1476+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `search_datasets` | Search the data.overheid.nl catalogue of Dutch government open data (CKAN package_search). Returns matching datasets with titles/descriptions (mostly Dutch). Query may be Dutch or English; Dutch matches more. |
| `dataset_details` | Full dataset record by id or slug (CKAN package_show), including its resources. Each resource has a download "url" and "format" (CSV/JSON/etc.) — the portal is metadata-only, so fetch those URLs to get the actual data. |
| `list_organizations` | List publishing organizations (ministries/agencies/provinces) on data.overheid.nl (CKAN organization_list). Use an org "name" in search_datasets fq, e.g. "organization:<name>". |
| `list_groups` | List thematic groups/categories on data.overheid.nl (CKAN group_list). Note: this portal currently exposes no groups (returns an empty list) — prefer fq facets on search_datasets to narrow by theme. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "overheid-nl": {
      "url": "https://gateway.pipeworx.io/overheid-nl/mcp"
    }
  }
}
```

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/overheid-nl/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1476+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Overheid Nl data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
