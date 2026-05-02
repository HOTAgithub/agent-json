# agent.json

> The package.json for AI Agents — a universal manifest format.

[![Specification](https://img.shields.io/badge/spec-v0.1-draft-blue)](./spec/agent-json-spec-v0.1.md)
[![License](https://img.shields.io/badge/license-Apache--2.0-green)](./LICENSE)

## The Problem

As of May 2026:
- **104,000+** AI agents exist across **15+** registries
- **Zero interoperability** between registries
- **7 different** agent description formats (MCP server.json, A2A Agent Card, ai-agent.json, etc.)
- **46%** of listed agents are duplicates or near-duplicates
- No standard way to evaluate agent quality

## The Solution

**agent.json** is a universal, machine-readable manifest that unifies all existing agent description formats into one schema.

### Minimal (2 required fields)

```json
{
  "name": "my-agent",
  "description": "What it does"
}
```

### Full Example

```json
{
  "name": "travel-planner",
  "description": "Plans travel itineraries across multiple providers",
  "version": "1.2.0",
  "url": "https://travel-planner.example.com",
  "provider": { "organization": "TravelTech Inc." },
  "protocols": ["a2a", "http-rest"],
  "capabilities": ["booking", "scheduling"],
  "skills": [{
    "id": "plan-trip",
    "name": "Plan Trip",
    "description": "Creates a complete travel itinerary",
    "tags": ["travel", "planning"]
  }],
  "endpoints": {
    "api": "https://api.travel-planner.example.com",
    "health": "https://api.travel-planner.example.com/health"
  },
  "authentication": { "type": "oauth2" },
  "trust": {
    "verified": true,
    "score": 0.92,
    "source": "agent-router.dev"
  },
  "tests": {
    "status": "passed",
    "pass_rate": 0.94,
    "latency_ms": 230
  },
  "license": "Apache-2.0"
}
```

## Why agent.json?

| Feature | agent.json | MCP server.json | A2A Agent Card | ai-agent.json |
|---------|-----------|-----------------|----------------|---------------|
| Required fields | **2** | 4+ | 7+ | 2 |
| Multi-protocol | ✅ | MCP only | A2A only | ✅ |
| Trust scoring | ✅ | ❌ | ❌ | Basic |
| Test results | ✅ | ❌ | ❌ | ❌ |
| Well-known URI | ✅ | ❌ | ✅ | ✅ |
| Skills + Tools | ✅ | Tools | Skills | Tools |

## Well-Known URI

Serve at `/.well-known/agent.json` on your agent's domain:

```
https://your-agent.example.com/.well-known/agent.json
```

## Quick Start

### 1. Create your agent.json

Use our [JSON Schema](./schema/agent-json-schema.json) for validation.

### 2. Host it

Place `agent.json` at `/.well-known/agent.json` on your agent's domain.

### 3. Register

Submit to any agent.json-compatible registry.

## Repository Structure

```
agent-json/
├── README.md
├── spec/
│   └── agent-json-spec-v0.1.md      # Full specification
├── schema/
│   └── agent-json-schema.json        # JSON Schema for validation
├── examples/
│   ├── minimal.json                  # Minimal agent
│   ├── mcp-server.json              # MCP server agent
│   ├── a2a-agent.json               # A2A agent
│   └── full.json                    # Full-featured agent
├── converters/
│   ├── mcp-to-agent-json.js          # MCP server.json → agent.json
│   ├── a2a-to-agent-json.js          # A2A Agent Card → agent.json
│   └── aiia-to-agent-json.js         # ai-agent.json → agent.json
└── LICENSE
```

## Related Projects

- **Agent Router** — Unified search API across all agent registries (coming soon)
- **Agent Quality Graph (AQG)** — Trust scoring via delegation graphs ([IETF Draft](./ietf/draft-hori-agent-quality-graph-00.xml))
- **Agent Test Runner** — Automated quality verification for agents (coming soon)

## Contributing

Contributions welcome! Open an issue or PR.

## License

Apache 2.0 — Free to use, modify, and distribute.

---

*Built with the pickaxe principle: sell tools to gold miners.*
