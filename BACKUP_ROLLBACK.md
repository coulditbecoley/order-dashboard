# Backup & Rollback Plan

## Current Backups

| Backup | Path | Size |
|--------|------|------|
| Main repo snapshot | `/data/.openclaw/backups/order-dashboard-main-20260415-125401Z.tar.gz` | ~173MB |
| Work repo snapshot | `/data/.openclaw/backups/order-dashboard-work-20260415-125401Z.tar.gz` | ~16MB |

## Git Tag

- **Tag:** `v1.0-belt-clip-stable`
- **Commit:** `bad11e8` (belt-clip-fixes-2 merged into main)
- **Description:** Stable baseline with belt-clip update, lint clean, build passing

## Rollback Options

### Option 1: Git rollback (fastest)

```bash
cd /data/.openclaw/workspace/order-dashboard-work
git checkout v1.0-belt-clip-stable
# Or reset main to the tag:
git reset --hard v1.0-belt-clip-stable
git push --force origin main
```

### Option 2: Tarball restore

```bash
# Dry run first
bash scripts/rollback-backup.sh \
  --backup-main /data/.openclaw/backups/order-dashboard-main-20260415-125401Z.tar.gz \
  --backup-work /data/.openclaw/backups/order-dashboard-work-20260415-125401Z.tar.gz \
  --dry-run

# Execute swap
bash scripts/rollback-backup.sh \
  --backup-main /data/.openclaw/backups/order-dashboard-main-20260415-125401Z.tar.gz \
  --backup-work /data/.openclaw/backups/order-dashboard-work-20260415-125401Z.tar.gz \
  --swap
```

### Option 3: Vercel rollback

Go to [Vercel Dashboard](https://vercel.com/coulditbecoleys-projects/order-dashboard-v3) → Deployments → find the last known-good deployment → Promote to Production.

## Backup Policy

- Create a new backup before each major merge to main
- Retain the last 3 backup snapshots
- Tag each stable release in git (e.g., `v1.0-belt-clip-stable`, `v1.1-mag-hw-reorder`)
- Keep GitHub Releases pointing to stable tags for external archiving
