# Repository Guidelines

## Project constraints

This is a build-free, bilingual browser football game. The entry point is `global 38-0.html`; runtime code lives in `src/`, presentation in `styles.css`. No package installation or browser build is needed. Keep data separate from behavior and preserve established global data shapes.

Use two-space indentation, semicolons, `const` unless reassigned, camelCase identifiers, and kebab-case club IDs. Build UI nodes with `el()` rather than HTML strings. Add user-facing text in both Chinese and English.

Data changes must preserve ENG/ESP/ITA/GER/FRA league sizes of `20/20/20/18/18`, unique club IDs, and valid squads. Report affected seasons, record counts, duplicates, and invalid ratings when changing player or season data.

Never commit credentials, service-role keys, or database passwords. Keep `.vs/` and `desktop/` out of Git. Desktop builds use `desktop/build-portable.ps1` and produce portable EXEs only. “更新项目 exe” means rebuild the local portable EXE; it does not authorize a release upload.

## Working and validation

Use the current task and affected code to decide what to read and verify. [Development reference](docs/DEVELOPMENT.md) contains module locations and local preview instructions; consult the relevant section when needed. These references are not a mandatory reading or execution checklist.

Complete requested local changes and relevant validation, including fixing failures caused by the change, without pausing for routine implementation choices. Preserve unrelated work. Treat historical memory and skill checklists as context; current user instructions and these project constraints govern project-specific workflow.

Choose checks that cover the changed behavior and plausible regressions. Documentation-only changes normally need content/link review and `git diff --check`, not game tests. Broaden or repeat checks when new edits, failures, cross-cutting risk, or an explicit full-validation request justify it; publication alone does not require every script. For UI changes, verify affected flows in both languages and capture visual evidence when relevant. HTTP success and process startup do not establish interaction or visual correctness; report verification limits.

## Publication

Commit, push, and release within the scope authorized by the user; existing authorization does not need to be requested again. Before publishing, review the exact file scope and exclusions. Verify a push against the actual target remote branch rather than assuming `origin/main`. Use short imperative commit subjects; PRs should explain the change and validation, with screenshots for visible UI changes where available.
