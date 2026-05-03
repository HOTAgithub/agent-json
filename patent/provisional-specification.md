# PROVISIONAL PATENT APPLICATION SPECIFICATION

## TITLE

Universal Agent Manifest Format and Agent Quality Graph for Trust-Based Agent Discovery and Delegation

## INVENTOR

Takayuki Hori, Japan

## FIELD OF THE INVENTION

This invention relates to the field of artificial intelligence agent management, and more specifically to systems and methods for universal agent discovery, identity description, trust scoring, and cross-registry interoperability using a standardized manifest format and graph-based reputation system.

## BACKGROUND OF THE INVENTION

As of 2026, over 104,000 AI agents are distributed across more than 15 independent registries and directories, including but not limited to Smithery, the Model Context Protocol (MCP) Registry, Glama, HuggingFace, and others. Each registry implements its own proprietary metadata schema (e.g., server.json, smithery.yaml, glama.json, A2A Agent Card), resulting in zero interoperability between registries.

Currently, there exists no universal, machine-readable format for describing AI agents in a protocol-agnostic manner. Furthermore, there is no standardized mechanism for evaluating whether an agent reliably completes delegated tasks. All current discovery mechanisms rely on self-reported capabilities, download counts, or manual curation — none of which provide verifiable trust signals.

This fragmentation creates several problems:
1. Developers must manually register agents on multiple platforms with different schemas
2. Agent consumers cannot compare or discover agents across registries
3. There is no trust mechanism to evaluate agent reliability before delegation
4. Cross-registry agent composition and orchestration is impossible without manual normalization

## SUMMARY OF THE INVENTION

The present invention provides a system and method comprising two complementary components:

1. **agent.json**: A universal, machine-readable manifest format for describing AI agents across all registries and protocols
2. **Agent Quality Graph (AQG)**: A graph-based trust scoring system that computes agent reliability scores from delegation transaction data

These components together enable universal agent discovery, identity verification, and trust-based selection across heterogeneous registry ecosystems.

## DETAILED DESCRIPTION

### Component 1: agent.json Universal Agent Manifest

The agent.json format is a JSON (JavaScript Object Notation) document that serves as a universal manifest for describing AI agents. The format is designed with minimal required fields to maximize adoption while supporting rich optional metadata.

#### Required Fields (Minimum Viable Manifest)

The format requires only two fields:
- `name`: A string identifier for the agent (e.g., reverse-DNS format)
- `description`: A human-readable description of the agent's purpose and capabilities

This minimal requirement ensures maximum adoption across heterogeneous ecosystems.

#### Optional Fields

The manifest supports the following optional fields:

- `version`: Semantic versioning identifier
- `protocol`: Array of supported communication protocols (e.g., MCP, A2A, HTTP, gRPC)
- `capabilities`: Array of declared agent capabilities
- `endpoint`: Network address or URI where the agent can be reached
- `auth`: Authentication requirements and methods
- `trust`: Trust and quality scoring data (see AQG below)
- `repository`: Source code repository URL
- `documentation`: Documentation URL
- `license`: Software license identifier
- `tags`: Categorization tags
- `pricing`: Usage pricing information
- `testResults`: Automated test results and coverage data
- `verification`: Cryptographic verification data

#### Well-Known URI Convention

The manifest is discoverable via a well-known URI convention at the path `/.well-known/agent.json` on any agent-hosting domain, following RFC 8615 (Well-Known Uniform Resource Identifiers).

#### Schema Superset Design

The agent.json format is designed as a superset of existing agent metadata formats, including but not limited to:
- MCP server.json (Model Context Protocol server manifest)
- A2A Agent Card (Google's Agent-to-Agent protocol)
- smithery.yaml (Smithery registry format)
- glama.json (Glama registry format)
- ai-agent.json (AI agent directory format)

Conversion mappings between agent.json and each proprietary format are defined, enabling automatic bidirectional translation without data loss.

#### Protocol-Agnostic Architecture

The manifest is protocol-agnostic, meaning it can describe agents regardless of their communication protocol. The `protocol` field declares supported protocols, and the `endpoint` field provides protocol-specific connection information.

### Component 2: Agent Quality Graph (AQG)

The Agent Quality Graph is a directed weighted graph that models agent delegation relationships and computes trust scores using a PageRank-inspired algorithm.

#### Graph Construction

The graph is constructed from delegation transactions:
- **Nodes**: Each node represents an AI agent
- **Edges**: Each directed edge represents a delegation from one agent (delegator) to another (delegatee)
- **Edge weights**: Calculated from delegation outcome and recency

#### Edge Weight Calculation

The weight w(e) of an edge from agent A (delegator) to agent B (delegatee) is calculated as:

```
w(e) = Σ (outcome_score × recency_factor)
```

Where:
- `outcome_score` = +1.0 for successful delegation, -1.0 for failed delegation, with partial values for partial completion
- `recency_factor` = e^(-λ × age), where λ is a decay constant and age is the time elapsed since the delegation

#### Trust Score Computation

Agent trust scores are computed using an iterative algorithm inspired by PageRank:

```
Score(A) = (1 - d) / N + d × Σ (w(e) / OutWeight(B)) for all B pointing to A
```

Where:
- `d` is a damping factor (typically 0.85)
- `N` is the total number of agents in the graph
- `OutWeight(B)` is the sum of all outgoing edge weights from agent B

The resulting score is normalized to the range [0.0, 1.0].

#### Anti-Gaming Mechanisms

The AQG incorporates several anti-gaming mechanisms:

1. **Sybil Resistance**: New nodes receive a minimal base score until sufficient delegation history accumulates. A minimum trust threshold is required for delegation edges to carry significant weight.

2. **Collusion Detection**: Mutual delegation patterns (A→B and B→A) are detected and their edge weights are reduced by a decay factor proportional to the reciprocity ratio.

3. **Temporal Decay**: Edge weights decrease over time, requiring ongoing successful delegations to maintain high trust scores.

4. **Whale Resistance**: A single delegator's influence is bounded by capping the maximum outgoing weight contribution to any single delegatee.

#### Trust Score Storage and Verification

Trust scores are stored in the agent.json manifest's `trust` field:
```json
{
  "trust": {
    "score": 0.85,
    "source": "agent-quality-graph",
    "lastUpdated": "2026-05-03T00:00:00Z",
    "delegationCount": 150,
    "successRate": 0.92
  }
}
```

### Component 3: Agent Router API

An implementation of the above components as a cross-registry search and aggregation API:

1. **Registry Integration**: Connects to multiple agent registries (Smithery, MCP Registry, Glama) via their respective APIs
2. **Schema Normalization**: Converts proprietary formats to agent.json format in real-time
3. **Unified Search**: Provides a single search endpoint that queries all connected registries in parallel
4. **Trust-Enhanced Results**: Augments search results with AQG trust scores when available

#### API Endpoints

- `GET /search?q=<query>&limit=<n>`: Cross-registry agent search
- `GET /registries`: List connected registries and their metadata
- `GET /agent/:id`: Retrieve a specific agent's agent.json manifest
- `POST /delegation`: Record a delegation transaction for AQG scoring

### System Architecture

The complete system operates as follows:

1. Agent developers publish agent.json manifests via the well-known URI convention on their hosting domain
2. Agent registries ingest agent.json manifests and make them discoverable
3. The Agent Router API aggregates agents from multiple registries, normalizing to agent.json format
4. Agent consumers search and discover agents across registries via the unified API
5. When an agent delegates a task to another agent, the transaction is recorded
6. The AQG computes updated trust scores from the delegation graph
7. Trust scores are propagated back to agent.json manifests and reflected in future search results

## CLAIMS

1. A computer-implemented method for universal agent discovery across heterogeneous registries, comprising: defining a universal agent manifest format with minimal required fields; converting proprietary agent metadata formats to said universal format; and providing a unified search interface across multiple registries.

2. The method of claim 1, wherein said universal agent manifest format requires only a name field and a description field.

3. The method of claim 1, wherein said universal agent manifest format is discoverable via a well-known URI path.

4. A computer-implemented method for computing agent trust scores, comprising: constructing a directed weighted graph from agent delegation transactions; computing edge weights based on delegation outcomes and temporal recency; and iteratively computing trust scores for each agent using a graph-based ranking algorithm.

5. The method of claim 4, wherein said graph-based ranking algorithm is adapted from PageRank with delegation outcome weighting.

6. The method of claim 4, further comprising Sybil resistance by applying minimum trust thresholds to new nodes.

7. The method of claim 4, further comprising collusion detection by identifying and penalizing reciprocal delegation patterns.

8. The method of claim 4, further comprising temporal decay of edge weights to require ongoing delegation performance.

9. A system for cross-registry agent discovery and trust evaluation, comprising: a universal agent manifest format; a graph-based trust scoring engine; and an aggregation API connecting multiple agent registries.

10. The system of claim 9, wherein said trust scores are stored in said universal agent manifest format and propagated to connected registries.

## DRAWINGS

### Figure 1: System Architecture Overview

```
[Agent Developer] → publishes → [agent.json on /.well-known/agent.json]
                                       ↓
[Registry A] [Registry B] [Registry C] ← ingest
       ↓           ↓           ↓
       └───────────┼───────────┘
                   ↓
          [Agent Router API]
          - Schema normalization
          - Unified search
          - AQG computation
                   ↓
          [Agent Consumer]
          - Search & discover
          - View trust scores
          - Delegate tasks
                   ↓
          [Delegation Transaction]
                   ↓
          [AQG Graph Update]
                   ↓
          [Trust Score Propagation]
```

### Figure 2: AQG Graph Structure

```
Agent A ──delegates──→ Agent B (success, w=0.8)
    │                        │
    │                        ↓
    │                   Agent D (success, w=0.7)
    ↓
Agent C (failure, w=-0.3)

Score(B) = f(incoming edges from A, weighted by outcomes)
Score(C) = f(incoming edges from A, reduced by failure)
Score(D) = f(incoming edges from B, weighted by outcomes + B's reputation)
```

### Figure 3: Cross-Registry Data Flow

```
[Smithery] ──smithery.yaml──→ [Converter] → agent.json → [Search Index]
[MCP Registry] ──server.json──→ [Converter] → agent.json → [Search Index]
[Glama] ──glama.json──→ [Converter] → agent.json → [Search Index]
                                                          ↓
                                                   [Unified API]
                                                          ↓
                                                   [Consumer Query]
```

## ABSTRACT

A system and method for universal AI agent discovery and trust evaluation. The invention provides agent.json, a universal manifest format with minimal required fields that serves as a superset of existing proprietary agent metadata schemas, enabling cross-registry interoperability. Combined with the Agent Quality Graph (AQG), a PageRank-inspired trust scoring system based on delegation transaction graphs, the invention enables trust-based agent selection across heterogeneous ecosystems. The system includes anti-gaming mechanisms including Sybil resistance, collusion detection, and temporal decay.
