// Agent Router API — Landing Page HTML
// Served when Accept: text/html

export function renderLandingPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Agent Router — Universal AI Agent Discovery</title>
<meta name="description" content="Search 104,000+ AI agents across all registries. One API, every agent.">
<meta property="og:title" content="Agent Router — Universal AI Agent Discovery Platform">
<meta property="og:description" content="Search across MCP Registry, Smithery, Glama, HuggingFace and more. Powered by agent.json.">
<meta property="og:url" content="https://agent-router.pickaxe.workers.dev">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔍</text></svg>">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#0a0a0a;--surface:#111;--surface2:#1a1a1a;--border:#222;--text:#e5e5e5;--text-dim:#888;--accent:#6366f1;--accent2:#818cf8;--green:#22c55e;--blue:#3b82f6;--orange:#f97316;--pink:#ec4899}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:var(--bg);color:var(--text);line-height:1.6;overflow-x:hidden}
a{color:var(--accent2);text-decoration:none}
a:hover{text-decoration:underline}
code{background:var(--surface2);padding:2px 6px;border-radius:4px;font-size:0.9em;font-family:'SF Mono',Monaco,Consolas,monospace}
pre{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:16px;overflow-x:auto;font-size:0.85em;line-height:1.5}
.container{max-width:1100px;margin:0 auto;padding:0 24px}

/* Nav */
nav{padding:16px 0;border-bottom:1px solid var(--border)}
nav .container{display:flex;justify-content:space-between;align-items:center}
.logo{font-size:1.2em;font-weight:700;display:flex;align-items:center;gap:8px}
.logo span{color:var(--accent2)}
.nav-links{display:flex;gap:24px;font-size:0.9em}
.nav-links a{color:var(--text-dim);text-decoration:none}
.nav-links a:hover{color:var(--text)}

/* Hero */
.hero{padding:80px 0 60px;text-align:center}
.hero h1{font-size:3em;font-weight:800;line-height:1.1;margin-bottom:16px;background:linear-gradient(135deg,#e5e5e5 0%,#6366f1 50%,#ec4899 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.hero p{font-size:1.2em;color:var(--text-dim);max-width:600px;margin:0 auto 32px}

/* Search */
.search-box{max-width:600px;margin:0 auto;position:relative}
.search-box input{width:100%;padding:16px 20px 16px 48px;border:1px solid var(--border);border-radius:12px;background:var(--surface);color:var(--text);font-size:1em;outline:none;transition:border-color 0.2s}
.search-box input:focus{border-color:var(--accent)}
.search-icon{position:absolute;left:16px;top:50%;transform:translateY(-50%);color:var(--text-dim);font-size:1.2em}
.search-results{margin-top:8px;background:var(--surface);border:1px solid var(--border);border-radius:12px;display:none;max-height:400px;overflow-y:auto;text-align:left}
.search-results.active{display:block}
.search-result{padding:12px 16px;border-bottom:1px solid var(--border);cursor:pointer}
.search-result:hover{background:var(--surface2)}
.search-result:last-child{border-bottom:none}
.search-result .name{font-weight:600;color:var(--text)}
.search-result .desc{font-size:0.85em;color:var(--text-dim);margin-top:2px}
.search-result .source{font-size:0.75em;color:var(--accent2);margin-top:4px}
.search-loading{text-align:center;padding:20px;color:var(--text-dim)}

/* Stats */
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin:48px 0;padding:32px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
.stat{text-align:center}
.stat .number{font-size:2em;font-weight:800;color:var(--accent2)}
.stat .label{font-size:0.85em;color:var(--text-dim);margin-top:4px}

/* Registries */
.section{padding:60px 0}
.section h2{font-size:1.8em;font-weight:700;margin-bottom:8px}
.section .subtitle{color:var(--text-dim);margin-bottom:32px}
.registries{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
.registry-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:20px;transition:border-color 0.2s}
.registry-card:hover{border-color:var(--accent)}
.registry-card .r-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.registry-card .r-name{font-weight:700;font-size:1.05em}
.registry-card .r-status{font-size:0.75em;padding:3px 8px;border-radius:20px;font-weight:600}
.r-status.active{background:#22c55e20;color:var(--green)}
.r-status.planned{background:#3b82f620;color:var(--blue)}
.r-status.closed{background:#f9731620;color:var(--orange)}
.registry-card .r-count{font-size:0.85em;color:var(--text-dim)}
.registry-card .r-url{font-size:0.8em;color:var(--text-dim)}

/* API */
.api-section pre{margin-bottom:16px}
.endpoint{margin-bottom:24px}
.endpoint .method{display:inline-block;font-size:0.8em;font-weight:700;padding:3px 8px;border-radius:4px;margin-right:8px;min-width:40px;text-align:center}
.method.get{background:#22c55e20;color:var(--green)}
.method.post{background:#6366f120;color:var(--accent2)}

/* CTA */
.cta{text-align:center;padding:60px 0}
.cta h2{font-size:2em;font-weight:700;margin-bottom:12px}
.cta p{color:var(--text-dim);margin-bottom:24px}
.cta-buttons{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
.btn{padding:12px 24px;border-radius:8px;font-weight:600;font-size:0.95em;cursor:pointer;border:none;transition:transform 0.1s}
.btn:hover{transform:translateY(-1px)}
.btn-primary{background:var(--accent);color:white}
.btn-secondary{background:var(--surface);color:var(--text);border:1px solid var(--border)}

footer{border-top:1px solid var(--border);padding:24px 0;text-align:center;color:var(--text-dim);font-size:0.85em}

.usecases{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.uc-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:20px;transition:border-color 0.2s}
.uc-card:hover{border-color:var(--accent)}
.uc-icon{font-size:1.8em;margin-bottom:8px}
.uc-title{font-weight:700;font-size:1.05em;margin-bottom:6px}
.uc-desc{font-size:0.9em;color:var(--text-dim);line-height:1.5}
@media(max-width:768px){.usecases{grid-template-columns:1fr}}

@media(max-width:768px){
  .hero h1{font-size:2em}
  .stats{grid-template-columns:repeat(2,1fr)}
  .registries{grid-template-columns:1fr}
  .nav-links{display:none}
}
</style>
</head>
<body>
<nav>
  <div class="container">
    <div class="logo">🔍 Agent <span>Router</span></div>
    <div class="nav-links">
      <a href="#usecases">Use Cases</a>
      <a href="#registries">Registries</a>
      <a href="#api">API Docs</a>
      <a href="https://github.com/HOTAgithub/agent-json" target="_blank">GitHub</a>
      <a href="https://datatracker.ietf.org/doc/draft-hori-agent-quality-graph/" target="_blank">IETF Draft</a>
    </div>
  </div>
</nav>

<div class="container">
  <section class="hero">
    <h1>Search Every AI Agent.<br>One API.</h1>
    <p>Universal discovery across MCP Registry, Smithery, Glama, HuggingFace and more. Powered by agent.json and the Agent Quality Graph.</p>
    <div class="search-box">
      <span class="search-icon">🔍</span>
      <input type="text" id="searchInput" placeholder="Search agents (e.g. github, file search, database...)" autocomplete="off">
      <div class="search-results" id="searchResults"></div>
    </div>
  </section>

  <section class="stats">
    <div class="stat"><div class="number">104K+</div><div class="label">AI Agents Indexed</div></div>
    <div class="stat"><div class="number">11</div><div class="label">Registries Connected</div></div>
    <div class="stat"><div class="number">4</div><div class="label">Active APIs</div></div>
    <div class="stat"><div class="number">3</div><div class="label">Protocols Supported</div></div>
  </section>

  <section class="section" id="registries">
    <h2>Connected Registries</h2>
    <p class="subtitle">Search across the entire agent ecosystem from a single endpoint</p>
    <div class="registries">
      <div class="registry-card"><div class="r-header"><span class="r-name">MCP Registry</span><span class="r-status active">Active</span></div><div class="r-count">~1,000 servers</div><div class="r-url">registry.modelcontextprotocol.io</div></div>
      <div class="registry-card"><div class="r-header"><span class="r-name">Smithery</span><span class="r-status active">Active</span></div><div class="r-count">~2,000+ servers</div><div class="r-url">smithery.ai</div></div>
      <div class="registry-card"><div class="r-header"><span class="r-name">Glama</span><span class="r-status active">Active</span></div><div class="r-count">~22,000+ servers</div><div class="r-url">glama.ai</div></div>
      <div class="registry-card"><div class="r-header"><span class="r-name">HuggingFace Hub</span><span class="r-status active">Active</span></div><div class="r-count">~60,000+ models & spaces</div><div class="r-url">huggingface.co</div></div>
      <div class="registry-card"><div class="r-header"><span class="r-name">OpenAI GPT Store</span><span class="r-status closed">Closed</span></div><div class="r-count">~3,000,000+ GPTs</div><div class="r-url">No public API (coming soon)</div></div>
      <div class="registry-card"><div class="r-header"><span class="r-name">Google A2A</span><span class="r-status planned">Passive</span></div><div class="r-count">Decentralized</div><div class="r-url">/.well-known/agent-card.json</div></div>
      <div class="registry-card"><div class="r-header"><span class="r-name">AWS Agent Registry</span><span class="r-status planned">Planned</span></div><div class="r-count">Preview</div><div class="r-url">Amazon Bedrock AgentCore</div></div>
      <div class="registry-card"><div class="r-header"><span class="r-name">Salesforce AgentExchange</span><span class="r-status closed">Closed</span></div><div class="r-count">~1,000+ agents</div><div class="r-url">Enterprise only</div></div>
    </div>
  </section>

  <section class="section" id="api">
    <h2>API Documentation</h2>
    <p class="subtitle">Free. No API key required. CORS enabled.</p>

    <div class="endpoint">
      <span class="method get">GET</span><code>/search?q={query}&limit={n}</code>
      <pre>curl 'https://agent-router.pickaxe.workers.dev/search?q=github&limit=5'

{
  "query": "github",
  "total": 30,
  "results": [
    {
      "name": "github",
      "description": "Connect your AI agents to GitHub...",
      "protocols": ["mcp"],
      "source": "smithery",
      "source_url": "https://smithery.ai/server/github"
    }
  ],
  "registries_searched": 4
}</pre>
    </div>

    <div class="endpoint">
      <span class="method get">GET</span><code>/registries</code>
      <pre>curl 'https://agent-router.pickaxe.workers.dev/registries'</pre>
    </div>

    <div class="endpoint">
      <span class="method get">GET</span><code>/convert?url={manifest_url}</code>
      <pre>curl 'https://agent-router.pickaxe.workers.dev/convert?url=https://example.com/.well-known/agent.json'
// Converts any format to agent.json automatically</pre>
    </div>

    <div class="endpoint">
      <span class="method post">POST</span><code>/validate</code>
      <pre>curl -X POST 'https://agent-router.pickaxe.workers.dev/validate' \\
  -H 'Content-Type: application/json' \\
  -d '{"name":"my-agent","description":"Does things"}'

// Returns: {"valid": true, ...}</pre>
    </div>
  </section>

  <section class="section" id="usecases">
    <h2>What Can You Do With This?</h2>
    <p class="subtitle">Real use cases for developers, teams, and platforms</p>
    <div class="usecases">
      <div class="uc-card">
        <div class="uc-icon">🔎</div>
        <div class="uc-title">Find any AI tool in one place</div>
        <div class="uc-desc">Imagine you need a tool that reads Gmail. Instead of searching 10 different websites one by one, type "email" here and see every option at once. Like Google, but for AI tools.</div>
      </div>
      <div class="uc-card">
        <div class="uc-icon">🔄</div>
        <div class="uc-title">One format works everywhere</div>
        <div class="uc-desc">You made an AI tool for one platform. Now you want it on another. Instead of rewriting everything, just click convert. Same tool, everywhere. Like a universal plug adapter.</div>
      </div>
      <div class="uc-card">
        <div class="uc-icon">📊</div>
        <div class="uc-title">Pick the best tool, not the first one</div>
        <div class="uc-desc">5 tools do the same thing. Which one is best? See how many people use each one, which ones are trusted, which ones are fake. Like Amazon reviews, but for AI tools.</div>
      </div>
      <div class="uc-card">
        <div class="uc-icon">🏗️</div>
        <div class="uc-title">Build your own AI app store</div>
        <div class="uc-desc">Want to make a website or app that lists AI tools? Use our search for free. No signup needed. Just connect and go. Like building a store and getting all products for free.</div>
      </div>
      <div class="uc-card">
        <div class="uc-icon">✅</div>
        <div class="uc-title">Check your work before publishing</div>
        <div class="uc-desc">Made an AI tool? Check it here first. We tell you if something is wrong or missing. Like a spell checker, but for AI tools. Fix errors before anyone sees them.</div>
      </div>
      <div class="uc-card">
        <div class="uc-icon">🔌</div>
        <div class="uc-title">See what AI can do for you</div>
        <div class="uc-desc">New to AI tools? Just type what you want. "Read files", "Send emails", "Search the web" — over 100,000 tools already exist. There's a tool for almost everything.</div>
      </div>
    </div>
  </section>

  <section class="cta">
    <h2>Build the Agent Ecosystem</h2>
    <p>agent.json is the universal manifest format. AQG is the trust layer. Agent Router connects them all.</p>
    <div class="cta-buttons">
      <a href="https://github.com/HOTAgithub/agent-json" target="_blank" class="btn btn-primary">View on GitHub</a>
      <a href="https://datatracker.ietf.org/doc/draft-hori-agent-quality-graph/" target="_blank" class="btn btn-secondary">IETF Draft</a>
      <a href="https://github.com/modelcontextprotocol/registry/discussions/1239" target="_blank" class="btn btn-secondary">MCP Discussion #1239</a>
    </div>
  </section>
</div>

<footer>
  <div class="container">
    Agent Router API v0.2.0 · Built by Takayuki Hori · IETF Draft: draft-hori-agent-quality-graph · <a href="https://github.com/HOTAgithub/agent-json">GitHub</a>
  </div>
</footer>

<script>
const input = document.getElementById('searchInput');
const results = document.getElementById('searchResults');
let timeout;

input.addEventListener('input', () => {
  clearTimeout(timeout);
  const q = input.value.trim();
  if (q.length < 2) { results.classList.remove('active'); return; }
  results.innerHTML = '<div class="search-loading">Searching 4 registries...</div>';
  results.classList.add('active');
  timeout = setTimeout(async () => {
    try {
      const res = await fetch('/search?q=' + encodeURIComponent(q) + '&limit=8');
      const data = await res.json();
      if (!data.results || data.results.length === 0) {
        results.innerHTML = '<div class="search-loading">No agents found</div>';
        return;
      }
      results.innerHTML = data.results.map(r =>
        '<a href="' + (r.source_url || '#') + '" target="_blank" class="search-result">' +
        '<div class="name">' + esc(r.name) + '</div>' +
        '<div class="desc">' + esc((r.description || '').substring(0, 100)) + '</div>' +
        '<div class="source">' + r.source + (r.trust ? ' · score: ' + (r.trust.score || 0).toFixed(2) : '') + '</div>' +
        '</a>'
      ).join('');
    } catch(e) {
      results.innerHTML = '<div class="search-loading">Error: ' + e.message + '</div>';
    }
  }, 300);
});

function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
</script>
</body>
</html>`;
}
