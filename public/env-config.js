// Runtime env overrides for Docker deployments (populated by docker-entrypoint.sh).
// On Vercel this file is served as-is; leave it empty and set env vars
// (e.g. VITE_API_BASE_URL) in the Vercel project settings instead, which
// get baked in at build time via import.meta.env.
window.__ENV__ = {};
