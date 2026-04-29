---
name: cli-skill
description: "Synthesize available session context into a structured CLI interface specification object for this digital employee's system and data touchpoints. Returns structured data for the master discovery skill to consume. Idempotent: can be called at any point during the discovery session as Round 5 discussions evolve or as new system dependencies surface in earlier rounds. Produces a partial spec when called with incomplete context."
license: Proprietary. Internal NCrew sub-skill.
compatibility: Called as a sub-skill by digital-employee-discovery. Not designed for direct user invocation.
metadata:
  author: Nigel + Hermes
  version: "1.0"
  domain: enterprise-ai-discovery
  parent-skill: digital-employee-discovery
  invoked-after: Round 5 confirmation (earliest); re-invocable at any point
---

# CLI skill

## Role in the discovery process

This skill produces the CLI interface specification object for the master skill's session state.

It is called when the master skill needs a view of what system and data touchpoints the digital employee's capabilities require — typically after Round 5 is confirmed, but also when the user mentions a system name, an external data source, or an integration dependency at any round. Each such mention is a CLI signal.

Because system dependencies can surface at any point in discovery, this skill is designed to be **called multiple times**. Each call reads the current session context, synthesizes the best-available CLI spec, and flags what cannot yet be resolved.

The returned CLI spec object is used by:
- The master skill's Round 6 synthesis step to populate the CLI and system touchpoints section of the final brief
- Downstream development scoping to identify which connectors need to be built or reused

## Design principle: interface contract, not implementation

A CLI spec answers: what does the call look like, what goes in, what comes out?

It does not answer: how is the call implemented, what internal query runs, or which SDK is used.

The right level of abstraction is the function signature:
```
crm:search-customer(customer_name, region) -> matched_accounts[]
```

Not the implementation:
```
SELECT * FROM accounts WHERE name LIKE '%{customer_name}%' AND region = '{region}'
```

## Invocation contract

Called by the master skill with the current session context. No user-facing interaction.

**Minimum viable invocation**: at least one system name or CLI dependency flag is present (from either the ontology slice or the capability list).

**Full invocation**: Round 5 is confirmed, the ontology slice's resource table is available, and the capability list's `cli_target_systems` fields are populated.

## Input: session context fields consumed

| Field | Source | Required | Description |
|---|---|---|---|
| `capability_list` | generator-skill output | Recommended | Capabilities with `needs_cli: true` and `cli_target_systems` |
| `ontology_slice.resources` | ontology-skill output | Recommended | Resource table with `needs_cli_connector` flags |
| `cli_signals_raw` | Any round | Required | All system/integration mentions from the conversation |
| `cli_shape_raw` | Round 5 | Recommended | Structured integration shape from Round 5 discussion |

`cli_signals_raw` is the accumulation of every moment in the conversation where the user mentioned a system, a data source, an integration need, or an external dependency — regardless of round. The master skill collects these as a running list.

## Processing instructions

### Step 1: Collect all system touchpoints

Merge three sources:
1. `capability_list` capabilities where `needs_cli: true` → get `cli_target_systems`
2. `ontology_slice.resources` where `needs_cli_connector: true` → get system names
3. `cli_signals_raw` → extract any additional system names

Deduplicate by system. One system = one CLI spec block, regardless of how many capabilities call into it.

### Step 2: For each system, enumerate CLI calls

For each capability that targets this system:
1. Identify the `action_type`: `read` / `write` / `notify` / `search` / `transform`
2. Derive the CLI call signature following this convention:

```
{namespace}:{action}-{object}({param1}, {param2}) -> {return_type}
```

Rules:
- `namespace`: lowercase system abbreviation — `crm`, `erp`, `oa`, `kb`, `hr`, `ticket`, `finance`
- `action`: lowercase verb — `get`, `search`, `create`, `update`, `list`, `notify`
- `object`: lowercase hyphenated noun — `customer`, `approval-request`, `policy-snippet`
- Parameters: named, lowercase, hyphenated
- Return: descriptive name with `[]` suffix for arrays

Good examples:
```
crm:search-customer(customer_name, region) -> matched_accounts[]
erp:get-order(order_id) -> order_summary
oa:create-approval(request_type, amount, owner_id) -> approval_id
kb:search-policy(query, department) -> policy_snippets[]
ticket:update-status(ticket_id, new_status, reason) -> updated_ticket
```

If the session context does not have enough detail to produce a full signature, produce a partial placeholder:
```
{namespace}:???({inputs_tbd}) -> {output_tbd}
```
and add to gaps.

### Step 3: Define input and output fields

For each CLI call, define only the fields that appeared in the conversation or are clearly implied by the real case from Round 1.

**Input fields:**
- `name`: lowercase hyphenated
- `type`: `string` / `integer` / `boolean` / `string[]` / `object`
- `required`: true / false
- `description`: one sentence grounded in the real case

**Output fields:**
- `name`: lowercase hyphenated
- `type`
- `description`: what this field means in the scenario context

Do not fabricate a comprehensive schema. Only include fields that were mentioned or are unambiguously implied.

### Step 4: Assess connector status

For each system, assess:
- `connector_exists`: a connector for this system already exists in the NCrew connector library
- `connector_needed`: a new connector must be built
- `connector_unknown`: cannot determine without further investigation

If uncertain, default to `connector_unknown` and add to gaps. Do not guess.

### Step 5: Note authentication boundary

For each system, note any auth boundary mentioned in the conversation:
- What identity does the employee act as? (service account / user-delegated identity / anonymous)
- Are there permission tiers?
- Any rate limits or quotas mentioned?

If not discussed, set `auth_notes` to `"待确认"`. Do not invent auth assumptions.

### Step 6: Collect gaps

Record every system that was flagged as needing a CLI connector but lacks enough detail to produce a specification. Include what information is needed and which round should provide it.

## Output: structured data returned to master skill

```json
{
  "cli_spec": {
    "employee_name": "<string | null>",
    "scenario_anchor": "<string | null>",
    "completeness": "full | partial | minimal",
    "systems": [
      {
        "system_name": "<string>",
        "connector_status": "connector_exists | connector_needed | connector_unknown",
        "connector_note": "<string | null — required if connector_needed>",
        "called_by_capabilities": ["<capability id or name>", "..."],
        "calls": [
          {
            "signature": "<namespace:action-object(params) -> return_type>",
            "action_type": "read | write | notify | search | transform",
            "used_by_capability": "<capability name>",
            "inputs": [
              {
                "name": "<string>",
                "type": "<string | integer | boolean | string[] | object>",
                "required": true,
                "description": "<string>"
              }
            ],
            "outputs": [
              {
                "name": "<string>",
                "type": "<string>",
                "description": "<string>"
              }
            ],
            "auth_notes": "<string | 待确认>"
          }
        ]
      }
    ],
    "new_connectors_needed": [
      {
        "system": "<system name>",
        "required_operations": ["<action_type>", "..."],
        "priority_signal": "high | medium | low | unknown"
      }
    ]
  },
  "partial_signatures": [
    {
      "system": "<system name>",
      "capability": "<capability name>",
      "partial_signature": "<namespace:???(inputs_tbd) -> output_tbd>",
      "missing": "<what is needed to complete this>"
    }
  ],
  "gaps": [
    {
      "system": "<system name>",
      "description": "<what is missing>",
      "source_round": "Round 5",
      "downstream_impact": "<cannot assess connector build scope without this>"
    }
  ]
}
```

## What this skill does not do

- Does not interact with the user
- Does not write integration adapters or connector implementation code
- Does not make technology selection decisions (SDK, API version, auth protocol)
- Does not validate that the proposed interface matches the target system's actual API
- Does not define error handling strategies — only the interface contract
- Does not prioritize connector build order — only flags `priority_signal` as a hint
- Does not block the master skill if context is incomplete — returns partial output with gaps instead
