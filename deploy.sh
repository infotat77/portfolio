#!/bin/bash
# Vercel APIで直接デプロイ（CLIの一時ディスク問題を回避）

set -e

TEAM_ID="team_6BIkJWyxR1hWew7Nv5u602uv"
AUTH_FILE="$HOME/Library/Application Support/com.vercel.cli/auth.json"
PORTFOLIO_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "▌ Portfolio デプロイ開始..."

python3 - <<EOF
import json, hashlib, requests, time, sys
from pathlib import Path

auth = json.loads(Path("$AUTH_FILE").read_text())
token = list(auth.get('tokens', {}).values())[0] if auth.get('tokens') else auth.get('token','')
if not token:
    print("ERROR: Vercel認証トークンが見つかりません")
    sys.exit(1)

headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
team_id = "$TEAM_ID"
base    = Path("$PORTFOLIO_DIR")

# ── ファイル収集・アップロード ──
skip = {".git", ".vercel", ".DS_Store", "deploy.sh", "node_modules"}
files = []
for p in sorted(base.rglob("*")):
    if not p.is_file():
        continue
    if any(s in str(p) for s in skip):
        continue
    content = p.read_bytes()
    sha     = hashlib.sha1(content).hexdigest()
    rel     = str(p.relative_to(base))
    files.append({"file": rel, "sha": sha, "size": len(content)})
    r = requests.post(
        f"https://api.vercel.com/v2/files?teamId={team_id}",
        headers={**headers, "Content-Type": "application/octet-stream", "x-vercel-digest": sha},
        data=content, timeout=15,
    )

print(f"  {len(files)} ファイルをアップロード")

# ── デプロイ作成 ──
r = requests.post(
    f"https://api.vercel.com/v13/deployments?teamId={team_id}&forceNew=1",
    headers=headers,
    json={"name": "project-410h5", "files": files, "target": "production"},
    timeout=30,
)
data = r.json()
if data.get('error'):
    print(f"ERROR: {data['error']}")
    sys.exit(1)

dep_id  = data.get('id','')
dep_url = data.get('url','')
print(f"  デプロイID: {dep_id}")
print(f"  URL: https://{dep_url}")

# ── 完了待機 ──
print("  ビルド待機中", end="", flush=True)
for _ in range(30):
    time.sleep(3)
    r = requests.get(
        f"https://api.vercel.com/v13/deployments/{dep_id}?teamId={team_id}",
        headers=headers, timeout=10,
    )
    state = r.json().get('readyState','')
    print(".", end="", flush=True)
    if state == 'READY':
        print(f"\n✓ デプロイ完了 → https://project-410h5.vercel.app")
        break
    elif state == 'ERROR':
        print(f"\nERROR: デプロイ失敗")
        sys.exit(1)
else:
    print(f"\n? タイムアウト（Vercelダッシュボードで確認してください）")
EOF
