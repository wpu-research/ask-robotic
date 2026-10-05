#!/bin/sh
# Migrasyon + içerik tohumlama (idempotent), sonra sunucu. Migrasyon başarısızsa sunucu başlamaz.
set -e
if [ -n "$DATABASE_URL" ]; then
  n=0
  until (cd /app/deploy-db && node dist/deploy.js); do
    n=$((n+1))
    if [ "$n" -ge 10 ]; then echo "Migrasyon 10 denemede başarısız"; exit 1; fi
    echo "Veritabanı hazır değil, 5 sn sonra yeniden denenecek ($n/10)"; sleep 5
  done
else
  echo "UYARI: DATABASE_URL yok, migrasyon atlandı"
fi
exec node apps/web/server.js
