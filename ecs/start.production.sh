#!/bin/bash
set -e

# Ensure APP_ENV is set
if [ -z "$APP_ENV" ]; then
  echo "Error: APP_ENV is not set. Please export APP_ENV as 'beta' or 'prod'."
  exit 1
fi

# Run database migrations
echo "Running database migrations for '$APP_ENV'..."
if [ "$APP_ENV" = "beta" ]; then
  yarn db:update:beta
elif [ "$APP_ENV" = "production" ]; then
  yarn db:update:prod
else
  echo "Error: Unknown APP_ENV '$APP_ENV'. Starting production env:"
  yarn db:update:prod
fi

# Start the application
echo "Starting the application..."
exec yarn prod