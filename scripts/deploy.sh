#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-$HOME/Simplethyzer}"
BRANCH="${BRANCH:-main}"

echo "[deploy] project dir: ${PROJECT_DIR}"
cd "${PROJECT_DIR}"

echo "[deploy] syncing branch ${BRANCH}"
git fetch origin "${BRANCH}"
git checkout "${BRANCH}"
git pull --ff-only origin "${BRANCH}"

echo "[deploy] rebuilding and starting containers"
docker compose up -d --build

echo "[deploy] done"
