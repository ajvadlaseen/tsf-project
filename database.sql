CREATE DATABASE spark;

CREATE TABLE accounts(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    balance INT DEFAULT 0
);

CREATE TABLE transactions (
    transaction_id serial PRIMARY KEY,
    sender VARCHAR (255) NOT NULL,
    receiver VARCHAR (255) NOT NULL,
    amount INT NOT NULL,
    timestamp timestamp default current_timestamp
);