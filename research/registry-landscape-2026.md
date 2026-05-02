# AI Agent Registry & Marketplace Landscape — Comprehensive Research Report
**Date:** May 3, 2026 | **Purpose:** Agent Router unified search API design

---

## 1. Agent Registries & Marketplaces

### 1.1 Smithery (`smithery.ai`)
- **Type:** MCP Server Registry (largest catalog)
- **API:** `GET https://api.smithery.ai/servers` (public, Bearer token optional)
- **Schema:** qualifiedName, namespace, slug, displayName, description, iconUrl, verified, useCount, remote, isDeployed, createdAt, score
- **Search:** Full-text + semantic via `q` param
- **Count:** ~2,000+ MCP servers
- **Interop:** MCP-only

### 1.2 Official MCP Registry (`registry.modelcontextprotocol.io`)
- **Type:** Canonical MCP Server Registry (Anthropic-backed)
- **API:** `GET /v0/servers` (public, no auth)
- **Schema:** server.json with name, description, repository, version, packages[]
- **Search:** Basic keyword, cursor pagination
- **Count:** ~500-1,000 servers
- **Interop:** MCP-only, GitHub OAuth for publishing

### 1.3 Glama (`glama.ai`)
- **Type:** MCP Registry superset + Inspector + Gateway
- **API:** `GET /api/mcp/v1/servers` (public, no auth)
- **Special:** Tool-level indexing (25,329+ tools across 1,787+ servers)
- **Interop:** Superset of official + Smithery + npm + GitHub

### 1.4 Hugging Face Hub
- **Type:** Open infrastructure for models, datasets, Spaces, agents
- **API:** Full Hub API (public)
- **Schema:** agent.json (Tiny Agents) + AGENTS.md
- **Count:** 60,000+ repos use AGENTS.md; hundreds of agent Spaces
- **Interop:** MCP-native

### 1.5 OpenAI GPT Store
- **Type:** Closed/proprietary (inside ChatGPT)
- **API:** NO public API
- **Count:** ~3 million+ GPTs
- **Interop:** None (walled garden)

### 1.6 Anthropic Claude Skills
- **Type:** First-party skills directory
- **API:** Upload only (POST /v1/skills); no public browsing
- **Schema:** SKILL.md (YAML frontmatter + Markdown)
- **Interop:** SKILL.md works across 14+ platforms

### 1.7 Salesforce AgentExchange
- **Type:** Enterprise marketplace (Agentforce)
- **API:** NO public API (console only)
- **Count:** 200+ partners, 1,000+ agents
- **Interop:** Salesforce-proprietary

### 1.8 Aiia.ro
- **Type:** General agent registry + trust layer
- **API:** 20+ endpoints (public, no auth)
- **Schema:** ai-agent.json at `/.well-known/ai-agent.json`
- **Special:** Trust scores, encrypted messaging, job board
- **Interop:** Open spec, cross-protocol aim

### 1.9 Agensi (`agensi.io`)
- **Type:** Curated marketplace (SKILL.md + MCP servers)
- **Revenue:** 80/20 split, $9/month Pro
- **Interop:** Only platform covering both SKILL.md AND MCP

### 1.10 AWS Agent Registry (ARA)
- **Type:** Enterprise (Bedrock AgentCore)
- **Schema:** ara.json (6 package types)
- **Status:** Preview (April 2026)

### 1.11 Google A2A Agent Cards
- **Discovery:** `/.well-known/agent-card.json`
- **Schema:** name, description, url, provider, version, capabilities, skills[], authentication
- **Governance:** Linux Foundation
- **No central registry** — decentralized only

### 1.12 AGNTCY Agent Directory
- **Type:** Distributed directory (Cisco-backed, IETF)
- **Architecture:** IPFS Kademlia DHT, OCI, Sigstore
- **Interop:** Supports A2A + MCP

### 1.13 Microsoft Entra Agent ID
- **Type:** Enterprise identity + registry
- **Azure portal; agent card mapping**

---

## 2. Agent Description Formats

| Format | Steward | Required Fields | Discovery URI | Purpose |
|--------|---------|----------------|---------------|---------|
| server.json | MCP/Anthropic | 4+ | registry URL | MCP server descriptor |
| Agent Card | A2A/Google | 7+ | `/.well-known/agent-card.json` | Agent-to-agent discovery |
| ai-agent.json | Aiia.ro | 2 | `/.well-known/ai-agent.json` | Minimal agent manifest |
| AGENTS.md | OpenAI/Linux Foundation | None | In-repo file | Coding context for agents |
| SKILL.md | Open standard | name+description | In-directory | Agent skill definition |
| ara.json | AWS | 6 package types | AWS registry | Agent artifact packaging |
| agent.json | HuggingFace | model+servers | HF Hub | Tiny Agents config |

---

## 3. Fragmentation Points

### 3.1 No Common Identity
- MCP: `io.github.user/server`
- A2A: URL-based
- Aiia: domain-based
- Salesforce: proprietary
- No cross-registry identity linking

### 3.2 Incompatible Schemas
- Different required fields (2 to 7+)
- Different skill/tool representations
- Different auth models
- Different trust signals

### 3.3 Different Search APIs
- Smithery: semantic+full-text
- MCP Registry: keyword only
- Glama: tool-level search
- GPT Store/Salesforce: NO API
- A2A: NO central registry

### 3.4 No Capability Verification
- All agents self-report
- No independent testing
- 46% duplicates on HF

### 3.5 Scope Mismatch
- MCP servers (tools) vs agents (autonomous) vs skills (SKILL.md) vs GPTs
- Unified search must normalize across all definitions

---

## 4. Strategic Map for Agent Router

### Integrable Registries (Public API)
| Priority | Registry | Auth | Coverage |
|----------|----------|------|----------|
| 1 | MCP Registry | None | Canonical MCP |
| 2 | Smithery | API key | Largest MCP |
| 3 | Glama | None | Superset + tools |
| 4 | Aiia.ro | None | Agent identity + trust |
| 5 | HuggingFace | None | OSS agents |
| 6 | AGNTCY | gRPC+REST | Distributed |

### NOT Integrable (No API)
- GPT Store (closed)
- Salesforce (enterprise only)
- Claude Skills (no directory)
- Replit (internal)

---

## 5. Recommended agent.json Universal Schema

```json
{
  "$schema": "https://agent-json.dev/schema/v1",
  "name": "required",
  "description": "required",
  "version": "semver",
  "url": "primary endpoint",
  "provider": { "organization": "", "url": "", "contact": "" },
  "capabilities": ["tag1", "tag2"],
  "protocols": ["mcp", "a2a", "http-rest"],
  "endpoints": { "api": "", "docs": "", "health": "" },
  "authentication": { "type": "", "schemes": [] },
  "trust": { "verified": false, "score": 0.0, "endorsements": [] },
  "tools": [{ "name": "", "description": "", "url": "" }],
  "skills": [{ "id": "", "name": "", "description": "", "tags": [] }],
  "transport": { "type": "stdio|sse|streamable-http" },
  "packages": [{ "registryType": "", "identifier": "", "version": "" }],
  "metadata": {}
}
```

Well-Known URI: `/.well-known/agent.json`
