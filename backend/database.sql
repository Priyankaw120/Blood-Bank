CREATE DATABASE ngo;

CREATE TABLE "user"(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    mobile_no NUMERIC(10) UNIQUE,
    is_admin BOOLEAN DEFAULT false,
    address VARCHAR(255),
    pin NUMERIC(6),
    state VARCHAR(50),
    dob DATE,
    blood_group VARCHAR(5),
    verified BOOLEAN DEFAULT false
);

CREATE TABLE "camp"(
    id SERIAL PRIMARY KEY,
    camp_name VARCHAR(255),
    date DATE,
    time TIME,
    address VARCHAR(255),
    state VARCHAR(50),
    pin VARCHAR(6)
);

CREATE TABLE "donor"(
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "user" (id),
    camp_id INTEGER REFERENCES "camp" (id),
    donor_name VARCHAR(255),
    mobile_no NUMERIC(10),
    blood_group VARCHAR(5),
    previous_donation_date DATE,
    approval BOOLEAN DEFAULT false
);

CREATE TABLE "request"(
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    dob DATE,
    mobile_no NUMERIC(10),
    address VARCHAR(255),
    state VARCHAR(255),
    pin VARCHAR(10),
    blood_group VARCHAR(5),
    approval BOOLEAN DEFAULT false,
    comment TEXT [],
    user_id INTEGER REFERENCES "user" (id)
);
