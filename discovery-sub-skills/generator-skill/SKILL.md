---
name: generator-skill
description: "Synthesize available session context into a structured capability list object — the business-facing inventory of what this digital employee can do. Returns structured data for the master discovery skill to consume. Idempotent: can be called at any point during the discovery session as Round 4 discussions evolve. Produces a partial capability list when called with incomplete context."
license: Proprietary. Internal NCrew sub-skill.
compatibility: Called as a sub-skill by digital-employee-discovery. Not designed for direct user invocation.
metadata:
  author: Nigel + Hermes
  version: "1.0"
  domain: enterprise-ai-discovery
  parent-skill: digital-employee-discovery
  invoked-after: Round 4 confirmation (earliest); re-invocable at any point
---

# Generator skill

## Role in the discovery process

This skill produces the capability list (能力清单) object for the master skill's session state.

A capability list is the business-facing answer to: **"What can this digital employee actually do?"** It is not an implementation spec — it is a curated inventory of the employee's work capabilities in plain business language, each grounded in a real trigger, a real outcome, and a clear autonomy boundary.

### Invocation sequence

This skill is invoked in two contexts:

**1. Pre-initialization (before Round 0)**
The system runs generator-skill first, before the discovery conversation starts, to produce an initial capability list from the template's existing capability definitions. This gives the session an initial `capability_list` value. `ontology-skill` then uses this initial list to scope its initial ontology slice. **generator-skill must always run before ontology-skill during initialization.**

**2. Round-triggered updates (Round 4 and beyond)**
After Round 4 is confirmed, generator-skill is re-invoked with the enriched context from the discovery conversation. It can also be re-invoked at any point after `first_pass_complete = true` when the user adds capability-related context in free-form mode.

Because capability understanding evolves across rounds, this skill is designed to be **called multiple times**. Each call reads the current session context, synthesizes the best-available capability list, and flags what is still ambiguous.

The returned capability list object is used by:
- `ontology-skill` during pre-initialization as the scope anchor for the initial ontology slice
- `cli-skill` to identify which capabilities require system or data access
- The master skill's Round 6 synthesis step to populate the required skills section of the final brief
- The final discovery brief as the "Required skills this employee uses" section, rendered in business language

## Design principle: capabilities are business units, not implementation steps

A capability answers: "What business job can this employee do from start to finish?"

Good capabilities:
- Have a clear business trigger that a non-technical stakeholder can recognize
- Produce a concrete, named output
- Have a stated autonomy level (does it do it alone, or prepare for human action?)
- Map to one or more actions in the ontology slice

Bad capabilities:
- Are implementation steps: "调用API获取数据", "解析JSON响应"
- Are generic: "处理请求", "生成回复"
- Are granular sub-steps that only make sense inside a larger workflow
- Overlap significantly with another capability in the list

## Invocation contract

Called by the master skill with the current session context. No user-facing interaction.

**Minimum viable invocation**: at least one capability signal exists in the session context (even informal, e.g., "它要能分类工单").

**Full invocation**: Round 4 is confirmed and the manifest and ontology slice are available.

## Input: session context fields consumed

| Field | Source | Required | Description |
|---|---|---|---|
| `manifest` | manifest-skill output | Recommended | Employee name, scope, autonomy_level, critical_failure |
| `ontology_slice` | ontology-skill output | Recommended | Actions table — the canonical list of what the employee does |
| `capability_signals_raw` | Any round | Required | All capability mentions from the conversation, unstructured |
| `skills_raw` | Round 4 | Recommended | Structured skill list from Round 4 discussion |
| `uploaded_skills` | User upload (right panel) | Optional | Skill files uploaded by the user via the right-panel upload zone; pre-parsed into `{name, description, trigger, autonomy}` objects before being passed to this skill |

`capability_signals_raw` is the accumulation of all moments in the conversation where the user described what the employee should be able to do — regardless of which round. The master skill collects these as a running list and passes them all to this sub-skill on each invocation.

`uploaded_skills` contains skills the user already has defined and uploaded directly, bypassing conversation generation. These are treated as confirmed drafts and merged into the capability list alongside conversation-generated skills. Missing fields in uploaded skills are flagged in the output gaps.

## Processing instructions

### Step 1: Collect all capability signals

Merge three sources:
1. `capability_signals_raw`: all informal mentions across the conversation ("它要能…", "需要能够…", "自动…", "帮我…")
2. `skills_raw`: the more structured Round 4 output
3. `uploaded_skills`: pre-parsed skill objects from user uploads; treat each as a capability signal with higher confidence (name and description are already resolved)

Deduplicate by semantic meaning, not string matching. Two signals that describe the same business action count as one capability. If an uploaded skill duplicates a conversation-generated capability, merge them — use the uploaded skill's `name` and `description` as the primary values, and enrich with any trigger or autonomy context from the conversation.

### Step 2: Shape into discrete capabilities

For each candidate capability:

1. **Name it**: verb-noun Chinese phrase, 3–6 characters
   - Good: `工单分类`, `客户匹配`, `费用预检`, `异常升级`, `摘要生成`
   - Bad: `处理数据`, `执行操作`, `智能分析`

2. **State the trigger**: what specific business event causes this capability to activate?
   - Must be recognizable to a non-technical stakeholder
   - Must be specific enough to distinguish this capability from others

3. **State the output**: what concrete artifact or decision does this capability produce?
   - Must be named (not "处理结果" — instead "带分类标签的工单", "路由目的地建议", "费用合规性判断")

4. **Assign the autonomy level**: must not exceed the manifest's overall autonomy level
   - A capability can be more conservative than the manifest level, but not more aggressive
   - `execute_directly` means the employee acts without human involvement within the defined trigger
   - `execute_under_approval` means the employee prepares and submits, a human approves
   - `prepare` means the employee drafts and presents, a human decides whether to act
   - `recommend` means the employee provides a suggestion, the human makes the final call

5. **Flag CLI dependency**: does this capability require reading from or writing to an external system?
   - Cross-reference with `ontology_slice.resources` where `needs_cli_connector: true`
   - If yes, name the target system(s)

### Step 3: Apply the minimal sufficient set rule

Target: 3–7 capabilities for one business scenario.

Merge two capabilities if:
- They share the same trigger AND the same output object
- Splitting them creates an awkward internal handoff that is invisible to business stakeholders

Split one capability into two if:
- They have materially different autonomy levels
- One requires CLI access and the other operates on context only
- One is clearly reusable in adjacent scenarios and the other is scenario-specific

If fewer than 3 capabilities can be derived from the current context, do not pad the list. Flag the gap and describe which round should provide the missing context.

### Step 4: Cross-reference with ontology actions

For each capability:
- Identify which action(s) from the ontology slice's action table this capability maps to
- If a capability has no corresponding ontology action, flag it as potentially out of scope or as a signal to update the ontology slice

### Step 5: Collect gaps

Record capabilities that were clearly implied by the conversation but lack enough detail to be shaped (missing trigger, missing output, or ambiguous autonomy level).

## Output: structured data returned to master skill

```json
{
  "capability_list": {
    "employee_name": "<string | null>",
    "scenario_anchor": "<string | null>",
    "total_count": "<integer>",
    "completeness": "full | partial | minimal",
    "capabilities": [
      {
        "id": "cap-01",
        "name": "<Chinese verb-noun, 3-6 chars>",
        "trigger": "<business event that activates this capability>",
        "output": "<named artifact or decision produced>",
        "autonomy_level": "recommend | prepare | execute_under_approval | execute_directly",
        "autonomy_note": "<one sentence explaining what autonomous vs. what human-reviewed>",
        "ontology_actions_mapped": ["<action verb-noun>", "..."],
        "needs_cli": true,
        "cli_target_systems": ["<system name>", "..."]
      }
    ]
  },
  "capabilities_pending": [
    {
      "signal": "<raw signal text from conversation>",
      "gap": "<what is missing: trigger / output / autonomy_level>"
    }
  ],
  "merge_suggestions": [
    {
      "capabilities": ["cap-01", "cap-02"],
      "reason": "<why these could be merged>"
    }
  ],
  "ontology_update_signals": [
    {
      "capability_id": "cap-XX",
      "signal": "<this capability implies an entity or action not yet in the ontology slice>"
    }
  ],
  "gaps": [
    {
      "description": "<what is missing>",
      "source_round": "Round 4",
      "downstream_impact": "<cli-skill cannot identify connector needs for this capability>"
    }
  ]
}
```

## What this skill does not do

- Does not interact with the user
- Does not write SKILL.md implementation files — it produces a business-facing capability list, not runtime skill definitions
- Does not design the ontology slice — it reads from it and may signal updates to it, but does not modify it
- Does not specify CLI interfaces — it flags which capabilities need CLI access and passes that to `cli-skill`
- Does not prioritize which capabilities to build first — that is a team decision
- Does not block the master skill if context is incomplete — returns partial output with gaps instead
