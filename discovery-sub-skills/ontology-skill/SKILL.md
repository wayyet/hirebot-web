---
name: ontology-skill
description: "Synthesize available session context into a structured ontology slice object for the digital employee's scenario. Returns structured data for the master discovery skill to consume. Idempotent: can be called at any point during the discovery session as new entities, constraints, or system dependencies are surfaced. Produces a partial slice when called with incomplete context."
license: Proprietary. Internal NCrew sub-skill.
compatibility: Called as a sub-skill by digital-employee-discovery. Not designed for direct user invocation.
metadata:
  author: Nigel + Hermes
  version: "1.0"
  domain: enterprise-ai-discovery
  parent-skill: digital-employee-discovery
  invoked-after: Round 3 confirmation (earliest); re-invocable at any point
---

# Ontology skill

## Role in the discovery process

This skill produces the ontology slice object for the master skill's session state.

### Invocation sequence

This skill is invoked in two contexts:

**1. Pre-initialization (before Round 0)**
After generator-skill produces the initial capability list, ontology-skill runs second to produce an initial ontology slice scoped to those capabilities. **ontology-skill must always run after generator-skill during initialization** — it uses the capability list as a scope anchor to ensure the slice only contains concepts that the capabilities actually need (minimal sufficient slice principle). Running ontology-skill before generator-skill would produce a slice with undefined boundaries.

**2. Round-triggered updates (Round 3 and beyond)**
After Round 3 is confirmed, ontology-skill is re-invoked with the enriched context from the discovery conversation. It can also be re-invoked at any point after `first_pass_complete = true` when the user adds ontology-related context in free-form mode.

Because discovery conversations are non-linear and new context surfaces at any round, this skill is designed to be **called multiple times**. Each call merges the latest session context into an updated slice, preserving confirmed entries and adding or flagging new ones.

The returned ontology slice object is used by:
- `generator-skill` (in round-triggered updates) as the semantic boundary within which capabilities are refined
- `cli-skill` to understand which resources need CLI connectors
- The master skill's Round 6 synthesis step to populate the ontology slice section of the final brief

## Design principle: minimal sufficient slice

The slice contains only concepts that change what the employee **decides**, **outputs**, or **must comply with** in this scenario.

A concept that is contextually relevant but does not affect any of the three above is excluded. The exclusion is recorded so future maintainers understand the scope decision.

## Invocation contract

Called by the master skill with the current session context. No user-facing interaction.

**Minimum viable invocation**: at least the `scenario_anchor` and one entity from `entities_raw` must be present.

**Full invocation**: Rounds 1, 2, and 3 are confirmed and the manifest is available.

## Input: session context fields consumed

| Field | Source | Required | Description |
|---|---|---|---|
| `manifest` | manifest-skill output | Recommended | Employee name, scope, out_of_scope, autonomy_level |
| `real_case` | Round 1 | Recommended | The concrete example case used during discovery |
| `trigger` | Round 1 | Recommended | What event starts the work |
| `tension_point` | Round 1 | Optional | Where judgment is hard |
| `target_outcome` | Round 1 | Optional | What a good result looks like |
| `entities_raw` | Round 3 | Recommended | Raw business objects mentioned |
| `actions_raw` | Round 3 | Recommended | Things the employee must do |
| `resources_raw` | Round 3 | Recommended | Systems, channels, knowledge sources |
| `constraints_raw` | Round 3 | Recommended | Rules, approvals, compliance, brand, risk |

Additional entities, resources, or constraints surfaced in Rounds 4 or 5 are also consumed when present.

## Processing instructions

### Step 1: Name the slice

`slice_name` = `{employee_name}-场景本体切片`

If manifest is unavailable, derive from `scenario_anchor`. If both are absent, set to `null` and add to gaps.

### Step 2: Process entities

For each item in `entities_raw`:

1. Apply the minimal slice filter:
   - Ask: does this object change what the employee decides, outputs, or must comply with in the real case?
   - If yes → include
   - If no → exclude, record in `excluded_concepts` with reason

2. For each included entity, produce:
   - `name`: normalized Chinese noun
   - `definition`: one sentence specific to how this company uses the term (not generic)
   - `key_fields`: 2–4 field names that matter for this scenario
   - `scenario_relevance`: one sentence on why this entity is in the slice

3. Flag entities that appear in the real case but were not mentioned by the user — add to `inferred_entities`.

### Step 3: Process actions

For each item in `actions_raw`:

1. Normalize to verb-noun form: `分类工单` / `匹配客户` / `生成摘要` / `触发升级`
2. Assign `actor`: `digital_employee` / `human` / `both`
3. Identify `trigger_condition`: what causes this action
4. Identify `output`: what the action produces
5. Cross-reference with manifest `scope` — actions outside the employee's scope are marked `out_of_scope: true` but still recorded for completeness

### Step 4: Process resources

For each item in `resources_raw`:

1. Classify `resource_type`: `system` / `channel` / `knowledge_source` / `template`
2. Identify `usage_type`: `read` / `write` / `search` / `notify` (may be multiple)
3. Set `needs_cli_connector`: `true` / `false` / `unknown`
   - `true` if the resource is an external system that skills must call at runtime
   - `false` if the resource is embedded context or static reference material
   - `unknown` if it cannot be determined from available context

### Step 5: Process constraints

For each item in `constraints_raw`:

1. Classify `constraint_type`: `approval_gate` / `compliance_rule` / `brand_rule` / `risk_boundary` / `escalation_trigger`
2. State `rule`: what is specifically required or prohibited
3. State `violation_consequence`: what goes wrong if this constraint is violated
4. State `enforcement`: `system_enforced` / `requires_employee_judgment`

Constraints requiring active employee judgment are the highest-priority items in the slice — they define where the employee must not act autonomously.

### Step 6: Generate test cases

Derive a set of test cases directly from the ontology slice for use by the AI evaluation stage.

Test cases are generated from three sources within the slice:

**From entities:** For each entity, produce at least one recognition test — a scenario where the digital employee must correctly identify, classify, or apply the entity in context.

**From actions:** For each in-scope action where `actor` is `digital_employee` or `both`, produce at least one execution test — a scenario where the trigger condition fires and the expected output must be produced.

**From constraints:** For each constraint where `enforcement` is `requires_employee_judgment`, produce at least one compliance test — a scenario where the employee must correctly recognize the constraint applies and act accordingly. These are the highest-priority test cases.

Test case structure:
- `test_case_id`: sequential identifier, e.g. `tc-001`
- `name`: short Chinese label
- `test_type`: `entity_recognition` / `action_execution` / `constraint_compliance`
- `tests_element`: the entity name, action name, or constraint name being tested
- `input`: the scenario input the digital employee receives (in business language, not technical spec)
- `expected_behavior`: what the employee should do
- `expected_output`: the named artifact or decision the employee should produce
- `pass_criteria`: the specific observable condition that indicates the test passed
- `priority`: `high` for constraint compliance tests; `medium` for action execution; `low` for entity recognition

Minimum test case counts per invocation:
- At least 1 test per constraint where `enforcement = requires_employee_judgment`
- At least 1 test per in-scope action where `actor = digital_employee`
- At least 1 test total covering an entity recognition scenario

If context is insufficient to generate a complete test case, produce a partial test case with the missing fields noted.

### Step 7: Collect gaps and excluded concepts

Record every concept considered and excluded, with the reason. This is a first-class output, not an afterthought.

## Output: structured data returned to master skill

```json
{
  "ontology_slice": {
    "slice_name": "<string | null>",
    "employee_name": "<string | null>",
    "scenario_anchor": "<string | null>",
    "entities": [
      {
        "name": "<Chinese noun>",
        "definition": "<one sentence>",
        "key_fields": ["<field>", "..."],
        "scenario_relevance": "<one sentence>"
      }
    ],
    "actions": [
      {
        "action": "<verb-noun>",
        "actor": "digital_employee | human | both",
        "trigger_condition": "<string>",
        "output": "<string>",
        "in_scope": true
      }
    ],
    "resources": [
      {
        "name": "<resource name>",
        "resource_type": "system | channel | knowledge_source | template",
        "usage_type": ["read | write | search | notify"],
        "needs_cli_connector": true
      }
    ],
    "constraints": [
      {
        "name": "<constraint name>",
        "constraint_type": "approval_gate | compliance_rule | brand_rule | risk_boundary | escalation_trigger",
        "rule": "<precise statement>",
        "violation_consequence": "<string>",
        "enforcement": "system_enforced | requires_employee_judgment"
      }
    ],
    "completeness": "full | partial | minimal"
  },
  "test_cases": [
    {
      "test_case_id": "tc-001",
      "name": "<short Chinese label>",
      "test_type": "entity_recognition | action_execution | constraint_compliance",
      "tests_element": "<entity / action / constraint name being tested>",
      "input": "<scenario input in business language>",
      "expected_behavior": "<what the employee should do>",
      "expected_output": "<named artifact or decision>",
      "pass_criteria": "<observable condition that indicates pass>",
      "priority": "high | medium | low",
      "complete": true
    }
  ],
  "cli_dependency_systems": ["<system names that need CLI connectors>"],
  "excluded_concepts": [
    {
      "concept": "<name>",
      "reason": "<why excluded from the slice>"
    }
  ],
  "inferred_entities": ["<entities inferred from context, not stated by user>"],
  "gaps": [
    {
      "field": "<field_name>",
      "source_round": "<Round N>",
      "downstream_impact": "<which sub-skill is affected>"
    }
  ]
}
```

## What this skill does not do

- Does not interact with the user
- Does not design the full enterprise ontology — only the scenario slice
- Does not generate capabilities or CLI specs — those are `generator-skill` and `cli-skill`
- Does not decide which systems to integrate with — only identifies which resources exist and whether they need connectors
- Does not write evaluation scoring logic — only produces the test cases; scoring is the AI evaluation stage's responsibility
- Does not block the master skill if context is incomplete — returns partial output with gaps instead
