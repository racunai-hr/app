#!/usr/bin/env bash
# Create or reuse Cloudflare Turnstile widget for app.racunai.hr login.
# Uses CF_DNS_API_TOKEN from Traefik (certbot all-zones token).
#
# Required token permission (add in Cloudflare Dashboard → API Tokens → Edit token):
#   Account → Turnstile → Edit
set -euo pipefail

APP_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STACK_ROOT="$(cd "$APP_ROOT/.." && pwd)"
TRAEFIK_ENV="${TRAEFIK_ENV:-/opt/stacks/traefik/.env}"
TURNSTILE_ENV="${APP_ROOT}/scripts/.env.turnstile"
CF_API="https://api.cloudflare.com/client/v4"
ZONE_NAME="${CLOUDFLARE_ZONE_NAME:-racunai.hr}"
WIDGET_NAME="${TURNSTILE_WIDGET_NAME:-racunai-app-login}"
WIDGET_DOMAINS="${TURNSTILE_WIDGET_DOMAINS:-app.racunai.hr,admin.racunai.hr,*.racunai.hr}"
WIDGET_MODE="${TURNSTILE_WIDGET_MODE:-managed}"

load_env_file() {
  local file="$1"
  [[ -f "$file" ]] || return 0
  set -a
  # shellcheck disable=SC1090
  source "$file"
  set +a
}

load_env_file "$TRAEFIK_ENV"
load_env_file "$TURNSTILE_ENV"

CF_DNS_API_TOKEN="${CF_DNS_API_TOKEN:-${CLOUDFLARE_API_TOKEN:-}}"
if [[ -z "$CF_DNS_API_TOKEN" ]]; then
  echo "CF_DNS_API_TOKEN is not set (expected in ${TRAEFIK_ENV})" >&2
  exit 1
fi

cf_api() {
  local method="$1"
  local path="$2"
  local data="${3:-}"
  local args=(-sS -X "$method" "${CF_API}${path}"
    -H "Authorization: Bearer ${CF_DNS_API_TOKEN}"
    -H "Content-Type: application/json")
  if [[ -n "$data" ]]; then
    args+=(--data "$data")
  fi
  curl "${args[@]}"
}

json_success() {
  python3 -c 'import json,sys; sys.exit(0 if json.load(sys.stdin).get("success") else 1)' <<<"$1"
}

json_get() {
  local expr="$1"
  python3 -c 'import json,sys; d=json.load(sys.stdin); '"$expr" <<<"$2"
}

die_api() {
  local action="$1"
  local resp="$2"
  echo "${action} failed" >&2
  echo "$resp" >&2
  if echo "$resp" | grep -q '"code":10000'; then
    cat >&2 <<'EOF'

Turnstile API requires Account → Turnstile → Edit on the certbot API token.
Edit token in Cloudflare Dashboard, then re-run this script.

EOF
  fi
  exit 1
}

echo "Verifying Cloudflare API token..."
verify_resp="$(cf_api GET /user/tokens/verify)"
if ! json_success "$verify_resp"; then
  die_api "Token verify" "$verify_resp"
fi
echo "Token verify OK"

echo "Resolving account ID for ${ZONE_NAME}..."
zones_resp="$(cf_api GET "/zones?name=${ZONE_NAME}&status=active")"
if ! json_success "$zones_resp"; then
  die_api "Zone lookup" "$zones_resp"
fi
ACCOUNT_ID="$(json_get 'print((d.get("result") or [{}])[0].get("account",{}).get("id",""))' "$zones_resp")"
if [[ -z "$ACCOUNT_ID" ]]; then
  echo "Could not resolve account ID for zone ${ZONE_NAME}" >&2
  exit 1
fi
echo "Account ID: ${ACCOUNT_ID}"

echo "Listing Turnstile widgets..."
list_resp="$(cf_api GET "/accounts/${ACCOUNT_ID}/challenges/widgets")"
if ! json_success "$list_resp"; then
  die_api "List widgets" "$list_resp"
fi

lookup="$(python3 - <<'PY' "$list_resp" "$WIDGET_NAME" "$WIDGET_DOMAINS"
import json, sys
data = json.loads(sys.argv[1])
name = sys.argv[2]
wanted = {d.strip() for d in sys.argv[3].split(',') if d.strip()}
for w in data.get("result") or []:
    domains = set(w.get("domains") or [])
    if w.get("name") == name or wanted.intersection(domains):
        print(w.get("sitekey", ""))
        break
PY
)"
SITEKEY="$lookup"

IFS=',' read -ra DOMAIN_LIST <<< "$WIDGET_DOMAINS"
DOMAINS_JSON="$(python3 -c 'import json,sys; print(json.dumps([d.strip() for d in sys.argv[1].split(",") if d.strip()]))' "$WIDGET_DOMAINS")"

if [[ -n "$SITEKEY" ]]; then
  echo "Found existing widget sitekey: ${SITEKEY}"
  echo "Ensuring widget domains: ${WIDGET_DOMAINS}..."
  update_payload="$(python3 -c 'import json,sys; print(json.dumps({"domains":json.loads(sys.argv[1]),"mode":sys.argv[2]}))' "$DOMAINS_JSON" "$WIDGET_MODE")"
  update_resp="$(cf_api PUT "/accounts/${ACCOUNT_ID}/challenges/widgets/${SITEKEY}" "$update_payload")"
  if ! json_success "$update_resp"; then
    die_api "Update widget domains" "$update_resp"
  fi
  if [[ -n "${TURNSTILE_SECRET_KEY:-}" ]]; then
    SECRET="$TURNSTILE_SECRET_KEY"
    echo "Using secret from ${TURNSTILE_ENV} or environment"
  else
    echo "Rotating widget secret (existing widget; secret not stored locally)..."
    rotate_resp="$(cf_api POST "/accounts/${ACCOUNT_ID}/challenges/widgets/${SITEKEY}/rotate_secret" '{"invalidate_immediately":true}')"
    if ! json_success "$rotate_resp"; then
      die_api "Rotate secret" "$rotate_resp"
    fi
    SECRET="$(json_get 'print(d.get("result",{}).get("secret",""))' "$rotate_resp")"
  fi
else
  echo "Creating Turnstile widget '${WIDGET_NAME}' for ${WIDGET_DOMAINS}..."
  create_payload="$(python3 -c 'import json,sys; print(json.dumps({"name":sys.argv[1],"domains":json.loads(sys.argv[2]),"mode":sys.argv[3]}))' "$WIDGET_NAME" "$DOMAINS_JSON" "$WIDGET_MODE")"
  create_resp="$(cf_api POST "/accounts/${ACCOUNT_ID}/challenges/widgets" "$create_payload")"
  if ! json_success "$create_resp"; then
    die_api "Create widget" "$create_resp"
  fi
  SITEKEY="$(json_get 'print(d.get("result",{}).get("sitekey",""))' "$create_resp")"
  SECRET="$(json_get 'print(d.get("result",{}).get("secret",""))' "$create_resp")"
fi

if [[ -z "$SITEKEY" || -z "$SECRET" ]]; then
  echo "Missing sitekey or secret after provisioning" >&2
  exit 1
fi

echo "Site key: ${SITEKEY}"
echo "Secret key: (stored locally, not printed)"

mkdir -p "$(dirname "$TURNSTILE_ENV")"
cat > "$TURNSTILE_ENV" <<EOF
# Generated by cloudflare_turnstile_provision.sh — do not commit
NEXT_PUBLIC_TURNSTILE_SITE_KEY=${SITEKEY}
TURNSTILE_SITE_KEY=${SITEKEY}
TURNSTILE_SECRET_KEY=${SECRET}
TURNSTILE_VERIFY_ENABLED=True
EOF
chmod 600 "$TURNSTILE_ENV"

ENV_FILE="${STACK_ROOT}/.env"
COMPOSE_FILE="${STACK_ROOT}/docker-compose.yml"

upsert_env() {
  local key="$1"
  local value="$2"
  if grep -q "^${key}=" "$ENV_FILE" 2>/dev/null; then
    sed -i "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
  else
    printf '\n%s=%s\n' "$key" "$value" >> "$ENV_FILE"
  fi
}

upsert_env TURNSTILE_SECRET_KEY "$SECRET"
upsert_env TURNSTILE_SITE_KEY "$SITEKEY"
upsert_env TURNSTILE_VERIFY_ENABLED True

python3 - <<PY "$COMPOSE_FILE" "$SITEKEY"
import re, sys
path, sitekey = sys.argv[1], sys.argv[2]
text = open(path, encoding="utf-8").read()
text = re.sub(
    r'(NEXT_PUBLIC_TURNSTILE_SITE_KEY:\s*).+',
    rf'\g<1>{sitekey}',
    text,
)
text = re.sub(
    r'(- NEXT_PUBLIC_TURNSTILE_SITE_KEY=).+',
    rf'\g<1>{sitekey}',
    text,
)
open(path, "w", encoding="utf-8").write(text)
PY

echo "Updated ${ENV_FILE}, ${COMPOSE_FILE}, and ${TURNSTILE_ENV}"
echo "Done. Rebuild app-web and recreate django:"
echo "  cd ${STACK_ROOT} && docker compose build app-web && docker compose up -d app-web django"
