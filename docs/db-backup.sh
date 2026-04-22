#!/bin/bash
# Mission Control DB Backup Script
# Run daily via cron: 0 3 * * * /home/ubuntu/wlp/projects/mission-control/docs/db-backup.sh
# Backs up SQLite DB + exports agent state to GitHub JSON

set -e

DB_PATH="/home/ubuntu/wlp/projects/mission-control/mission-control.db"
BACKUP_DIR="/home/ubuntu/wlp/projects/mission-control/backups"
EXPORT_PATH="/home/ubuntu/wlp/projects/mission-control/public/data/agent-status-snapshot.json"

mkdir -p "$BACKUP_DIR"

# 1. File copy backup (fast, consistent with WAL)
DATE=$(date +%Y%m%d)
BACKUP_FILE="$BACKUP_DIR/mission-control-$DATE.db"

# Use SQLite .backup command for consistent copy (WAL-safe)
python3 -c "
import sqlite3, shutil, os
src = '$DB_PATH'
dst = '$BACKUP_FILE'
conn = sqlite3.connect(src)
backup = sqlite3.connect(dst)
conn.backup(backup)
backup.close()
conn.close()
print(f'DB backed up to {dst} ({os.path.getsize(dst)} bytes)')
"

# 2. Export agent state to JSON (for GitHub version control)
python3 -c "
import sqlite3, json, datetime

conn = sqlite3.connect('$DB_PATH')
conn.row_factory = sqlite3.Row
c = conn.cursor()

c.execute('SELECT * FROM agent_current_state ORDER BY agent_name')
agents = [dict(r) for r in c.fetchall()]

c.execute('SELECT * FROM agent_status_log ORDER BY timestamp DESC LIMIT 100')
log = [dict(r) for r in c.fetchall()]

snapshot = {
    'generated': datetime.datetime.utcnow().isoformat() + 'Z',
    'agents': agents,
    'recent_log': log
}

with open('$EXPORT_PATH', 'w') as f:
    json.dump(snapshot, f, indent=2)

conn.close()
print(f'Agent state exported to $EXPORT_PATH')
"

# 3. Remove backups older than 30 days
find "$BACKUP_DIR" -name "*.db" -mtime +30 -delete

echo "Backup complete: $BACKUP_FILE"
