-- Drop if exists for reruns
DROP TABLE IF EXISTS payments, subscriptions, plans, organizations, users CASCADE;

-- Organizations table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Plans table
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Subscriptions table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES plans(id),
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(20) CHECK (status IN ('active', 'cancelled', 'past_due')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(50),
    status VARCHAR(20) CHECK (status IN ('success', 'failed', 'pending'))
);

-- Insert some sample data
INSERT INTO organizations (id, name) VALUES
    ('11111111-1111-1111-1111-111111111111', 'OpenAI Org'),
    ('22222222-2222-2222-2222-222222222222', 'Hacker Inc');

INSERT INTO users (organization_id, name, email, is_admin) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Alice', 'alice@openai.com', TRUE),
    ('11111111-1111-1111-1111-111111111111', 'Bob', 'bob@openai.com', FALSE),
    ('22222222-2222-2222-2222-222222222222', 'Charlie', 'charlie@hacker.com', TRUE);

INSERT INTO plans (id, name, price) VALUES
    ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Starter', 9.99),
    ('aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Pro', 29.99),
    ('aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Enterprise', 99.99);

INSERT INTO subscriptions (organization_id, plan_id, start_date, status) VALUES
    ('11111111-1111-1111-1111-111111111111', 'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-01-01', 'active'),
    ('22222222-2222-2222-2222-222222222222', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-03-10', 'cancelled');

INSERT INTO payments (subscription_id, amount, payment_method, status) VALUES
    (
        (SELECT id FROM subscriptions WHERE organization_id = '11111111-1111-1111-1111-111111111111'),
        29.99,
        'credit_card',
        'success'
    ),
    (
        (SELECT id FROM subscriptions WHERE organization_id = '22222222-2222-2222-2222-222222222222'),
        9.99,
        'paypal',
        'failed'
    );
