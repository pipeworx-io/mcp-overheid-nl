# mcp-overheid-nl

data.overheid.nl MCP — the Netherlands national open-data portal (CKAN API).

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 708+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
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

Or connect to the full Pipeworx gateway for access to all 708+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Overheid Nl data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
