# 02_website — run `just --list` for commands

default:
    @just --list

# Fail if secret dumps reappear at website root (AGENTS law 8)
secrets-check:
    python3 scripts/check_secrets_layout.py

# Production build gate
check: secrets-check
    npm run lint && npm run build