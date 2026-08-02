# clawless-1

Fork of [open-gitagent/clawless](https://github.com/open-gitagent/clawless) —
"clawcontainer", a serverless browser-based runtime for Claw AI Agents
powered by WebContainers.

## Stack
- TypeScript, Vite (`vite.config.ts`, builds to `dist/sdk.js` + `dist/sdk.d.ts`)
- `@webcontainer/api` — browser-based WebContainer runtime
- `@xterm/xterm` + `@xterm/addon-fit` — in-browser terminal
- `monaco-editor` — in-browser code editor
- `jszip` — client-side zip handling
- No test suite or CI workflow detected at scaffold time

## TODO for Jenny
- Confirm whether this fork tracks upstream (`open-gitagent/clawless`) or
  diverges intentionally — no `CLAUDE.md` existed to record that decision.
- No CI/workflow files found in `.github/workflows/` — add if this repo
  needs automated checks.
