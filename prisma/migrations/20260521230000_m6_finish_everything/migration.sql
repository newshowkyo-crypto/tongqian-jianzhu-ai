CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT role_permissions_role_id_permission_id_key UNIQUE (role_id, permission_id)
);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);

CREATE TABLE IF NOT EXISTS secrets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  provider text NOT NULL,
  category text NOT NULL,
  mode text NOT NULL DEFAULT 'mock',
  encrypted_value text NOT NULL,
  masked_value text,
  health_status text NOT NULL DEFAULT 'mock',
  schema jsonb NOT NULL DEFAULT '{}',
  kms_level text NOT NULL DEFAULT 'dev',
  last_switched_at timestamptz,
  last_tested_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_secrets_provider_category ON secrets(provider, category);

CREATE TABLE IF NOT EXISTS metrics_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_key text NOT NULL,
  metric_value numeric(18,6) NOT NULL,
  unit text NOT NULL,
  dimensions jsonb NOT NULL DEFAULT '{}',
  captured_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_metrics_snapshots_metric_key_captured_at ON metrics_snapshots(metric_key, captured_at);

CREATE TABLE IF NOT EXISTS qualification_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id text NOT NULL,
  category text NOT NULL,
  sub_type text,
  level text NOT NULL,
  cert_no text NOT NULL UNIQUE,
  issued_at timestamptz NOT NULL,
  valid_until timestamptz NOT NULL,
  issuer text NOT NULL,
  raw_image_url text NOT NULL,
  status text NOT NULL,
  meta jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_qualification_certificates_tenant_id_valid_until ON qualification_certificates(tenant_id, valid_until);
