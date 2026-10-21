# Walkthrough: 1.1 Scaffold repo directories

Target: Structural Seed directories from story 1.1
Plan: [story-scaffold-repo-directories-plan.md](../epic-foundation-scaffold/story-scaffold-repo-directories-plan.md)

**Current block:** review complete — Wrap-up offered

## Blocks

- [x] **1. Intent** — done
- [x] **2. Broad strokes** — done
- [x] **3. Slice: empty Structural Seed dirs** — done
- [x] **4. Periphery** — done

---

## 1. Intent

Source: Intent section of [story-scaffold-repo-directories-plan.md](../epic-foundation-scaffold/story-scaffold-repo-directories-plan.md) (verbatim).

**Problem:** The repo has only `_bmad/` and `_bmad-output/`; architecture Structural Seed folders for Skills, references, examples, and extension do not exist yet.

**Approach:** Create `skills/_shared/`, `references/`, `examples/`, and `extension/` at the project root with `.gitkeep` so empty dirs are commit-ready. No Skill logic, gold JSON, or README content in this ticket.

---

## 2. Broad strokes

Four root directories form the architecture Structural Seed. Open these first:

1. [skills/_shared/](../../../skills/_shared/) — shared Skill helpers land here later
2. [references/](../../../references/) — root-level reference assets (AD-7)
3. [examples/](../../../examples/) — gold / example fixtures land here later
4. [extension/](../../../extension/) — MV3 extension package root

---

## 3. Slice: empty Structural Seed dirs

Mechanism: create each directory and place an empty `.gitkeep` so Git can track empty folders. No other files in this story.

Worked example: [skills/_shared/.gitkeep](../../../skills/_shared/.gitkeep) — empty placeholder.

Same treatment:

- [references/.gitkeep](../../../references/.gitkeep)
- [examples/.gitkeep](../../../examples/.gitkeep)
- [extension/.gitkeep](../../../extension/.gitkeep)

---

## 4. Periphery

- [story-scaffold-repo-directories-plan.md](../epic-foundation-scaffold/story-scaffold-repo-directories-plan.md) — oneshot plan (`status: built`); owns Intent and verification command
