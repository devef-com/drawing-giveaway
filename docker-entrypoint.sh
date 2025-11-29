#!/bin/sh
set -e

# Run database migrations if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
  echo "Running database migrations..."
  npx drizzle-kit migrate || echo "Migration skipped or failed - continuing anyway"
fi

# Execute the main command
exec "$@"
