#!/bin/sh
set -e

echo "──────────────────────────────────────"
echo " App:     ${APP_VERSION:-unknown}"
echo " Env:     ${ENV:-production}"
echo " Node:    $(node --version)"
echo "──────────────────────────────────────"

# ── Guard: required env vars ─────────────────────────────────────────────────
: "${DATABASE_URL:?❌  DATABASE_URL is not set. Aborting.}"

# -- Log the database url for debugging
echo "▶ Database URL: ${DATABASE_URL}"

# ── Prisma migrations ─────────────────────────────────────────────────────────
echo "▶ Running Prisma migrations..."
npm run prisma:migrate

echo "▶ Starting application..."
exec "$@"\n