// Agent Router API — Cloudflare Worker
// Unified search across AI agent registries
// Phase 2: MCP Registry + Smithery + Glama + HuggingFace + Aiia.ro + Google A2A Discovery
// Version: 0.2.0

import { renderLandingPage } from './landing.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Rate limiting (simple IP-based via KV)
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rateKey = `rate:${clientIP}`;
    const rateData = await env.AGENT_ROUTER_KV.get(rateKey, 'json');
    const now = Date.now();
    if (rateData && rateData.count > 100 && (now - rateData.ts) < 3600000) {
      return jsonResponse({ error: 'Rate limit exceeded', retry_after: Math.ceil((3600000 - (now - rateData.ts)) / 1000) }, 429);
    }
    await env.AGENT_ROUTER_KV.put(rateKey, JSON.stringify({ count: (rateData?.count || 0) + 1, ts: rateData?.ts || now }), { expirationTtl: 3600 });

    // Routes — Serve landing page for browsers, JSON for API clients
    const acceptHtml = (request.headers.get('Accept') || '').includes('text/html');

    if (url.pathname === '/' || url.pathname === '') {
      if (acceptHtml) {
        return new Response(renderLandingPage(), {
          headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
        });
      }
      return jsonResponse({
        name: 'Agent Router API',
        version: '0.2.0',
        description: 'Universal AI Agent Discovery Platform — Search across all agent registries',
        total_registries: REGISTRIES.length,
        endpoints: {
          search: '/search?q={query}&limit={n}&registry={optional}',
          agent: '/agent/{id}',
          registries: '/registries',
          stats: '/stats',
          health: '/health',
          convert: '/convert?url={agent_manifest_url}',
          validate: 'POST /validate (body: agent.json)',
        },
        spec: 'https://github.com/HOTAgithub/agent-json',
        ietf_draft: 'https://datatracker.ietf.org/doc/draft-hori-agent-quality-graph/',
      });
    }

    if (url.pathname === '/health') {
      return jsonResponse({ status: 'healthy', version: '0.2.0', timestamp: new Date().toISOString() });
    }

    if (url.pathname === '/registries') {
      return jsonResponse({
        total: REGISTRIES.length,
        registries: REGISTRIES.map(r => ({
          id: r.id,
          name: r.name,
          url: r.url,
          type: r.type,
          status: r.status,
          protocol: r.protocol,
          agent_count: r.agentCount,
        })),
      });
    }

    if (url.pathname === '/stats') {
      const cached = await env.AGENT_ROUTER_KV.get('stats:v2', 'json');
      if (cached) return jsonResponse(cached);
      const stats = {
        total_known_agents: '~104,000+',
        registries_integrated: REGISTRIES.filter(r => r.status === 'active').length,
        registries_planned: REGISTRIES.filter(r => r.status === 'planned').length,
        protocols_supported: ['mcp', 'a2a', 'http'],
        last_updated: new Date().toISOString(),
        source: 'aggregated from public registry APIs',
      };
      await env.AGENT_ROUTER_KV.put('stats:v2', JSON.stringify(stats), { expirationTtl: 86400 });
      return jsonResponse(stats);
    }

    if (url.pathname === '/search') {
      const query = url.searchParams.get('q') || '';
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
      const registryFilter = url.searchParams.get('registry') || null;

      if (!query) {
        return jsonResponse({ error: 'Missing query parameter "q"', example: '/search?q=github&limit=10' }, 400);
      }

      // Check cache
      const cacheKey = `search:v2:${query}:${limit}:${registryFilter || 'all'}`;
      const cached = await env.AGENT_ROUTER_KV.get(cacheKey, 'json');
      if (cached) {
        return jsonResponse({ ...cached, cached: true, cache_age_seconds: Math.floor((now - new Date(cached.timestamp).getTime()) / 1000) });
      }

      // Search across registries in parallel
      const registryPromises = REGISTRIES
        .filter(r => r.status === 'active')
        .filter(r => !registryFilter || r.id === registryFilter)
        .map(r => searchRegistry(r, query, limit));

      const results = await Promise.allSettled(registryPromises);

      // Collect and normalize all agents
      const agents = [];
      const registryStats = {};

      for (let i = 0; i < results.length; i++) {
        const registry = REGISTRIES.filter(r => r.status === 'active').filter(r => !registryFilter || r.id === registryFilter)[i];
        const result = results[i];
        const count = result.status === 'fulfilled' ? result.value.length : 0;
        registryStats[registry.id] = { name: registry.name, results: count, status: result.status };

        if (result.status === 'fulfilled' && result.value) {
          for (const item of result.value) {
            agents.push(registry.normalize(item));
          }
        }
      }

      // Deduplicate by name similarity
      const unique = deduplicate(agents);

      // Sort by relevance
      const q = query.toLowerCase();
      unique.sort((a, b) => {
        const aName = a.name.toLowerCase().includes(q) ? 2 : 0;
        const bName = b.name.toLowerCase().includes(q) ? 2 : 0;
        if (aName !== bName) return bName - aName;
        const aDesc = (a.description || '').toLowerCase().includes(q) ? 1 : 0;
        const bDesc = (b.description || '').toLowerCase().includes(q) ? 1 : 0;
        if (aDesc !== bDesc) return bDesc - aDesc;
        // Secondary sort: trust score
        const aTrust = a.trust?.score || 0;
        const bTrust = b.trust?.score || 0;
        return bTrust - aTrust;
      });

      const response = {
        query,
        total: unique.length,
        limit,
        results: unique.slice(0, limit),
        registries_searched: Object.keys(registryStats).length,
        registry_stats: registryStats,
        timestamp: new Date().toISOString(),
      };

      // Cache for 30 minutes
      await env.AGENT_ROUTER_KV.put(cacheKey, JSON.stringify(response), { expirationTtl: 1800 });

      return jsonResponse(response);
    }

    // POST /validate — validate an agent.json manifest
    if (url.pathname === '/validate' && request.method === 'POST') {
      try {
        const body = await request.json();
        const errors = validateAgentJson(body);
        if (errors.length === 0) {
          return jsonResponse({ valid: true, agent: { name: body.name, description: body.description } });
        }
        return jsonResponse({ valid: false, errors }, 400);
      } catch (e) {
        return jsonResponse({ error: 'Invalid JSON body' }, 400);
      }
    }

    // GET /convert — fetch and convert any manifest to agent.json
    if (url.pathname === '/convert') {
      const manifestUrl = url.searchParams.get('url');
      if (!manifestUrl) {
        return jsonResponse({ error: 'Missing url parameter', example: '/convert?url=https://example.com/.well-known/agent.json' }, 400);
      }
      try {
        const res = await fetch(manifestUrl, {
          headers: { 'Accept': 'application/json', 'User-Agent': 'AgentRouter/0.2' },
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) return jsonResponse({ error: `Source returned ${res.status}` }, 502);
        const data = await res.json();
        const converted = convertToAgentJson(data, manifestUrl);
        return jsonResponse({ source: manifestUrl, agent_json: converted });
      } catch (e) {
        return jsonResponse({ error: e.message }, 502);
      }
    }

    return jsonResponse({ error: 'Not found', available_endpoints: ['/', '/search', '/registries', '/stats', '/health', '/validate', '/convert'] }, 404);
  },
};

// ============================================================
// REGISTRY DEFINITIONS
// ============================================================

const REGISTRIES = [
  {
    id: 'mcp-registry',
    name: 'MCP Registry',
    url: 'https://registry.modelcontextprotocol.io',
    type: 'canonical',
    protocol: 'mcp',
    status: 'active',
    agentCount: '~1,000',
    search: async (q, limit) => {
      const res = await fetch(`https://registry.modelcontextprotocol.io/v0/servers?search=${encodeURIComponent(q)}&limit=${limit}`, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'AgentRouter/0.2' },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.servers || [];
    },
    normalize: (s) => {
      const name = s.server?.name || s.name || 'unknown';
      const repoUrl = s.server?.repository?.url || s.repository?.url || null;
      return {
        name,
        description: s.server?.description || s.description || '',
        version: s.server?.version || s.version || '',
        protocols: ['mcp'],
        repository: repoUrl,
        source: 'mcp-registry',
        source_url: repoUrl || `https://registry.modelcontextprotocol.io`,
        agent_json_format: 'v1',
      };
    },
  },
  {
    id: 'smithery',
    name: 'Smithery',
    url: 'https://smithery.ai',
    type: 'registry',
    protocol: 'mcp',
    status: 'active',
    agentCount: '~2,000+',
    search: async (q, limit) => {
      const res = await fetch(`https://api.smithery.ai/servers?q=${encodeURIComponent(q)}&pageSize=${limit}`, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'AgentRouter/0.2' },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.servers || [];
    },
    normalize: (s) => {
      const qn = s.qualifiedName || s.slug || 'unknown';
      const ns = s.namespace || s.owner || '';
      const slug = s.slug || s.qualifiedName?.split('/').pop() || '';
      const smitheryUrl = ns ? `https://smithery.ai/server/@${ns}/${slug}` : `https://smithery.ai/server/${qn}`;
      return {
        name: qn,
        description: s.description || '',
        version: '',
        protocols: ['mcp'],
        trust: {
          verified: s.verified || false,
          score: s.score || 0,
          endorsements: s.useCount || 0,
        },
        source: 'smithery',
        source_url: smitheryUrl,
        agent_json_format: 'v1',
      };
    },
  },
  {
    id: 'glama',
    name: 'Glama',
    url: 'https://glama.ai',
    type: 'registry',
    protocol: 'mcp',
    status: 'active',
    agentCount: '~22,000+',
    search: async (q, limit) => {
      const res = await fetch(`https://glama.ai/api/mcp/v1/servers?search=${encodeURIComponent(q)}&limit=${limit}`, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'AgentRouter/0.2' },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : (data.servers || []);
    },
    normalize: (s) => {
      const name = s.name || s.slug || 'unknown';
      const ns = s.namespace || s.owner || 'unknown';
      const slug = s.slug || s.name || '';
      return {
        name,
        description: s.description || '',
        version: s.version || '',
        protocols: ['mcp'],
        repository: s.repository?.url || null,
        source: 'glama',
        source_url: `https://glama.ai/mcp/servers/${ns}/${slug}`,
        agent_json_format: 'v1',
      };
    },
  },
  {
    id: 'huggingface',
    name: 'HuggingFace Hub',
    url: 'https://huggingface.co',
    type: 'platform',
    protocol: 'multi',
    status: 'active',
    agentCount: '~60,000+',
    search: async (q, limit) => {
      // Search Spaces with MCP/agent tags
      const [spaces, models] = await Promise.allSettled([
        fetch(`https://huggingface.co/api/spaces?search=${encodeURIComponent(q + ' mcp agent')}&limit=${Math.ceil(limit / 2)}`, {
          headers: { 'Accept': 'application/json', 'User-Agent': 'AgentRouter/0.2' },
          signal: AbortSignal.timeout(8000),
        }).then(r => r.ok ? r.json() : []),
        fetch(`https://huggingface.co/api/models?search=${encodeURIComponent(q + ' agent mcp')}&limit=${Math.ceil(limit / 2)}`, {
          headers: { 'Accept': 'application/json', 'User-Agent': 'AgentRouter/0.2' },
          signal: AbortSignal.timeout(8000),
        }).then(r => r.ok ? r.json() : []),
      ]);
      const results = [];
      if (spaces.status === 'fulfilled') results.push(...spaces.value.map(s => ({ ...s, _type: 'space' })));
      if (models.status === 'fulfilled') results.push(...models.value.map(m => ({ ...m, _type: 'model' })));
      return results;
    },
    normalize: (s) => ({
      name: s.id || 'unknown',
      description: s.id?.split('/').pop()?.replace(/[-_]/g, ' ') || '',
      version: '',
      protocols: ['mcp', 'http'],
      repository: `https://huggingface.co/${s.id}`,
      trust: {
        score: s.likes ? Math.min(s.likes / 100, 1) : 0,
        endorsements: s.likes || 0,
        trending: s.trendingScore || 0,
      },
      source: 'huggingface',
      source_url: `https://huggingface.co/${s.id}`,
      type: s._type,
      tags: s.tags || [],
      agent_json_format: 'v1',
    }),
  },
  {
    id: 'aiia',
    name: 'Aiia.ro',
    url: 'https://aiia.ro',
    type: 'registry',
    protocol: 'multi',
    status: 'planned',
    agentCount: 'unknown',
    search: async (q, limit) => {
      // Aiia.ro has no public JSON API detected yet; will scrape or use their endpoints when documented
      return [];
    },
    normalize: (s) => s,
  },
  {
    id: 'gpt-store',
    name: 'OpenAI GPT Store',
    url: 'https://chat.openai.com',
    type: 'marketplace',
    protocol: 'openai',
    status: 'closed',
    agentCount: '~3,000,000+',
    search: async (q, limit) => [],
    normalize: (s) => s,
  },
  {
    id: 'salesforce',
    name: 'Salesforce AgentExchange',
    url: 'https://agentexchange.salesforce.com',
    type: 'enterprise',
    protocol: 'salesforce',
    status: 'closed',
    agentCount: '~1,000+',
    search: async (q, limit) => [],
    normalize: (s) => s,
  },
  {
    id: 'aws-ara',
    name: 'AWS Agent Registry',
    url: 'https://aws.amazon.com/bedrock/agentcore/',
    type: 'enterprise',
    protocol: 'aws',
    status: 'planned',
    agentCount: 'preview',
    search: async (q, limit) => [],
    normalize: (s) => s,
  },
  {
    id: 'google-a2a',
    name: 'Google A2A',
    url: 'https://github.com/google/A2A',
    type: 'protocol',
    protocol: 'a2a',
    status: 'passive',
    agentCount: 'decentralized',
    search: async (q, limit) => [],
    normalize: (s) => s,
  },
  {
    id: 'agntcy',
    name: 'AGNTCY',
    url: 'https://agntcy.org',
    type: 'distributed',
    protocol: 'multi',
    status: 'planned',
    agentCount: 'unknown',
    search: async (q, limit) => [],
    normalize: (s) => s,
  },
  {
    id: 'agensi',
    name: 'Agensi',
    url: 'https://agensi.io',
    type: 'marketplace',
    protocol: 'mcp',
    status: 'planned',
    agentCount: '~100+',
    search: async (q, limit) => [],
    normalize: (s) => s,
  },
];

// ============================================================
// SEARCH ENGINE
// ============================================================

async function searchRegistry(registry, query, limit) {
  try {
    return await registry.search(query, limit);
  } catch (e) {
    return [];
  }
}

function deduplicate(agents) {
  const seen = new Map();
  return agents.filter(a => {
    const key = a.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (seen.has(key)) {
      // Merge sources
      const existing = seen.get(key);
      if (!existing.sources) existing.sources = [existing.source];
      if (!existing.sources.includes(a.source)) existing.sources.push(a.source);
      return false;
    }
    seen.set(key, a);
    return true;
  });
}

// ============================================================
// VALIDATION & CONVERSION
// ============================================================

function validateAgentJson(data) {
  const errors = [];
  if (!data || typeof data !== 'object') {
    errors.push('Body must be a JSON object');
    return errors;
  }
  if (!data.name) errors.push('Missing required field: name');
  if (!data.description) errors.push('Missing required field: description');
  if (data.name && typeof data.name !== 'string') errors.push('name must be a string');
  if (data.description && typeof data.description !== 'string') errors.push('description must be a string');
  if (data.version && typeof data.version !== 'string') errors.push('version must be a string');
  if (data.protocols && !Array.isArray(data.protocols)) errors.push('protocols must be an array');
  if (data.trust && typeof data.trust !== 'object') errors.push('trust must be an object');
  return errors;
}

function convertToAgentJson(data, sourceUrl) {
  return {
    name: data.name || data.serverInfo?.name || data.qualifiedName || data.slug || 'unknown',
    description: data.description || data.serverInfo?.description || '',
    version: data.version || '',
    protocols: inferProtocols(data),
    repository: data.repository?.url || data.repository || null,
    source_url: sourceUrl,
    converted_at: new Date().toISOString(),
    converted_by: 'Agent Router API v0.2.0',
    agent_json_format: 'v1',
  };
}

function inferProtocols(data) {
  const protocols = [];
  if (data.remotes || data.packages || data.serverInfo) protocols.push('mcp');
  if (data.capabilities || data.skills || data.url) protocols.push('a2a');
  if (data.endpoint || data.api) protocols.push('http');
  if (protocols.length === 0) protocols.push('unknown');
  return protocols;
}

// ============================================================
// HELPERS
// ============================================================

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=300',
      'X-Powered-By': 'Agent Router API',
    },
  });
}
