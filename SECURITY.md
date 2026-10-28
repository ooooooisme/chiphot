# Security

## Secrets and configuration

- **Never commit secrets** to git: API keys, database passwords, admin credentials, cookies, tokens, or production dumps.
- **`.env` is local only.** This repository’s `.gitignore` excludes `.env` and `.env.*`. Copy from `.env.example` for local setup; do not add real values to tracked files.
- Remove or redact sensitive data from logs, screenshots, and issue/PR descriptions before sharing.

## Reporting a vulnerability

If you find a security issue (auth bypass, secret exposure, injection, or similar) in **ChipHOT** ([ooooooisme/chiphot](https://github.com/ooooooisme/chiphot)):

1. **Prefer** [GitHub private security advisories](https://github.com/ooooooisme/chiphot/security/advisories/new) for this repository.
2. If that is unavailable, open a minimal report via GitHub Issues and ask maintainers to move the thread private—**do not** post exploit details publicly.

Include:

- Affected commit or release, deployment context, and environment (without secrets);
- Minimal steps to reproduce in an environment you are allowed to test;
- Likely impact, with redacted logs or screenshots.

Do **not** disclose exploitable details in public issues, discussions, or pull requests before a fix is agreed.

## Scope

Security fixes are validated on the latest `main` of this fork unless maintainers state otherwise. There is no guaranteed response-time SLA.

For general bugs and usage questions, use GitHub Issues or Discussions on this repository—not security advisories.
