#!/bin/sh
set -e

if [ -d /app/.next/static-seed ]; then
  rm -rf /app/.next/static
  ln -s /app/.next/static-seed /app/.next/static
fi

if [ -d /app/public-seed ]; then
  rm -rf /app/public
  ln -s /app/public-seed /app/public
fi

exec node server.js
