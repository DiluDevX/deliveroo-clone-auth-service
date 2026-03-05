#!/bin/sh
set -e

echo "──────────────────────────────────────"
echo " App:     ${APP_VERSION:-unknown}"
echo " Env:     ${ENV:-production}"
echo " Node:    $(node --version)"
echo "──────────────────────────────────────"

# ── Guard: required env vars ─────────────────────────────────────────────────
: "${DATABASE_URL:?❌  DATABASE_URL is not set. Aborting.}"

# ── Log environment variables ────────────────────────────────────────────────
echo ""
echo "📋 Environment Variables:"
echo "  PORT:                        ${PORT:-3000}"
echo "  NODE_ENV:                    ${NODE_ENV:-development}"
echo "  SERVICE_NAME:                ${SERVICE_NAME:-unknown}"
echo "  APP_URL:                     ${APP_URL:-unknown}"
echo "  COMPANY_NAME:                ${COMPANY_NAME:-unknown}"
echo "  LOG_LEVEL:                   ${LOG_LEVEL:-info}"
echo "  JWT_EXPIRES_IN:              ${JWT_EXPIRES_IN:-15} minutes"
echo "  JWT_REFRESH_EXPIRES_IN:      ${JWT_REFRESH_EXPIRES_IN:-7} days"
echo "  JWT_RESET_PASSWORD_EXPIRES_IN: ${JWT_RESET_PASSWORD_EXPIRES_IN:-1} hours"
echo "  DATABASE_URL:                ***MASKED***"
echo "  JWT_SECRET:                  ***MASKED***"
echo "  DELIVEROO_CLONE_API_KEY:     ***MASKED***"
echo "  RESEND_API_KEY:              ***MASKED***"
echo ""

echo "▶ Starting application..."
exec "$@"