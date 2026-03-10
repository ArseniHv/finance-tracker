CREATE TABLE transactions (
    id          BIGSERIAL PRIMARY KEY,
    amount      NUMERIC(19, 2) NOT NULL,
    type        VARCHAR(10)    NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    description VARCHAR(500),
    date        DATE           NOT NULL,
    category_id BIGINT         REFERENCES categories (id) ON DELETE SET NULL,
    user_id     BIGINT         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    created_at  TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_id ON transactions (user_id);
CREATE INDEX idx_transactions_date    ON transactions (date);
CREATE INDEX idx_transactions_type    ON transactions (type);