// Central place for required signing secrets.
// Secrets have no default values: a missing secret must stop the process rather
// than fall back to a value that is public in the source tree.

function requireSecret(name) {
  const value = process.env[name]
  if (!value || !value.trim()) {
    console.error(`[FATAL] Environment variable ${name} is required but not set. See admin-server/.env.example.`)
    process.exit(1)
  }
  return value
}

export const JWT_SECRET = requireSecret('JWT_SECRET')
export const H5_JWT_SECRET = requireSecret('H5_JWT_SECRET')
