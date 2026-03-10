CREATE TABLE budgets (
    id          BIGSERIAL PRIMARY KEY,
    amount      NUMERIC(19, 2) NOT NULL,
    month       INTEGER        NOT NULL CHECK (month BETWEEN 1 AND 12),
    year        INTEGER        NOT NULL,
    category_id BIGINT         NOT NULL REFERENCES categories (id) ON DELETE CASCADE,
    user_id     BIGINT         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    created_at  TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP      NOT NULL DEFAULT NOW(),
    UNIQUE (category_id, month, year, user_id)
);