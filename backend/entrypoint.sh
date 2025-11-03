#!/usr/bin/env bash
set -e
# wait for database to be available
if [ "$DATABASE_URL" != "" ]; then
  echo "Waiting for database to be ready..."
  sleep 2
fi

# run migrations
python manage.py migrate --noinput
# run uvicorn
exec uvicorn api.asgi:application --host "$SERVER_HOST" --port "$SERVER_PORT"
