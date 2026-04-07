# MongoDB Backup and Restore

## Backup

Use this command to create a backup from local MongoDB:

```bash
mongodump --uri="mongodb://127.0.0.1:27017/swm" --out=./backups
```

For Docker setup:

```bash
docker exec -t swm-mongo mongodump --db swm --out /data/db/backups
```

## Restore

Restore latest backup:

```bash
mongorestore --uri="mongodb://127.0.0.1:27017/swm" --drop ./backups/swm
```

For Docker setup:

```bash
docker exec -i swm-mongo mongorestore --drop --db swm /data/db/backups/swm
```

## Recommended Practice

- Schedule daily backups and weekly restore drills.
- Encrypt offsite backups in production.
- Verify restore success using health and analytics endpoints.
