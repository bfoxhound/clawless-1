# Contributing to ClawLess

Thank you for your interest in contributing to ClawLess! We welcome contributions from the community and are grateful for any time you can dedicate to improving this project.

## How to Contribute

1. **Fork** the repository on GitHub.
2. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes** with a clear message:
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to your branch**:
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request** against the `main` branch.

## Development Setup

```bash
git clone https://github.com/open-gitagent/clawless.git
cd clawless
npm install
npm run dev
```

The project uses **Vite + TypeScript**. All source code is located in the `src/` directory.

## Project Structure

| File | Description |
|------|-------------|
| `src/sdk.ts` | Main SDK facade (ClawContainer class) |
| `src/container.ts` | WebContainer orchestration |
| `src/policy.ts` | Policy engine |
| `src/audit.ts` | Audit logging |
| `src/git-service.ts` | GitHub API integration |
| `src/plugin.ts` | Plugin manager |
| `src/ui.ts` | UI manager |
| `src/terminal.ts` | Terminal manager |
| `src/templates.ts` | Template system |
| `src/net-intercept.ts` | Browser network interception |
| `src/network-hook.ts` | Node.js network hook |

## Code Style

- **TypeScript strict mode** is enabled. Do not disable it.
- **ES2022** is the compilation target.
- Use the **typed event emitter pattern** for component communication.
- Prefer **explicit types** over `any`. If you must use `any`, add a comment explaining why.

## Issue Reporting

Before opening a new issue, please:

1. **Search existing issues** to avoid duplicates.
2. When filing a bug report, include:
   - **Browser version** and operating system.
   - **Steps to reproduce** the issue.
   - **Expected behavior** versus **actual behavior**.
   - Any relevant error messages or console output.

## Pull Request Guidelines

- **Keep PRs focused and small.** One feature or fix per PR makes review easier.
- **Add tests** if applicable to cover new functionality or bug fixes.
- **Update documentation** for any API changes or new features.
- **Ensure `npm run build` passes** before submitting your PR.

## License

By contributing to ClawLess, you agree that your contributions will be licensed under the **MIT License**.
