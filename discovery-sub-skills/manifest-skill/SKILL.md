---
name: manifest-skill
description: "Synthesize available session context into a structured digital employee manifest object. Returns structured data for the master discovery skill to consume. Idempotent: can be called at any point during the discovery session as context accumulates or is revised. Produces a partial manifest when called with incomplete context."
license: Proprietary. Internal NCrew sub-skill.
compatibility: Called as a sub-skill by digital-employee-discovery. Not designed for direct user invocation.
metadata:
  author: Nigel + Hermes
  version: "1.0"
  domain: enterprise-ai-discovery
  parent-skill: digital-employee-discovery
  invoked-after: Round 2 confirmation (earliest); re-invocable at any point
---

# Manifest skill

## Role in the discovery process

This skill produces the digital employee identity object for the master skill's session state.

It is called whenever the master skill needs a current snapshot of who this digital employee is — typically after Round 2 is confirmed, but also when the user revises the employee name, mission, or scope at any later point.

Because discovery conversations are non-linear, this skill is designed to be **called multiple times**. Each call reads the current session context, synthesizes the best-available manifest, and flags what is still incomplete.

The returned manifest object is used by:
- `ontology-skill` as the scope anchor when filtering entities and constraints
- `generator-skill` as the identity context when enumerating capabilities
- The master skill's Round 6 synthesis step to populate the profile card section of the final brief

## Invocation contract

Called by the master skill with the current session context. No user-facing interaction in this skill.

**Minimum viable invocation**: at least one of `employee_name_draft` or `mission_draft` must be present in the session context.

**Full invocation**: all Round 1 and Round 2 fields are confirmed.

## Input: session context fields consumed

The skill reads the following fields from the master skill's running session state. Missing fields produce partial output with gap flags.

| Field | Source round | Required | Description |
|---|---|---|---|
| `scenario_anchor` | Round 0 | Recommended | One-sentence scenario description confirmed at start |
| `problem_statement` | Round 1 | Recommended | The business pain this employee addresses |
| `current_operator` | Round 1 | Optional | The human role currently doing this work |
| `trigger` | Round 1 | Recommended | What event starts the work |
| `tension_point` | Round 1 | Optional | Where judgment is hard or inconsistent today |
| `target_outcome` | Round 1 | Optional | What a good result looks like |
| `employee_name_draft` | Round 2 | Required | Working name from the conversation |
| `role_metaphor` | Round 2 | Optional | Analogy used to describe the role |
| `mission_draft` | Round 2 | Recommended | One-sentence purpose from the conversation |
| `scope_items` | Round 2 | Recommended | List of what this employee is responsible for |
| `out_of_scope_items` | Round 2 | Optional | Explicit exclusions |
| `autonomy_level` | Round 2 | Recommended | One of: recommend / prepare / execute_under_approval / execute_directly |
| `critical_failure` | Round 2 | Optional | The worst mistake this employee could make |

## Processing instructions

### Step 1: Resolve the name

Produce `employee_name` as the final normalized name:
- Format: `{domain}{role_noun}` in Chinese, role-facing not system-facing
  - Good: `售后工单分诊专员`, `费用预检助手`, `销售线索路由专员`
  - Bad: `AI审核Bot`, `智能处理系统`, `GPT助手`
- If `employee_name_draft` is already well-formed, use it as-is
- If it is system-facing or generic, propose a corrected name and record both as `name_original` and `name_corrected`
- If `employee_name_draft` is missing, set `employee_name` to `null` and add to gaps

### Step 2: Resolve the mission

Produce `mission` as a single Chinese sentence:
- Must complete: "这位数字员工的存在是为了……"
- Must reference the specific business scenario, not generic efficiency claims
- Maximum 30 Chinese characters
- If `mission_draft` exists, refine it; if not, infer from `problem_statement` + `target_outcome` if both are available; otherwise set to `null` and add to gaps

### Step 3: Resolve scope and boundaries

Produce `scope` as an array of strings, each starting with a Chinese verb:
- Derive from `scope_items`; normalize each item to verb-noun form
- Minimum 2 items; if fewer are available, infer from `target_outcome` and `tension_point` but flag as inferred

Produce `out_of_scope` as an array of strings:
- Derive from `out_of_scope_items` if available
- If not available, infer at least one exclusion from the `trigger` and `tension_point` context
- Flag inferred exclusions

### Step 4: Resolve autonomy level

Map `autonomy_level` to a display label:

| Value | Display label |
|---|---|
| recommend | 提供建议，最终决定由人工确认 |
| prepare | 准备初稿或摘要，人工审核后执行 |
| execute_under_approval | 独立执行，关键节点需要审批 |
| execute_directly | 在定义范围内直接执行，无需人工介入 |

If `autonomy_level` is missing, set to `null` and add to gaps.

### Step 5: Collect gaps

Produce a `gaps` array listing every required or recommended field that was missing or required inference. Each entry states:
- which field is missing
- what round it should come from
- what the downstream impact is (which other sub-skills are blocked)

## Output: structured data returned to master skill

```json
{
  "manifest": {
    "employee_name": "<string | null>",
    "name_corrected": "<string | null — populated only if name was revised>",
    "name_original": "<string | null — populated only if name was revised>",
    "scenario_anchor": "<string | null>",
    "mission": "<string | null>",
    "scope": ["<verb-noun string>", "..."],
    "out_of_scope": ["<string>", "..."],
    "autonomy_level": "recommend | prepare | execute_under_approval | execute_directly | null",
    "autonomy_label": "<string | null>",
    "critical_failure": "<string | null>",
    "completeness": "full | partial | minimal"
  },
  "gaps": [
    {
      "field": "<field_name>",
      "source_round": "<Round N>",
      "downstream_impact": "<which sub-skill is affected>"
    }
  ],
  "inferred_fields": ["<list of field names that were inferred rather than directly stated>"]
}
```

`completeness` values:
- `full` — all required and recommended fields are present and confirmed
- `partial` — required fields are present but some recommended fields are missing
- `minimal` — only minimum viable fields present; manifest should not be used in final brief yet

## What this skill does not do

- Does not interact with the user
- Does not store state — reads from and returns to the master skill's session state
- Does not design skills, ontology, or CLI — stays at the identity layer
- Does not block the master skill if context is incomplete — returns partial output with gaps instead
