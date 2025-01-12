CREATE DATABASE ngo;

CREATE TABLE "user"(
    id SERIAL PRIMARY KEY,  
    name VARCHAR(255),      
    email VARCHAR(255),    -- unique
    password VARCHAR(255),   
    mobile_no NUMERIC(10)    -- unique
    -- name should be LastName and  LastName
    -- admin (true/false)
    -- adress 
    -- pin 
    -- state
    -- dob
    -- Blood group

    -- *remianing*
        -- token
        -- phone/email validation
        -- reset password
);

CREATE TABLE "donor"(
    id SERIAL PRIMARY KEY,
    donor_name VARCHAR(255),
    mobile_no NUMERIC(10),
    blood_group VARCHAR(5),
    previous_donation_date DATE,
    address VARCHAR(255)
    -- approve/ reject -- from admin
    -- pin 
    -- state
    -- donor_name == FirstName and LastName
    -- DOB
    --user id
    --camp id

    -- *remianing*
        -- user - donor register
        -- user/admit - register count 
        -- user - on account page show upcoming camp to donate and donate history
        -- admin -  show donor register create new screen as per camp id show all registered details and approve it on succeussfull donate / history
);

CREATE TABLE "camp"(
    id SERIAL PRIMARY KEY,
    camp_name VARCHAR(255),
    date DATE,
    time TIME,
    address VARCHAR(255),
    State VARCHAR(255),
    PinCode VARCHAR(10)
);

CREATE TABLE "request"(
    id SERIAL PRIMARY KEY,
    FirstName VARCHAR(255),
    LastName VARCHAR(255),
    dob DATE,
    phNo TIME, -- change type time to number
    address VARCHAR(255),
    state VARCHAR(255),
    PinCode VARCHAR(10)
    --blood group
    -- approve/ reject -- from admin
    -- comment from admin
    --user id
    

    -- *remianing* 
        --user - on account page show requested blood status and requested history
        -- admin - on request page show pedding request and request history 
        --admin - for pedding request approve/reject with comment
);
