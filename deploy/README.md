# Miningcore deployment

Docker Compose stack for running Miningcore against the Cascoin daemon on the
internal network, with PostgreSQL for persistence.

## Layout (on the host, /opt/miningcore)

```
docker-compose.yml          stack definition
deploy.sh                   renders config + builds + starts
.env                        secrets (git-ignored, chmod 600)
.env.example                template for .env
config/config.template.json config with __PLACEHOLDERS__ (tracked)
config/config.json          rendered config with secrets (git-ignored)
initdb/01-createdb.sql       schema, auto-applied on first DB init (git-ignored)
repo/                        Miningcore source = Docker build context
```

## Topology

- Miningcore host: `10.0.0.1` (public `75.119.129.184`)
- Cascoin daemon:  `10.0.0.2:45789` (internal network only)
- Postgres:        internal compose network, volume `pgdata` (not published)

## First deploy

```bash
cd /opt/miningcore
cp .env.example .env
# edit .env: POSTGRES_PASSWORD, POOL_ADDRESS, RPC_USER, RPC_PASSWORD
./deploy.sh
docker compose logs -f miningcore
```

The Postgres schema is created automatically the first time the `pgdata` volume
is initialised (from `initdb/`). It is NOT re-applied on later starts.

## Ports

- `4066/tcp` Cascoin SHA256d stratum (public)
- `4067/tcp` Cascoin MinotaurX stratum (public)
- `4000/tcp` REST API - bound to `127.0.0.1` only. Put a reverse proxy in front
  to expose it publicly.

## Adding another pool later

The config is a single JSON file with a `pools` array - adding a pool needs no
database changes (the schema is not partitioned per pool).

1. Add the coin template to `repo/src/Miningcore/coins.json` if it is not
   already supported, and rebuild (`./deploy.sh` rebuilds the image).
2. Append a new object to `pools` in `config/config.template.json`. Give it a
   unique `id` and a **unique stratum port** (two pools may never share a port).
3. Publish the new port in `docker-compose.yml` under the `miningcore` service.
4. Re-run `./deploy.sh` and `docker compose up -d`.

## Notes

- Secrets live only in `.env` and the rendered `config/config.json`, both
  git-ignored and root-owned. Never commit them.
- The daemon must be fully synced (`initialblockdownload: false`) before block
  templates can be produced; until then Miningcore logs retries.
- Native hashing libs are built with `-march=native`, so the image is tuned to
  this host's CPU. Rebuild if you move it to different hardware.
