# mcp-overheid-nl

data.overheid.nl MCP — the Netherlands national open-data portal (CKAN API).

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

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

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
