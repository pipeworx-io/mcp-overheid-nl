interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * data.overheid.nl MCP — the Netherlands national open-data portal (CKAN API).
 *
 * Auth: none (keyless). Docs: https://docs.ckan.org/en/latest/api/
 *
 * Notes for callers:
 * - This is DUTCH GOVERNMENT open data. Dataset titles, descriptions,
 *   organization display names and tags are in DUTCH (UTF-8). Free-text
 *   `query`/`q` arguments may be passed in Dutch or English; Dutch matches a
 *   much larger subset of datasets. Records come back as UTF-8 JSON — no extra
 *   decoding needed.
 * - The portal is metadata-only: resources point at downloadable files
 *   (CSV/JSON/etc.) hosted by the publishing organization. CKAN's datastore
 *   extension is NOT enabled here (datastore_search returns "Action name not
 *   known"), so there is no row-level table query tool — use dataset_details
 *   to get each resource's download `url`.
 * - `list_groups` is supported by the API but data.overheid.nl currently
 *   exposes no thematic groups (it returns an empty list); use `fq` on
 *   `search_datasets` (e.g. tags/organization facets) to narrow instead.
 */


const BASE = 'https://data.overheid.nl/data/api/3/action';
const UA = 'pipeworx-mcp-overheid-nl/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'search_datasets',
    description:
      'Search the data.overheid.nl catalogue of Dutch government open data (CKAN package_search). Returns matching datasets with titles/descriptions (mostly Dutch). Query may be Dutch or English; Dutch matches more.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search terms, Dutch or English. e.g. "onderwijs", "verkeer", "health", "budget". Use "*:*" to match everything.' },
        fq: { type: 'string', description: 'Solr filter query, e.g. "organization:cbs-microdata" or "tags:onderwijs".' },
        rows: { type: 'number', description: 'Max results, 1-1000 (default 25).' },
        start: { type: 'number', description: '0-based offset for paging.' },
        sort: { type: 'string', description: 'Sort spec, e.g. "metadata_modified desc".' },
      },
      required: ['query'],
    },
  },
  {
    name: 'dataset_details',
    description:
      'Full dataset record by id or slug (CKAN package_show), including its resources. Each resource has a download "url" and "format" (CSV/JSON/etc.) — the portal is metadata-only, so fetch those URLs to get the actual data.',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string', description: 'Dataset id or slug, e.g. "leerlingen-speciaal-onderwijs-per-samenwerkingsverband-primair-onderwijs".' } },
      required: ['id'],
    },
  },
  {
    name: 'list_organizations',
    description: 'List publishing organizations (ministries/agencies/provinces) on data.overheid.nl (CKAN organization_list). Use an org "name" in search_datasets fq, e.g. "organization:<name>".',
    inputSchema: {
      type: 'object',
      properties: { limit: { type: 'number', description: 'Max orgs, 1-1000 (default 100).' } },
    },
  },
  {
    name: 'list_groups',
    description: 'List thematic groups/categories on data.overheid.nl (CKAN group_list). Note: this portal currently exposes no groups (returns an empty list) — prefer fq facets on search_datasets to narrow by theme.',
    inputSchema: {
      type: 'object',
      properties: { limit: { type: 'number', description: 'Max groups, 1-1000 (default 100).' } },
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'search_datasets': {
      const params = new URLSearchParams({
        q: reqStr(args, 'query', '"onderwijs" or "health"'),
        rows: String(clamp(args.rows, 25, 1, 1000)),
        start: String(Math.max(0, (args.start as number) ?? 0)),
      });
      if (args.fq) params.set('fq', String(args.fq));
      if (args.sort) params.set('sort', String(args.sort));
      return ckanGet(`/package_search?${params}`);
    }
    case 'dataset_details':
      return ckanGet(`/package_show?id=${encodeURIComponent(reqStr(args, 'id', '"leerlingen-speciaal-onderwijs-per-samenwerkingsverband-primair-onderwijs"'))}`);
    case 'list_organizations': {
      const params = new URLSearchParams({ all_fields: 'true', limit: String(clamp(args.limit, 100, 1, 1000)) });
      return ckanGet(`/organization_list?${params}`);
    }
    case 'list_groups': {
      const params = new URLSearchParams({ all_fields: 'true', limit: String(clamp(args.limit, 100, 1, 1000)) });
      return ckanGet(`/group_list?${params}`);
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function ckanGet(path: string): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (!res.ok) throw new Error(`data.overheid.nl: ${res.status} ${await res.text().then((t) => t.slice(0, 200))}`);
  const json = (await res.json()) as { success?: boolean; error?: { message?: string }; result?: unknown };
  if (json.success === false) throw new Error(`data.overheid.nl: ${json.error?.message ?? 'request failed'}`);
  return json.result ?? json;
}

function clamp(v: unknown, dflt: number, lo: number, hi: number): number {
  const n = typeof v === 'number' ? v : dflt;
  return Math.min(hi, Math.max(lo, n));
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) {
    throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  }
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
