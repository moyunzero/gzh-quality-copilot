# Security Policy

## Scope

This project is a **local** Agent Skill + Chrome MV3 extension. It does not run a cloud backend for your article data.

## Reporting a vulnerability

Please open a [GitHub Security Advisory](https://github.com/moyunzero/gzh-quality-copilot/security/advisories/new) (preferred) or a private report to the maintainer via GitHub.

Do **not** file a public Issue with exploit details for:

- Extension permission escalation beyond the frozen manifest
- Data exfiltration paths that upload account data to third parties introduced by this repo

## What is intentional

- Extension permissions are frozen to `downloads`, `tabs`, `scripting` and host `https://mp.weixin.qq.com/*` only (see README).
- Article `body` is never scraped by the extension; missing fields go to `_missing`.
- Content you paste into an Agent may leave your machine via **your** chosen model provider — that is outside this repository.

## Supported versions

Only the default branch (`main`) is supported for security fixes.
