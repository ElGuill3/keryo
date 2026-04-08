# Skill Registry

**Delegator use only.** Any agent that launches sub-agents reads this registry to resolve compact rules, then injects them directly into sub-agent prompts. Sub-agents do NOT read this registry or individual SKILL.md files.

See `_shared/skill-resolver.md` for the full resolution protocol.

## User Skills

| Trigger | Skill | Path |
|---------|-------|------|
| When creating a pull request, opening a PR, or preparing changes for review | branch-pr | /home/elguill3/.config/opencode/skills/branch-pr/SKILL.md |
| When writing Go tests, using teatest, or adding test coverage | go-testing | /home/elguill3/.config/opencode/skills/go-testing/SKILL.md |
| When creating a GitHub issue, reporting a bug, or requesting a feature | issue-creation | /home/elguill3/.config/opencode/skills/issue-creation/SKILL.md |
| When user says "judgment day", "review adversarial", "dual review", "doble review" | judgment-day | /home/elguill3/.config/opencode/skills/judgment-day/SKILL.md |
| When user asks to create a new skill, add agent instructions, or document patterns for AI | skill-creator | /home/elguill3/.config/opencode/skills/skill-creator/SKILL.md |

## Compact Rules

Pre-digested rules per skill. Delegators copy matching blocks into sub-agent prompts as `## Project Standards (auto-resolved)`.

### branch-pr
- Use conventional commits only (feat:, fix:, chore:, etc.)
- Never add "Co-Authored-By" or AI attribution
- Verify git status and diff before creating PR
- Draft PR body with summary bullets focused on WHY

### go-testing
- Use teatest for Bubbletea TUI testing
- Prefer table-driven tests over repetitive test cases
- Mock at the dependency boundary, not internals
- Test file naming: `{package}_test.go`

### issue-creation
- Follow issue-first enforcement: create issue BEFORE any code
- Use provided templates for bug reports and feature requests
- Include reproduction steps for bugs
- Tag with appropriate metadata (priority, type)

### judgment-day
- Launch two independent blind judge sub-agents simultaneously
- Synthesize findings and apply fixes
- Re-judge until both pass or escalate after 2 iterations

### skill-creator
- Follow Agent Skills spec for new skills
- Include frontmatter with name, description, license, metadata
- Document trigger conditions clearly
- Keep skill files focused and concise

## Project Standards (auto-resolved)

### React/TypeScript Standards
- Use functional components with hooks (no class components)
- Prop types via TypeScript interfaces
- CSS via TailwindCSS utility classes
- Animation via framer-motion for complex transitions
- Test patterns: `@testing-library/react` with `render()` and `screen` queries
- Test file naming: `tests/**/*.test.{ts,tsx}`

## Project Conventions

No convention files found in project root (no AGENTS.md, CLAUDE.md, .cursorrules, etc.)

## Notes

- **Strict TDD Mode**: enabled (default - no marker found, test runner exists)
- **Test Runner**: vitest 4.1.3 — Unit and Integration tests available via @testing-library/react
- **E2E**: Not installed
- **Formatter**: Not configured (no prettier)
