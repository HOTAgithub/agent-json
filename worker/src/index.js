// Agent Router API — Cloudflare Worker
// Unified search across AI agent registries
// Phase 1: MCP Registry + Smithery + Glama

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Routes
    if (url.pathname === '/' || url.pathname === '') {
      return jsonResponse({
        name: 'Agent Router API',
        version: '0.1.0',
        description: 'Unified search across AI agent registries',
        endpoints: {
          search: '/search?q={query}&limit={n}',
          agent: '/agent/{name}',
          registries: '/registries',
          stats: '/stats',
        },
        docs: 'https://github.com/HOTAgithub/agent-json',
      });
    }

    if (url.pathname === '/registries') {
      return jsonResponse({
        registries: [
          { name: 'MCP Registry', url: 'https://registry.modelcontextprotocol.io', status: 'active' },
          { name: 'Smithery', url: 'https://smithery.ai', status: 'active' },
          { name: 'Glama', url: 'https://glama.ai', status: 'active' },
          { name: 'Aiia.ro', url: 'https://aiia.ro', status: 'active' },
          { name: 'HuggingFace Hub', url: 'https://huggingface.co', status: 'planned' },
        ],
      });
    }

    if (url.pathname === '/stats') {
      const cached = await env.AGENT_ROUTER_KV.get('stats', 'json');
      if (cached) return jsonResponse(cached);
      return jsonResponse({ total_agents: 0, registries: 5, last_updated: null, note: 'Stats being populated' });
    }

    if (url.pathname === '/search') {
      const query = url.searchParams.get('q') || '';
      const limit = parseInt(url.searchParams.get('limit') || '20');

      if (!query) {
        return jsonResponse({ error: 'Missing query parameter "q"' }, 400);
      }

      // Check cache first
      const cacheKey = `search:${query}:${limit}`;
      const cached = await env.AGENT_ROUTER_KV.get(cacheKey, 'json');
      if (cached) {
        return jsonResponse({ ...cached, cached: true });
      }

      // Search across registries in parallel
      const results = await Promise.allSettled([
        searchMCPRegistry(query, limit),
        searchSmithery(query, limit),
        searchGlama(query, limit),
      ]);

      const agents = [];

      // Process MCP Registry results
      if (results[0].status === 'fulfilled' && results[0].value) {
        for (const server of results[0].value) {
          agents.push(normalizeMCPRegistry(server));
        }
      }

      // Process Smithery results
      if (results[1].status === 'fulfilled' && results[1].value) {
        for (const server of results[1].value) {
          agents.push(normalizeSmithery(server));
        }
      }

      // Process Glama results
      if (results[2].status === 'fulfilled' && results[2].value) {
        for (const server of results[2].value) {
          agents.push(normalizeGlama(server));
        }
      }

      // Deduplicate by name (case-insensitive)
      const seen = new Set();
      const unique = agents.filter(a => {
        const key = a.name.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // Sort by relevance (simple: name match first, then description match)
      const q = query.toLowerCase();
      unique.sort((a, b) => {
        const aName = a.name.toLowerCase().includes(q) ? 1 : 0;
        const bName = b.name.toLowerCase().includes(q) ? 1 : 0;
        if (aName !== bName) return bName - aName;
        const aDesc = (a.description || '').toLowerCase().includes(q) ? 1 : 0;
        const bDesc = (b.description || '').toLowerCase().includes(q) ? 1 : 0;
        return bDesc - aDesc;
      });

      const response = {
        query,
        total: unique.length,
        limit,
        results: unique.slice(0, limit),
        registries_searched: results.filter(r => r.status === 'fulfilled').length,
      };

      // Cache for 1 hour
      await env.AGENT_ROUTER_KV.put(cacheKey, JSON.stringify(response), { expirationTtl: 3600 });

      return jsonResponse(response);
    }

    return jsonResponse({ error: 'Not found' }, 404);
  },
};

// --- Registry Fetchers ---

async function searchMCPRegistry(query, limit) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`https://registry.modelcontextprotocol.io/v0/servers?search=${encodeURIComponent(query)}&limit=${limit}`, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'AgentRouter/0.1' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) return [];
    const data = await res.json();
    return data.servers || data || [];
  } catch (e) {
    return [];
  }
}

async function searchSmithery(query, limit) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`https://api.smithery.ai/servers?q=${encodeURIComponent(query)}&pageSize=${limit}`, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'AgentRouter/0.1' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) return [];
    const data = await res.json();
    return data.servers || [];
  } catch (e) {
    return [];
  }
}

async function searchGlama(query, limit) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`https://glama.ai/api/mcp/v1/servers?search=${encodeURIComponent(query)}&limit=${limit}`, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'AgentRouter/0.1' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data.servers || []);
  } catch (e) {
    return [];
  }
}

// --- Normalizers (convert to agent.json format) ---

function normalizeMCPRegistry(server) {
  return {
    name: server.name || 'unknown',
    description: server.description || '',
    version: server.version || '',
    protocols: ['mcp'],
    repository: server.repository || null,
    source: 'mcp-registry',
    source_url: `https://registry.modelcontextprotocol.io/v0/servers/${server.name}`,
  };
}

function normalizeSmithery(server) {
  return {
    name: server.qualifiedName || server.slug || 'unknown',
    description: server.description || '',
    version: '',
    protocols: ['mcp'],
    trust: {
      verified: server.verified || false,
      score: server.score || 0,
      endorsements: server.useCount || 0,
    },
    source: 'smithery',
    source_url: `https://smithery.ai/server/${server.qualifiedName || server.slug}`,
  };
}

function normalizeGlama(server) {
  return {
    name: server.name || server.slug || 'unknown',
    description: server.description || '',
    version: server.version || '',
    protocols: ['mcp'],
    source: 'glama',
    source_url: `https://glama.ai/mcp/servers/${server.owner || 'unknown'}/${server.slug || server.name}`,
  };
}

// --- Helpers ---

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
