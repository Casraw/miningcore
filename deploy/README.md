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

- `80/tcp`, `443/tcp` Traefik edge router (public). Terminates TLS and serves
  the dashboard + API. HTTP is redirected to HTTPS.
- `4066/tcp` Cascoin SHA256d stratum (public, raw TCP - not via Traefik)
- `4067/tcp` Cascoin MinotaurX stratum (public, raw TCP - not via Traefik)
- `4000/tcp` REST API - bound to `127.0.0.1` only for local debugging. Public
  access is served through Traefik at `https://<domain>/api`.

## Dashboard + Traefik

The stack ships a web dashboard (React SPA in `repo/web`) served by nginx, with
Traefik in front handling TLS:

```
https://new.mining-pool.io/               -> dashboard (SPA)
https://new.mining-pool.io/api/...         -> miningcore REST API (port 4000)
https://new.mining-pool.io/notifications   -> miningcore websocket feed
```

Requirements before the first deploy:

1. A DNS **A record** for `DASHBOARD_DOMAIN` (default `new.mining-pool.io`)
   pointing at this host's public IP. Let's Encrypt uses an HTTP-01 challenge on
   port 80, so the domain must resolve here first or certificate issuance fails.
2. Ports `80` and `443` open in the firewall.

Relevant `.env` knobs (all optional, defaults in `.env.example`):
`DASHBOARD_DOMAIN`, `ACME_EMAIL`, `STRATUM_HOST`.

The dashboard is a static build: the stratum host and `/api` base are baked in
at image build time from the compose `args`, so rebuild (`./deploy.sh`) after
changing `STRATUM_HOST` or the domain.

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
