-- Flyway Migration V2: Seed Default Actions
-- Updated: replaced H2-only MERGE syntax with standard INSERT ... ON CONFLICT

INSERT INTO iam_action (name, description, created_at, version)
VALUES
    ('CREATE',  'Create new entities',        CURRENT_TIMESTAMP, 0),
    ('READ',    'Read/view entities',          CURRENT_TIMESTAMP, 0),
    ('UPDATE',  'Update existing entities',   CURRENT_TIMESTAMP, 0),
    ('DELETE',  'Delete entities',             CURRENT_TIMESTAMP, 0),
    ('EXECUTE', 'Execute operations/actions', CURRENT_TIMESTAMP, 0)
ON CONFLICT (name) DO NOTHING;
