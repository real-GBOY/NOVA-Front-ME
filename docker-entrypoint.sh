#!/bin/sh
set -eu

node <<'NODE'
const fs = require('fs');

const keys = [
  'VITE_API_BASE_URL',
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_MEASUREMENT_ID',
  'VITE_FIREBASE_VAPID_KEY',
  'DEV',
];

const env = {};
for (const key of keys) {
  env[key] = process.env[key] ?? '';
}

fs.writeFileSync(
  '/app/dist/env-config.js',
  'window.__ENV__ = ' + JSON.stringify(env) + ';\n',
  'utf8'
);
NODE

exec "$@"
