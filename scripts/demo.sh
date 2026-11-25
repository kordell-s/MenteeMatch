#!/usr/bin/env bash
# MentorMatch demo helper.
#   scripts/demo.sh start   start the database and the app (http://localhost:3000)
#   scripts/demo.sh reset   wipe and reseed the demo data (run before presenting)
#   scripts/demo.sh stop    stop the app and the database
set -euo pipefail
cd "$(dirname "$0")/.."

PGDATA="$HOME/Library/Application Support/mentormatch-demo-pg"
PGPORT=5544
export LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8

db_up() {
  if ! /opt/homebrew/bin/pg_ctl -D "$PGDATA" status >/dev/null 2>&1; then
    /opt/homebrew/bin/pg_ctl -D "$PGDATA" -o "-p $PGPORT" -l "$PGDATA/server.log" -w start
  fi
  echo "Database running on port $PGPORT"
}

case "${1:-}" in
  start)
    db_up
    [ -f .next/BUILD_ID ] || npm run build
    echo "Starting MentorMatch at http://localhost:3000 (Ctrl+C to stop)"
    npm run start
    ;;
  reset)
    db_up
    set -a; . ./.env; set +a
    npx prisma db push --skip-generate >/dev/null
    npm run seed | grep -E "✅|❌|password"
    ;;
  stop)
    pkill -f "next start" || true; pkill -f "next-server" || true
    /opt/homebrew/bin/pg_ctl -D "$PGDATA" stop || true
    ;;
  *)
    echo "Usage: scripts/demo.sh start | reset | stop"; exit 1 ;;
esac
