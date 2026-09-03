#!/usr/bin/env bash
#
# Renders config/config.json from the template + secrets in .env, seeds the
# Postgres init script, then builds and (re)starts the stack.
#
# Run this on the deployment host from /opt/miningcore:
#   ./deploy.sh
#
# Re-run any time after editing .env, config.template.json or pulling new
# source into ./repo - it re-renders the config and rebuilds as needed.

set -euo pipefail
cd "$(dirname "$0")"

if [[ ! -f .env ]]; then
    echo "error: .env not found. Copy .env.example to .env and fill in the values." >&2
    exit 1
fi

set -a
# shellcheck disable=SC1091
source ./.env
set +a

: "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD must be set in .env}"
: "${POOL_ADDRESS:?POOL_ADDRESS must be set in .env (a Cascoin wallet address owned by the daemon)}"
: "${RPC_USER:?RPC_USER must be set in .env (from cascoin.conf on the wallet host)}"
: "${RPC_PASSWORD:?RPC_PASSWORD must be set in .env (from cascoin.conf on the wallet host)}"

echo "==> Rendering config/config.json"
mkdir -p config initdb
# Literal, character-safe substitution via python (handles any special chars in secrets)
POSTGRES_PASSWORD="$POSTGRES_PASSWORD" POOL_ADDRESS="$POOL_ADDRESS" \
RPC_USER="$RPC_USER" RPC_PASSWORD="$RPC_PASSWORD" \
python3 - <<'PY'
import os
tpl = open("config/config.template.json").read()
repl = {
    "__PG_PASSWORD__":  os.environ["POSTGRES_PASSWORD"],
    "__POOL_ADDRESS__": os.environ["POOL_ADDRESS"],
    "__RPC_USER__":     os.environ["RPC_USER"],
    "__RPC_PASSWORD__": os.environ["RPC_PASSWORD"],
}
for k, v in repl.items():
    tpl = tpl.replace(k, v)
import json
json.loads(tpl)  # fail fast if a secret broke the JSON
open("config/config.json", "w").write(tpl)
print("    config/config.json written and validated")
PY
chmod 600 config/config.json

echo "==> Seeding Postgres init script"
cp repo/src/Miningcore/Persistence/Postgres/Scripts/createdb.sql initdb/01-createdb.sql
# Postgres runs as uid 999 inside the container and must be able to read the
# init script (it contains only schema, no secrets).
chmod 755 initdb
chmod 644 initdb/01-createdb.sql

echo "==> Building images"
docker compose build

echo "==> Starting stack"
docker compose up -d

echo "==> Done. Follow logs with: docker compose logs -f miningcore"
