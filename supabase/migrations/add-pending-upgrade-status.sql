-- Add new status types for the payment_status column in the subscriptions table

-- First, check what type is currently used for payment_status
DO $$
DECLARE
    col_type text;
BEGIN
    SELECT data_type INTO col_type
    FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'payment_status';
    
    -- If it's a text column, we can just proceed with whatever values we want
    IF col_type = 'text' THEN 
        RAISE NOTICE 'payment_status is type TEXT, no type update needed';
    -- If it's an enum, we need to alter the enum type
    ELSIF col_type = 'USER-DEFINED' THEN
        -- Get the type name
        DECLARE
            type_name text;
        BEGIN
            SELECT t.typname INTO type_name
            FROM pg_type t
            JOIN pg_attribute a ON a.atttypid = t.oid
            JOIN pg_class c ON c.oid = a.attrelid
            WHERE c.relname = 'subscriptions' AND a.attname = 'payment_status';
            
            IF type_name IS NOT NULL THEN
                -- Add the new values to the enum type
                EXECUTE format('ALTER TYPE %I ADD VALUE IF NOT EXISTS ''pending_upgrade''', type_name);
                EXECUTE format('ALTER TYPE %I ADD VALUE IF NOT EXISTS ''payment_failed''', type_name);
                RAISE NOTICE 'Added new values to enum type %', type_name;
            ELSE
                RAISE NOTICE 'Could not determine enum type name';
            END IF;
        END;
    ELSE
        RAISE NOTICE 'payment_status is type %, not handling this case', col_type;
    END IF;
END
$$;

-- If using the subscriptions_payment_status_enum as the convention
ALTER TYPE IF EXISTS subscription_status ADD VALUE IF NOT EXISTS 'payment_failed';

-- Add a comment to the column to document the possible values
COMMENT ON COLUMN subscriptions.payment_status IS 'Payment status: active, canceled, expired, pending, pending_upgrade, payment_failed';

-- Add a migration comment
COMMENT ON DATABASE postgres IS 'Added pending_upgrade and payment_failed status to payment_status'; 