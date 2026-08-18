#!/bin/bash
set -e

# Run database migrations
echo "Running database migrations..."
yarn db:update

# Start the application
echo "Starting the application..."
exec yarn prod