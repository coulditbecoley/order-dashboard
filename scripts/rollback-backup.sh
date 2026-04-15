#!/usr/bin/env bash
set -euo pipefail

# Rollback helper: restore from the two latest backups (main and work)
# Usage:
#   bash scripts/rollback-backup.sh --backup-main <main-backup.tar.gz> --backup-work <work-backup.tar.gz> [--dry-run] [--swap]

BACKUP_DIR="/data/.openclaw/backups"
MAIN_CURR="/data/.openclaw/workspace/order-dashboard"
WORK_CURR="/data/.openclaw/workspace/order-dashboard-work"

DRY_RUN=false
SWAP=false
MAIN_BACKUP=""
WORK_BACKUP=""

print_help(){
  echo "Usage: $0 --backup-main <main-backup> --backup-work <work-backup> [--dry-run] [--swap]";
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --backup-main)
      MAIN_BACKUP="$2"; shift 2;;
    --backup-work)
      WORK_BACKUP="$2"; shift 2;;
    --dry-run)
      DRY_RUN=true; shift;;
    --swap)
      SWAP=true; shift;;
    -h|--help)
      print_help; exit 0;;
    *)
      echo "Unknown arg: $1"; print_help; exit 1;;
  esac
done

if [[ -z "$MAIN_BACKUP" || -z "$WORK_BACKUP" ]]; then
  echo "Error: both --backup-main and --backup-work are required"; print_help; exit 1
fi

if [ "$DRY_RUN" = true ]; then
  echo "[DRY-RUN] Would verify backups exist: $MAIN_BACKUP, $WORK_BACKUP"
  echo "[DRY-RUN] Would extract to /tmp/rollback-main and /tmp/rollback-work"
  echo "[DRY-RUN] Would swap into $MAIN_CURR and $WORK_CURR if --swap specified"
  exit 0
fi

set -e
# Verify backups exist
if [ ! -f "$MAIN_BACKUP" ]; then echo "Main backup not found: $MAIN_BACKUP"; exit 1; fi
if [ ! -f "$WORK_BACKUP" ]; then echo "Work backup not found: $WORK_BACKUP"; exit 1; fi

TMP_MAIN=$(mktemp -d)
TMP_WORK=$(mktemp -d)
trap rm
