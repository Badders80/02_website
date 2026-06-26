# 02_website — run `just --list` for commands

default:
    @just --list

# Production build gate
check:
    npm run lint && npm run build