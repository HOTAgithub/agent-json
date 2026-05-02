# agent.json Specification v0.1

**Status:** Draft
**Authors:** Takayuki Hori
**Created:** 2026-05-03
**License:** Apache 2.0

---

## 1. Abstract

agent.json is a universal, machine-readable manifest file for describing AI agents. It provides a common format that unifies existing agent description formats (MCP server.json, A2A Agent Card, ai-agent.json, ara.json, SKILL.md metadata) into a single, interoperable schema.

**Problem:** As of May 2026, 104,000+ AI agents are spread across 15+ registries with zero interoperability. Each registry uses a different metadata schema, different identity scheme, and different discovery mechanism. There is no "package.json for agents."

**Solution:** agent.json provides:
- A minimal required schema (2 fields) for maximum adoption
- A recommended schema for rich agent descriptions
- Well-known URI convention (`/.well-known/agent.json`) for decentralized discovery
- Protocol-agnostic design (works with MCP, A2A, HTTP, gRPC)
- Extensible via `metadata` field

---

## 2. Design Principles

1. **Minimalism first** — Only 2 required fields (like ai-agent.json). Complexity kills adoption.
2. **Superset, not competitor** — Includes all fields from existing formats. Any agent.json can be losslessly converted to/from server.json, Agent Card, or ai-agent.json.
3. **Well-known URI** — Served at `/.well-known/agent.json` following RFC 8615 convention (same pattern as A2A Agent Cards and ai-agent.json).
4. **Protocol-agnostic** — Works with MCP, A2A, HTTP REST, gRPC, or any future protocol.
5. **Trust-native** — Built-in trust scoring fields (unlike any existing format).
6. **Test-native** — Built-in test result fields for automated quality verification.

---

## 3. Schema Definition

### 3.1 JSON Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://agent-json.dev/schema/v0.1",
  "title": "Agent Manifest",
  "description": "Universal agent description format",
  "type": "object",
  "required": ["name", "description"],
  "properties": {
    "name": {
      "type": "string",
      "description": "Unique agent identifier. Use kebab-case.",
      "pattern": "^[a-z0-9][a-z0-9-]*[a-z0-9]$",
      "minLength": 1,
      "maxLength": 128
    },
    "description": {
      "type": "string",
      "description": "Human-readable description of what this agent does",
      "minLength": 1,
      "maxLength": 2048
    },

    "version": {
      "type": "string",
      "description": "Semantic version (semver)",
      "pattern": "^[0-9]+\\.[0-9]+\\.[0-9]+"
    },

    "url": {
      "type": "string",
      "format": "uri",
      "description": "Primary endpoint URL for this agent"
    },

    "provider": {
      "type": "object",
      "description": "Organization or individual providing this agent",
      "properties": {
        "organization": { "type": "string" },
        "url": { "type": "string", "format": "uri" },
        "contact": { "type": "string", "format": "email" }
      }
    },

    "protocols": {
      "type": "array",
      "description": "Communication protocols this agent supports",
      "items": {
        "type": "string",
        "enum": ["mcp", "a2a", "http-rest", "grpc", "websocket", "stdio"]
      },
      "uniqueItems": true
    },

    "capabilities": {
      "type": "array",
      "description": "Functional capability tags",
      "items": { "type": "string" },
      "uniqueItems": true
    },

    "skills": {
      "type": "array",
      "description": "Detailed skill descriptions (maps to A2A Agent Card skills)",
      "items": {
        "type": "object",
        "required": ["name", "description"],
        "properties": {
          "id": { "type": "string" },
          "name": { "type": "string" },
          "description": { "type": "string" },
          "tags": {
            "type": "array",
            "items": { "type": "string" }
          },
          "examples": {
            "type": "array",
            "items": { "type": "string" }
          },
          "inputModes": {
            "type": "array",
            "items": { "type": "string" }
          },
          "outputModes": {
            "type": "array",
            "items": { "type": "string" }
          }
        }
      }
    },

    "tools": {
      "type": "array",
      "description": "Tools this agent exposes (maps to MCP tools)",
      "items": {
        "type": "object",
        "required": ["name", "description"],
        "properties": {
          "name": { "type": "string" },
          "description": { "type": "string" },
          "url": { "type": "string", "format": "uri" },
          "free": { "type": "boolean", "default": true }
        }
      }
    },

    "endpoints": {
      "type": "object",
      "description": "Agent endpoint URLs",
      "properties": {
        "api": { "type": "string", "format": "uri" },
        "docs": { "type": "string", "format": "uri" },
        "health": { "type": "string", "format": "uri" },
        "mcp": { "type": "string", "format": "uri" },
        "a2a": { "type": "string", "format": "uri" }
      }
    },

    "transport": {
      "type": "object",
      "description": "Transport configuration (maps to MCP server.json transport)",
      "properties": {
        "type": {
          "type": "string",
          "enum": ["stdio", "sse", "streamable-http", "grpc", "websocket"]
        },
        "port": { "type": "integer" },
        "path": { "type": "string" }
      }
    },

    "authentication": {
      "type": "object",
      "description": "Authentication requirements",
      "properties": {
        "type": {
          "type": "string",
          "enum": ["none", "bearer", "api-key", "oauth2", "mtls", "custom"]
        },
        "schemes": {
          "type": "array",
          "items": { "type": "string" }
        },
        "instructions": { "type": "string" }
      }
    },

    "packages": {
      "type": "array",
      "description": "Installation packages (maps to MCP server.json packages)",
      "items": {
        "type": "object",
        "properties": {
          "registryType": {
            "type": "string",
            "enum": ["npm", "pypi", "oci", "docker", "github"]
          },
          "registryBaseUrl": { "type": "string", "format": "uri" },
          "identifier": { "type": "string" },
          "version": { "type": "string" }
        }
      }
    },

    "trust": {
      "type": "object",
      "description": "Trust and quality signals",
      "properties": {
        "verified": { "type": "boolean", "default": false },
        "score": {
          "type": "number",
          "minimum": 0,
          "maximum": 1,
          "description": "Aggregate trust score (0.0-1.0)"
        },
        "endorsements": {
          "type": "integer",
          "description": "Number of endorsements from other agents/users"
        },
        "uptime": {
          "type": "string",
          "description": "Uptime percentage (e.g. '99.9%')"
        },
        "source": {
          "type": "string",
          "description": "Trust score provider (e.g. 'agent-router.dev')"
        }
      }
    },

    "tests": {
      "type": "object",
      "description": "Automated test results",
      "properties": {
        "status": {
          "type": "string",
          "enum": ["passed", "partial", "failed", "untested"],
          "default": "untested"
        },
        "pass_rate": {
          "type": "number",
          "minimum": 0,
          "maximum": 1
        },
        "latency_ms": {
          "type": "number",
          "description": "Average response latency in milliseconds"
        },
        "tested_at": {
          "type": "string",
          "format": "date-time"
        },
        "report_url": {
          "type": "string",
          "format": "uri"
        }
      }
    },

    "repository": {
      "type": "object",
      "description": "Source code repository",
      "properties": {
        "url": { "type": "string", "format": "uri" },
        "source": {
          "type": "string",
          "enum": ["github", "gitlab", "bitbucket", "other"]
        }
      }
    },

    "license": {
      "type": "string",
      "description": "SPDX license identifier (e.g. 'Apache-2.0', 'MIT')"
    },

    "metadata": {
      "type": "object",
      "description": "Extensible metadata (any key-value pairs)",
      "additionalProperties": true
    }
  }
}
```

---

## 4. Examples

### 4.1 Minimal (Required fields only)

```json
{
  "name": "travel-planner",
  "description": "Plans travel itineraries by coordinating flight, hotel, and activity bookings"
}
```

### 4.2 Recommended (Rich description)

```json
{
  "name": "travel-planner",
  "description": "Plans travel itineraries by coordinating flight, hotel, and activity bookings across multiple providers",
  "version": "1.2.0",
  "url": "https://travel-planner.example.com",
  "provider": {
    "organization": "TravelTech Inc.",
    "url": "https://traveltech.example.com",
    "contact": "agents@traveltech.example.com"
  },
  "protocols": ["a2a", "http-rest"],
  "capabilities": ["booking", "scheduling", "price-comparison"],
  "skills": [
    {
      "id": "plan-trip",
      "name": "Plan Trip",
      "description": "Creates a complete travel itinerary",
      "tags": ["travel", "planning"],
      "examples": ["Plan a 5-day trip to Tokyo for 2 people"]
    }
  ],
  "endpoints": {
    "api": "https://api.travel-planner.example.com",
    "docs": "https://docs.travel-planner.example.com",
    "health": "https://api.travel-planner.example.com/health",
    "a2a": "https://travel-planner.example.com/.well-known/a2a"
  },
  "authentication": {
    "type": "oauth2",
    "schemes": ["Bearer"]
  },
  "trust": {
    "verified": true,
    "score": 0.92,
    "endorsements": 47,
    "uptime": "99.8%",
    "source": "agent-router.dev"
  },
  "tests": {
    "status": "passed",
    "pass_rate": 0.94,
    "latency_ms": 230,
    "tested_at": "2026-05-03T00:00:00Z",
    "report_url": "https://agent-router.dev/test/travel-planner"
  },
  "repository": {
    "url": "https://github.com/traveltech/travel-planner-agent",
    "source": "github"
  },
  "license": "Apache-2.0"
}
```

### 4.3 MCP Server Agent

```json
{
  "name": "github-mcp-server",
  "description": "MCP server providing GitHub API access for issue management, PRs, and code search",
  "version": "2.1.0",
  "protocols": ["mcp"],
  "transport": {
    "type": "stdio"
  },
  "tools": [
    { "name": "search_issues", "description": "Search GitHub issues", "free": true },
    { "name": "create_pr", "description": "Create a pull request", "free": true },
    { "name": "review_code", "description": "AI-powered code review", "free": false }
  ],
  "packages": [
    {
      "registryType": "npm",
      "registryBaseUrl": "https://registry.npmjs.org",
      "identifier": "@modelcontextprotocol/server-github",
      "version": "2.1.0"
    }
  ],
  "repository": {
    "url": "https://github.com/modelcontextprotocol/servers",
    "source": "github"
  },
  "license": "MIT"
}
```

---

## 5. Well-Known URI Convention

Agents SHOULD serve their agent.json at:

```
/.well-known/agent.json
```

This follows RFC 8615 (Well-Known URIs) and is consistent with existing conventions:
- A2A: `/.well-known/agent-card.json`
- Aiia: `/.well-known/ai-agent.json`
- Security.txt: `/.well-known/security.txt`

**Discovery flow:**
1. Client resolves agent domain (e.g., `travel-planner.example.com`)
2. Client fetches `https://travel-planner.example.com/.well-known/agent.json`
3. Client parses manifest and connects via declared protocols

---

## 6. Cross-Format Compatibility

### 6.1 agent.json → MCP server.json

| agent.json field | server.json field |
|-----------------|-------------------|
| name | name |
| description | description |
| version | version |
| repository | repository |
| transport | packages[].transport |
| packages | packages[] |

### 6.2 agent.json → A2A Agent Card

| agent.json field | Agent Card field |
|-----------------|------------------|
| name | name |
| description | description |
| url | url |
| provider | provider |
| version | version |
| skills | skills |
| authentication | authentication |
| capabilities.streaming | capabilities.streaming |

### 6.3 agent.json → ai-agent.json (Aiia)

| agent.json field | ai-agent.json field |
|-----------------|---------------------|
| name | name |
| description | description |
| url | url |
| protocols | protocols |
| tools | tools |
| trust | trust |
| authentication | authentication |

---

## 7. Trust Score Computation (Advisory)

agent.json includes a `trust` object. While anyone can self-report trust values, third-party trust providers SHOULD compute scores based on:

1. **Delegation Graph Analysis** — How many other trusted agents delegate tasks to this agent
2. **Test Results** — Automated test pass rates over time
3. **Endorsement Count** — Number of verified endorsements
4. **Uptime History** — Availability over the last 30/90/365 days
5. **Recency** — How recently the agent was tested/updated

Trust providers include their identity in the `trust.source` field.

---

## 8. Security Considerations

- agent.json files served over HTTPS MUST use TLS 1.2+
- Trust scores from third parties SHOULD be signed (JWS/JOSE)
- Sensitive credentials MUST NOT be included in agent.json
- The `/.well-known/agent.json` endpoint SHOULD be publicly accessible (no auth required for discovery)

---

## 9. IANA Considerations

This document requests registration of the Well-Known URI "agent.json" in the IANA Well-Known URIs registry.

---

## Appendix A: Comparison with Existing Formats

| Feature | agent.json | MCP server.json | A2A Agent Card | ai-agent.json |
|---------|-----------|-----------------|----------------|---------------|
| Required fields | 2 | 4+ | 7+ | 2 |
| Protocol support | Multi | MCP only | A2A only | Multi |
| Trust scoring | ✅ | ❌ | ❌ | ✅ (basic) |
| Test results | ✅ | ❌ | ❌ | ❌ |
| Well-known URI | ✅ | ❌ | ✅ | ✅ |
| Transport config | ✅ | ✅ | ❌ | ❌ |
| Package install | ✅ | ✅ | ❌ | ❌ |
| Skills taxonomy | ✅ | ❌ | ✅ | ❌ |
| Extensible | ✅ | ✅ | ✅ | ✅ |

---

*This specification is open and royalty-free. Feedback welcome via GitHub issues.*
